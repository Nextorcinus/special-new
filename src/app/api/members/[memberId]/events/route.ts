import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { getMemberEventDefinition } from "@/modules/member/database/config/member-event.config";

type RouteContext = {
	params: Promise<{
		memberId: string;
	}>;
};

function serializeEventData(event: {
	id: string;
	memberId: string;
	eventType: string;
	data: unknown;
	createdAt: Date;
	updatedAt: Date;
}) {
	return {
		id: event.id,
		memberId: event.memberId,
		eventType: event.eventType,
		data: event.data,
		createdAt: event.createdAt.toISOString(),
		updatedAt: event.updatedAt.toISOString(),
	};
}

function normalizePower(
	value: unknown,
	required: boolean,
	label: string,
): string {
	const raw = String(value ?? "")
		.trim()
		.replace(/,/g, "")
		.toUpperCase();

	if (!raw) {
		if (required) {
			throw new Error(`${label} is required`);
		}

		return "";
	}

	const match = raw.match(/^(\d+(?:\.\d+)?)\s*(K|M|B|T)?$/);

	if (!match) {
		throw new Error(`Invalid ${label} format`);
	}

	const numberPart = Number(match[1]);
	const suffix = match[2] ?? "";

	if (!Number.isFinite(numberPart) || numberPart < 0) {
		throw new Error(`Invalid ${label} value`);
	}

	const multipliers: Record<string, number> = {
		K: 1_000,
		M: 1_000_000,
		B: 1_000_000_000,
		T: 1_000_000_000_000,
	};

	const result = numberPart * (multipliers[suffix] ?? 1);

	if (!Number.isSafeInteger(result)) {
		throw new Error(`${label} value is too large`);
	}

	return String(Math.round(result));
}

function normalizeField(
	fieldType: string,
	value: unknown,
	required: boolean,
	label: string,
): string {
	switch (fieldType) {
		case "power":
			return normalizePower(value, required, label);

		case "number": {
			const raw = String(value ?? "").trim();

			if (!raw && required) {
				throw new Error(`${label} is required`);
			}

			if (!raw) {
				return "";
			}

			const number = Number(raw);

			if (!Number.isFinite(number)) {
				throw new Error(`Invalid ${label} value`);
			}

			return raw;
		}

		case "text": {
			const raw = String(value ?? "").trim();

			if (!raw && required) {
				throw new Error(`${label} is required`);
			}

			return raw;
		}

		default:
			throw new Error(`Unsupported field type for ${label}`);
	}
}

function validateEventData(eventType: unknown, rawData: unknown) {
	const type = String(eventType ?? "").trim();

	if (!type) {
		throw new Error("Event type is required");
	}

	const definition = getMemberEventDefinition(type);

	if (!definition) {
		throw new Error("Unsupported event type");
	}

	if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
		throw new Error("Event data is invalid");
	}

	const input = rawData as Record<string, unknown>;

	const data: Record<string, string> = {};

	for (const field of definition.fields) {
		data[field.key] = normalizeField(
			field.type,
			input[field.key],
			field.required ?? false,
			field.label,
		);
	}

	return {
		eventType: type,
		data,
	};
}

async function getCurrentUser() {
	const session = await auth();

	if (!session?.user?.id) {
		return null;
	}

	return prisma.user.findUnique({
		where: {
			discordId: String(session.user.id),
		},
		select: {
			id: true,
		},
	});
}

async function verifyMemberOwnership(memberId: string, userId: string) {
	return prisma.member.findFirst({
		where: {
			id: memberId,
			userId,
		},
		select: {
			id: true,
		},
	});
}

export async function GET(_request: Request, context: RouteContext) {
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

		const { memberId } = await context.params;

		const member = await verifyMemberOwnership(memberId, user.id);

		if (!member) {
			return NextResponse.json(
				{
					error: "Member not found",
				},
				{
					status: 404,
				},
			);
		}

		const events = await prisma.memberEventData.findMany({
			where: {
				memberId,
			},
			orderBy: {
				createdAt: "asc",
			},
		});

		return NextResponse.json({
			items: events.map(serializeEventData),
		});
	} catch (error) {
		console.error("[MemberEvents] GET failed:", error);

		return NextResponse.json(
			{
				error: "Failed to load event data",
			},
			{
				status: 500,
			},
		);
	}
}

export async function POST(request: Request, context: RouteContext) {
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

		const { memberId } = await context.params;

		const member = await verifyMemberOwnership(memberId, user.id);

		if (!member) {
			return NextResponse.json(
				{
					error: "Member not found",
				},
				{
					status: 404,
				},
			);
		}

		const body = await request.json();

		const validated = validateEventData(body?.eventType, body?.data);

		const existing = await prisma.memberEventData.findUnique({
			where: {
				memberId_eventType: {
					memberId,
					eventType: validated.eventType,
				},
			},
			select: {
				id: true,
			},
		});

		if (existing) {
			return NextResponse.json(
				{
					error: "This event data already exists for this member.",
				},
				{
					status: 409,
				},
			);
		}

		const event = await prisma.memberEventData.create({
			data: {
				memberId,
				eventType: validated.eventType,
				data: validated.data,
			},
		});

		return NextResponse.json(
			{
				item: serializeEventData(event),
			},
			{
				status: 201,
			},
		);
	} catch (error) {
		console.error("[MemberEvents] POST failed:", error);

		const message =
			error instanceof Error ? error.message : "Failed to create event data";

		const status =
			message.includes("required") ||
			message.includes("Invalid") ||
			message.includes("Unsupported") ||
			message.includes("invalid")
				? 400
				: message.includes("already exists")
					? 409
					: 500;

		return NextResponse.json(
			{
				error: message,
			},
			{
				status,
			},
		);
	}
}
