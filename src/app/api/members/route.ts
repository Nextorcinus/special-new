import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type MemberEventDataRecord = {
	id: string;
	eventType: string;
	data: unknown;
	createdAt: Date;
	updatedAt: Date;
};

type MemberRecord = {
	id: string;
	name: string;
	furnace: number;
	power: bigint | null;
	createdAt: Date;
	updatedAt: Date;
	eventData: MemberEventDataRecord[];
};

function serializeEventData(eventData: MemberEventDataRecord[]) {
	return eventData.map((item) => ({
		id: item.id,
		eventType: item.eventType,
		data: item.data,
		createdAt: item.createdAt.toISOString(),
		updatedAt: item.updatedAt.toISOString(),
	}));
}

function serializeMember(member: MemberRecord) {
	return {
		id: member.id,
		name: member.name,
		furnace: member.furnace,
		power: member.power?.toString() ?? null,
		eventData: serializeEventData(member.eventData ?? []),
		createdAt: member.createdAt.toISOString(),
		updatedAt: member.updatedAt.toISOString(),
	};
}

function parsePower(value: unknown): bigint | null {
	if (value === null || value === undefined) {
		return null;
	}

	const raw = String(value).trim();

	if (!raw) {
		return null;
	}

	const normalized = raw.replace(/,/g, "").toUpperCase();

	const match = normalized.match(/^(\d+(?:\.\d+)?)\s*(K|M|B|T)?$/);

	if (!match) {
		throw new Error("Invalid power format");
	}

	const numberPart = Number(match[1]);
	const suffix = match[2] ?? "";

	if (!Number.isFinite(numberPart) || numberPart < 0) {
		throw new Error("Invalid power value");
	}

	const multipliers: Record<string, number> = {
		K: 1_000,
		M: 1_000_000,
		B: 1_000_000_000,
		T: 1_000_000_000_000,
	};

	if (!suffix) {
		if (!Number.isSafeInteger(numberPart)) {
			throw new Error("Power without suffix must be a whole number");
		}

		return BigInt(numberPart);
	}

	const multiplier = multipliers[suffix];

	if (!multiplier) {
		throw new Error("Invalid power suffix");
	}

	const scaled = numberPart * multiplier;

	if (!Number.isSafeInteger(scaled)) {
		throw new Error("Power value is too large");
	}

	return BigInt(Math.round(scaled));
}

async function getCurrentUser() {
	const session = await auth();

	if (!session?.user?.id) {
		return null;
	}

	const discordId = String(session.user.id);

	const user = await prisma.user.findUnique({
		where: {
			discordId,
		},
		select: {
			id: true,
		},
	});

	return user;
}

export async function GET() {
	try {
		const user = await getCurrentUser();

		if (!user) {
			return NextResponse.json(
				{
					error: "Unauthorized",
				},
				{
					status: 401,
				},
			);
		}

		const members = await prisma.member.findMany({
			where: {
				userId: user.id,
			},
			include: {
				eventData: true,
			},
			orderBy: [
				{
					furnace: "desc",
				},
				{
					name: "asc",
				},
			],
		});

		return NextResponse.json({
			items: members.map(serializeMember),
		});
	} catch (error) {
		console.error("[Members] GET failed:", error);

		return NextResponse.json(
			{
				error: "Failed to load members",
			},
			{
				status: 500,
			},
		);
	}
}

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser();

		if (!user) {
			return NextResponse.json(
				{
					error: "Unauthorized",
				},
				{
					status: 401,
				},
			);
		}

		const body = await request.json();

		const name = String(body?.name ?? "").trim();

		const furnace = Number(body?.furnace);

		let power: bigint | null;

		try {
			power = parsePower(body?.power);
		} catch {
			return NextResponse.json(
				{
					error:
						"Invalid power format. Use values such as 912M, 8.731B, or 1000000.",
				},
				{
					status: 400,
				},
			);
		}

		if (!name) {
			return NextResponse.json(
				{
					error: "Member name is required",
				},
				{
					status: 400,
				},
			);
		}

		if (!Number.isInteger(furnace) || furnace < 1) {
			return NextResponse.json(
				{
					error: "Furnace must be a valid positive number",
				},
				{
					status: 400,
				},
			);
		}

		const member = await prisma.member.create({
			data: {
				userId: user.id,
				name,
				furnace,
				power,
			},
			include: {
				eventData: true,
			},
		});

		console.log("[Members] Member created:", {
			memberId: member.id,
			userId: user.id,
			name: member.name,
		});

		return NextResponse.json(
			{
				item: serializeMember(member),
			},
			{
				status: 201,
			},
		);
	} catch (error) {
		console.error("[Members] POST failed:", error);

		return NextResponse.json(
			{
				error: "Failed to create member",
			},
			{
				status: 500,
			},
		);
	}
}
