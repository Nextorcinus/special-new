import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
	params: Promise<{
		id: string;
	}>;
};

function serializeHistory(item: {
	id: string;
	historyId: string;
	module: string;
	category: string | null;
	title: string;
	subtitle: string | null;
	form: unknown;
	result: unknown;
	items: unknown;
	isPinned: boolean;
	createdAt: Date;
	updatedAt: Date;
}) {
	return {
		id: item.historyId,
		module: item.module,
		category: item.category ?? undefined,
		title: item.title,
		subtitle: item.subtitle ?? undefined,
		form: item.form,
		result: item.result,
		items: item.items ?? undefined,
		isPinned: item.isPinned,
		createdAt: item.createdAt.toISOString(),
		updatedAt: item.updatedAt.toISOString(),
	};
}

async function getAuthenticatedUser() {
	const session = await auth();

	if (!session?.user?.id) {
		return null;
	}

	return prisma.user.findUnique({
		where: {
			discordId: session.user.id,
		},
	});
}

export async function GET(_request: Request, context: RouteContext) {
	try {
		const user = await getAuthenticatedUser();

		if (!user) {
			return Response.json(
				{
					error: "Unauthorized",
				},
				{
					status: 401,
				},
			);
		}

		const { id } = await context.params;

		const history = await prisma.calculationHistory.findUnique({
			where: {
				userId_historyId: {
					userId: user.id,
					historyId: id,
				},
			},
		});

		if (!history) {
			return Response.json(
				{
					error: "History not found",
				},
				{
					status: 404,
				},
			);
		}

		return Response.json({
			item: serializeHistory(history),
		});
	} catch {
		return Response.json(
			{
				error: "Failed to load history",
			},
			{
				status: 500,
			},
		);
	}
}

export async function PUT(request: Request, context: RouteContext) {
	try {
		const user = await getAuthenticatedUser();

		if (!user) {
			return Response.json(
				{
					error: "Unauthorized",
				},
				{
					status: 401,
				},
			);
		}

		const { id } = await context.params;
		const body = await request.json();

		const existingHistory = await prisma.calculationHistory.findUnique({
			where: {
				userId_historyId: {
					userId: user.id,
					historyId: id,
				},
			},
		});

		if (!existingHistory) {
			return Response.json(
				{
					error: "History not found",
				},
				{
					status: 404,
				},
			);
		}

		const history = await prisma.calculationHistory.update({
			where: {
				userId_historyId: {
					userId: user.id,
					historyId: id,
				},
			},
			data: {
				...(typeof body?.module === "string"
					? {
							module: body.module,
						}
					: {}),
				...(body?.category !== undefined
					? {
							category:
								typeof body.category === "string" ? body.category : null,
						}
					: {}),
				...(typeof body?.title === "string"
					? {
							title: body.title,
						}
					: {}),
				...(body?.subtitle !== undefined
					? {
							subtitle:
								typeof body.subtitle === "string" ? body.subtitle : null,
						}
					: {}),
				...(body?.form !== undefined
					? {
							form: JSON.parse(JSON.stringify(body.form)),
						}
					: {}),
				...(body?.result !== undefined
					? {
							result: JSON.parse(JSON.stringify(body.result)),
						}
					: {}),
				...(body?.items !== undefined
					? {
							items: JSON.parse(JSON.stringify(body.items)),
						}
					: {}),
				...(body?.isPinned !== undefined
					? {
							isPinned: body.isPinned === true,
						}
					: {}),
			},
		});

		return Response.json({
			item: serializeHistory(history),
		});
	} catch {
		return Response.json(
			{
				error: "Failed to update history",
			},
			{
				status: 500,
			},
		);
	}
}

export async function DELETE(_request: Request, context: RouteContext) {
	try {
		const user = await getAuthenticatedUser();

		if (!user) {
			return Response.json(
				{
					error: "Unauthorized",
				},
				{
					status: 401,
				},
			);
		}

		const { id } = await context.params;

		const existingHistory = await prisma.calculationHistory.findUnique({
			where: {
				userId_historyId: {
					userId: user.id,
					historyId: id,
				},
			},
		});

		if (!existingHistory) {
			return Response.json(
				{
					error: "History not found",
				},
				{
					status: 404,
				},
			);
		}

		await prisma.calculationHistory.delete({
			where: {
				userId_historyId: {
					userId: user.id,
					historyId: id,
				},
			},
		});

		return Response.json({
			success: true,
		});
	} catch {
		return Response.json(
			{
				error: "Failed to delete history",
			},
			{
				status: 500,
			},
		);
	}
}
