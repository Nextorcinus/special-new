import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import {
	getMemberEventDefinition,
} from "@/modules/member/database/config/member-event.config";

type RouteContext = {
	params: Promise<{
		memberId: string;
		eventId: string;
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
			throw new Error(
				`${label} is required`,
			);
		}

		return "";
	}

	const match = raw.match(
		/^(\d+(?:\.\d+)?)\s*(K|M|B|T)?$/,
	);

	if (!match) {
		throw new Error(
			`Invalid ${label} format`,
		);
	}

	const numberPart = Number(match[1]);
	const suffix = match[2] ?? "";

	if (
		!Number.isFinite(numberPart) ||
		numberPart < 0
	) {
		throw new Error(
			`Invalid ${label} value`,
		);
	}

	const multipliers: Record<string, number> = {
		K: 1_000,
		M: 1_000_000,
		B: 1_000_000_000,
		T: 1_000_000_000_000,
	};

	const result =
		numberPart * (multipliers[suffix] ?? 1);

	if (!Number.isSafeInteger(result)) {
		throw new Error(
			`${label} value is too large`,
		);
	}

	return String(Math.round(result));
}

function normalizeField(
	type: string,
	value: unknown,
	required: boolean,
	label: string,
): string {
	if (type === "power") {
		return normalizePower(
			value,
			required,
			label,
		);
	}

	const raw = String(
		value ?? "",
	).trim();

	if (!raw && required) {
		throw new Error(
			`${label} is required`,
		);
	}

	if (type === "number" && raw) {
		if (!Number.isFinite(Number(raw))) {
			throw new Error(
				`Invalid ${label} value`,
			);
		}
	}

	return raw;
}

function validateEventData(
	eventType: string,
	rawData: unknown,
) {
	const definition =
		getMemberEventDefinition(
			eventType,
		);

	if (!definition) {
		throw new Error(
			"Unsupported event type",
		);
	}

	if (
		!rawData ||
		typeof rawData !== "object" ||
		Array.isArray(rawData)
	) {
		throw new Error(
			"Event data is invalid",
		);
	}

	const input =
		rawData as Record<string, unknown>;

	const data: Record<string, string> = {};

	for (const field of definition.fields) {
		data[field.key] = normalizeField(
			field.type,
			input[field.key],
			field.required ?? false,
			field.label,
		);
	}

	return data;
}

async function getCurrentUser() {
	const session = await auth();

	if (!session?.user?.id) {
		return null;
	}

	return prisma.user.findUnique({
		where: {
			discordId: String(
				session.user.id,
			),
		},
		select: {
			id: true,
		},
	});
}

export async function PUT(
	request: Request,
	context: RouteContext,
) {
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

		const {
			memberId,
			eventId,
		} = await context.params;

		const event =
			await prisma.memberEventData.findFirst(
				{
					where: {
						id: eventId,
						memberId,
						member: {
							userId: user.id,
						},
					},
				},
			);

		if (!event) {
			return NextResponse.json(
				{
					error: "Event data not found",
				},
				{
					status: 404,
				},
			);
		}

		const body = await request.json();

		const data = validateEventData(
			event.eventType,
			body?.data,
		);

		const updated =
			await prisma.memberEventData.update(
				{
					where: {
						id: eventId,
					},
					data: {
						data,
					},
				},
			);

		return NextResponse.json({
			item: serializeEventData(
				updated,
			),
		});
	} catch (error) {
		console.error(
			"[MemberEvents] PUT failed:",
			error,
		);

		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to update event data",
			},
			{
				status: 400,
			},
		);
	}
}

export async function DELETE(
	_request: Request,
	context: RouteContext,
) {
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

		const {
			memberId,
			eventId,
		} = await context.params;

		const event =
			await prisma.memberEventData.findFirst(
				{
					where: {
						id: eventId,
						memberId,
						member: {
							userId: user.id,
						},
					},
					select: {
						id: true,
					},
				},
			);

		if (!event) {
			return NextResponse.json(
				{
					error: "Event data not found",
				},
				{
					status: 404,
				},
			);
		}

		await prisma.memberEventData.delete({
			where: {
				id: eventId,
			},
		});

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error(
			"[MemberEvents] DELETE failed:",
			error,
		);

		return NextResponse.json(
			{
				error: "Failed to delete event data",
			},
			{
				status: 500,
			},
		);
	}
}