
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "../../../../generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_TAG = "[Alliance Showdown API]";

function jsonError(
  message: string,
  status: number,
  code: string,
) {
  return NextResponse.json(
    { error: message, code },
    { status },
  );
}

function getErrorCode(error: unknown): string | undefined {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError
  ) {
    return error.code;
  }

  return undefined;
}

function handleApiError(error: unknown, operation: string) {
  console.error(`${API_TAG} ${operation} failed:`, error);

  const code = getErrorCode(error);

  if (code === "P2021" || code === "P2022") {
    return jsonError(
      "Tabel atau kolom database belum tersedia. Periksa migrasi Prisma.",
      503,
      "DATABASE_SCHEMA_NOT_READY",
    );
  }

  if (code === "P1001" || code === "P1002") {
    return jsonError(
      "Database tidak dapat dijangkau. Periksa koneksi PostgreSQL.",
      503,
      "DATABASE_UNAVAILABLE",
    );
  }

  return jsonError(
    `Gagal ${operation === "load" ? "memuat" : "menyimpan"} progress Alliance Showdown.`,
    500,
    operation === "load"
      ? "LOAD_PROGRESS_FAILED"
      : "SAVE_PROGRESS_FAILED",
  );
}

async function getAuthenticatedUser() {
  const session = await auth();
  const discordId = session?.user?.id;

  if (!discordId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { discordId },
    select: { id: true },
  });
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Sesi Discord tidak tersedia atau user belum terdaftar di database.",
        401,
        "UNAUTHORIZED",
      );
    }

    const progress = await prisma.allianceShowdownProgress.findUnique({
      where: { userId: user.id },
      select: {
        data: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      data: progress?.data ?? null,
      updatedAt: progress?.updatedAt ?? null,
    });
  } catch (error) {
    return handleApiError(error, "load");
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return jsonError(
        "Sesi Discord tidak tersedia atau user belum terdaftar di database.",
        401,
        "UNAUTHORIZED",
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return jsonError(
        "Request body bukan JSON yang valid.",
        400,
        "INVALID_JSON",
      );
    }

    if (!body || typeof body !== "object" || !("data" in body)) {
      return jsonError(
        "Properti data wajib diisi.",
        400,
        "INVALID_BODY",
      );
    }

    const data = body.data;

    if (
      data === null ||
      typeof data !== "object" ||
      Array.isArray(data)
    ) {
      return jsonError(
        "Progress harus berupa objek JSON.",
        400,
        "INVALID_PROGRESS",
      );
    }

    const serialized = JSON.stringify(data);

    if (!serialized || serialized.length > 1_000_000) {
      return jsonError(
        "Ukuran progress tidak valid atau terlalu besar.",
        413,
        "PROGRESS_TOO_LARGE",
      );
    }

    const progressData = JSON.parse(
      serialized,
    ) as Prisma.InputJsonValue;

    const saved = await prisma.allianceShowdownProgress.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        data: progressData,
      },
      update: {
        data: progressData,
      },
      select: {
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      updatedAt: saved.updatedAt,
    });
  } catch (error) {
    return handleApiError(error, "save");
  }
}
