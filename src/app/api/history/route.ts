import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

export async function GET(request: Request) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return Response.json(
				{
					error: "Unauthorized",
				},
				{
					status: 401,
				},
			);
		}

		const user = await prisma.user.findUnique({
			where: {
				discordId: session.user.id,
			},
		});

		if (!user) {
			return Response.json(
				{
					error: "User not found",
				},
				{
					status: 404,
				},
			);
		}

		const { searchParams } = new URL(request.url);
		const module = searchParams.get("module");

		const histories = await prisma.calculationHistory.findMany({
			where: {
				userId: user.id,
				...(module
					? {
							module,
						}
					: {}),
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		return Response.json({
			items: histories.map(serializeHistory),
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

export async function POST(request: Request) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			return Response.json(
				{
					error: "Unauthorized",
				},
				{
					status: 401,
				},
			);
		}

		const user = await prisma.user.findUnique({
			where: {
				discordId: session.user.id,
			},
		});

		if (!user) {
			return Response.json(
				{
					error: "User not found",
				},
				{
					status: 404,
				},
			);
		}

		const body = await request.json();

		if (
			typeof body?.id !== "string" ||
			typeof body?.module !== "string" ||
			typeof body?.title !== "string" ||
			body?.form === undefined ||
			body?.result === undefined
		) {
			return Response.json(
				{
					error: "Invalid history payload",
				},
				{
					status: 400,
				},
			);
		}

		const history = await prisma.calculationHistory.create({
			data: {
				historyId: body.id,
				userId: user.id,
				module: body.module,
				category: typeof body.category === "string" ? body.category : null,
				title: body.title,
				subtitle: typeof body.subtitle === "string" ? body.subtitle : null,
				form: JSON.parse(JSON.stringify(body.form)),
				result: JSON.parse(JSON.stringify(body.result)),
				items:
					body.items === undefined
						? undefined
						: JSON.parse(JSON.stringify(body.items)),
				isPinned: body.isPinned === true,
			},
		});

		return Response.json(
			{
				item: serializeHistory(history),
			},
			{
				status: 201,
			},
		);
	} catch (error) {
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			return Response.json(
				{
					error: "History already exists",
				},
				{
					status: 409,
				},
			);
		}

		return Response.json(
			{
				error: "Failed to save history",
			},
			{
				status: 500,
			},
		);
	}
}
