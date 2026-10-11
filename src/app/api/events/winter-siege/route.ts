import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const EVENT_KEY = "winter-siege";

const VALID_LOCATION_IDS = new Set([
	"gate-1",
	"gate-2",
	"gate-3",
	"stronghold-1",
	"stronghold-2",
	"base",
]);

type WinterSiegeAssignment = {
	memberId: string;
	squadId: "squad-1" | "squad-2";
	locationId: string | null;
};

type WinterSiegeEventPlan = {
	assignments: WinterSiegeAssignment[];
};

type EventPlansRecord = Record<string, unknown>;

function isValidAssignment(
	value: unknown,
): value is WinterSiegeAssignment {
	if (
		!value ||
		typeof value !== "object" ||
		Array.isArray(value)
	) {
		return false;
	}

	const assignment =
		value as Record<string, unknown>;

	if (
		typeof assignment.memberId !== "string" ||
		!assignment.memberId
	) {
		return false;
	}

	if (
		assignment.squadId !== "squad-1" &&
		assignment.squadId !== "squad-2"
	) {
		return false;
	}

	if (
		assignment.locationId !== null &&
		typeof assignment.locationId !== "string"
	) {
		return false;
	}

	if (
		typeof assignment.locationId === "string" &&
		!VALID_LOCATION_IDS.has(
			assignment.locationId,
		)
	) {
		return false;
	}

	return true;
}

function normalizeAssignments(
	value: unknown,
): WinterSiegeAssignment[] {
	if (!Array.isArray(value)) {
		return [];
	}

	const unique =
		new Map<string, WinterSiegeAssignment>();

	for (const item of value) {
		if (!isValidAssignment(item)) {
			continue;
		}

		const key =
			`${item.memberId}:${item.squadId}`;

		unique.set(key, {
			memberId: item.memberId,
			squadId: item.squadId,
			locationId: item.locationId,
		});
	}

	return Array.from(unique.values());
}

function getStoredAssignments(
	eventPlans: unknown,
): WinterSiegeAssignment[] {
	if (
		!eventPlans ||
		typeof eventPlans !== "object" ||
		Array.isArray(eventPlans)
	) {
		return [];
	}

	const plans =
		eventPlans as Record<string, unknown>;

	const winterSiege =
		plans[EVENT_KEY];

	if (
		!winterSiege ||
		typeof winterSiege !== "object" ||
		Array.isArray(winterSiege)
	) {
		return [];
	}

	const winterSiegePlan =
		winterSiege as Record<
			string,
			unknown
		>;

	return normalizeAssignments(
		winterSiegePlan.assignments,
	);
}

function getMutableEventPlans(
	eventPlans: unknown,
): EventPlansRecord {
	if (
		!eventPlans ||
		typeof eventPlans !== "object" ||
		Array.isArray(eventPlans)
	) {
		return {};
	}

	/*
	 * Clone the JSON value instead of mutating
	 * Prisma's readonly JSON object directly.
	 *
	 * JSON.parse/stringify is safe here because
	 * eventPlans contains JSON-compatible data.
	 */
	return JSON.parse(
		JSON.stringify(eventPlans),
	) as EventPlansRecord;
}

async function getCurrentUser() {
	const session = await auth();

	if (!session?.user?.id) {
		return null;
	}

	const discordId =
		String(session.user.id);

	return prisma.user.findUnique({
		where: {
			discordId,
		},
		select: {
			id: true,
			eventPlans: true,
		},
	});
}

async function validateMemberOwnership(
	userId: string,
	assignments: WinterSiegeAssignment[],
) {
	const memberIds = Array.from(
		new Set(
			assignments.map(
				(assignment) =>
					assignment.memberId,
			),
		),
	);

	if (memberIds.length === 0) {
		return true;
	}

	const members =
		await prisma.member.findMany({
			where: {
				userId,
				id: {
					in: memberIds,
				},
			},
			select: {
				id: true,
			},
		});

	return (
		members.length ===
		memberIds.length
	);
}

export async function GET() {
	try {
		const user =
			await getCurrentUser();

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

		const assignments =
			getStoredAssignments(
				user.eventPlans,
			);

		return NextResponse.json(
			{
				event: EVENT_KEY,
				assignments,
			},
			{
				status: 200,
				headers: {
					"Cache-Control":
						"no-store, no-cache, must-revalidate, proxy-revalidate",
				},
			},
		);
	} catch (error) {
		console.error(
			"[WinterSiege] GET failed:",
			error,
		);

		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to load Winter Siege plan.",
			},
			{
				status: 500,
			},
		);
	}
}

export async function PUT(
	request: Request,
) {
	try {
		const user =
			await getCurrentUser();

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

		let body: unknown;

		try {
			body = await request.json();
		} catch {
			return NextResponse.json(
				{
					error:
						"Invalid JSON request body.",
				},
				{
					status: 400,
				},
			);
		}

		if (
			!body ||
			typeof body !== "object" ||
			Array.isArray(body)
		) {
			return NextResponse.json(
				{
					error:
						"Invalid request body.",
				},
				{
					status: 400,
				},
			);
		}

		const payload =
			body as Record<
				string,
				unknown
			>;

		if (
			!Array.isArray(
				payload.assignments,
			)
		) {
			return NextResponse.json(
				{
					error:
						"assignments must be an array.",
				},
				{
					status: 400,
				},
			);
		}

		const rawAssignments =
			payload.assignments;

		const assignments =
			normalizeAssignments(
				rawAssignments,
			);

		/*
		 * Prevent malformed assignments from
		 * silently being discarded.
		 */
		if (
			rawAssignments.length !==
			assignments.length
		) {
			return NextResponse.json(
				{
					error:
						"One or more Winter Siege assignments are invalid.",
				},
				{
					status: 400,
				},
			);
		}

		/*
		 * Make sure every squad being saved
		 * belongs to the currently logged-in user.
		 */
		const ownershipValid =
			await validateMemberOwnership(
				user.id,
				assignments,
			);

		if (!ownershipValid) {
			return NextResponse.json(
				{
					error:
						"One or more members do not belong to your account.",
				},
				{
					status: 403,
				},
			);
		}

		/*
		 * Clone existing event plans so Prisma's
		 * readonly JSON value is never mutated.
		 */
		const nextEventPlans =
			getMutableEventPlans(
				user.eventPlans,
			);

		/*
		 * Winter Siege deployment is intentionally
		 * free-form.
		 *
		 * There is NO location capacity validation.
		 * Admin can stack as many squads as needed
		 * on any friendly location.
		 */
		const winterSiegePlan:
			WinterSiegeEventPlan = {
			assignments,
		};

		nextEventPlans[EVENT_KEY] =
			winterSiegePlan;

		/*
		 * JSON.parse returns a JSON-compatible
		 * value which Prisma accepts as Json input.
		 *
		 * This avoids the readonly InputJsonObject
		 * TypeScript error.
		 */
		const eventPlansForPrisma =
			JSON.parse(
				JSON.stringify(
					nextEventPlans,
				),
			);

		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				eventPlans:
					eventPlansForPrisma,
			},
		});

		console.log(
			`[WinterSiege] Plan saved for user ${user.id}`,
		);

		return NextResponse.json(
			{
				success: true,
				event: EVENT_KEY,
				assignments,
			},
			{
				status: 200,
			},
		);
	} catch (error) {
		console.error(
			"[WinterSiege] PUT failed:",
			error,
		);

		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to save Winter Siege plan.",
			},
			{
				status: 500,
			},
		);
	}
}