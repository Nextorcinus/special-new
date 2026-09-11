import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type InventoryResources = Record<string, string>;

function isValidResources(value: unknown): value is InventoryResources {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}

	return Object.values(value).every(
		(item) => typeof item === "string",
	);
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

export async function GET() {
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

		const inventory = await prisma.inventory.findUnique({
			where: {
				userId: user.id,
			},
		});

		if (!inventory) {
			return Response.json({
				resources: {},
			});
		}

		return Response.json({
			resources: inventory.resources,
			updatedAt: inventory.updatedAt.toISOString(),
		});
	} catch {
		return Response.json(
			{
				error: "Failed to load inventory",
			},
			{
				status: 500,
			},
		);
	}
}

export async function PUT(request: Request) {
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

		const body = await request.json();

		if (!isValidResources(body?.resources)) {
			return Response.json(
				{
					error: "Invalid resources payload",
				},
				{
					status: 400,
				},
			);
		}

		const inventory = await prisma.inventory.upsert({
			where: {
				userId: user.id,
			},
			update: {
				resources: body.resources,
			},
			create: {
				userId: user.id,
				resources: body.resources,
			},
		});

		return Response.json({
			resources: inventory.resources,
			updatedAt: inventory.updatedAt.toISOString(),
		});
	} catch {
		return Response.json(
			{
				error: "Failed to save inventory",
			},
			{
				status: 500,
			},
		);
	}
}

export async function DELETE() {
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

		await prisma.inventory.deleteMany({
			where: {
				userId: user.id,
			},
		});

		return Response.json({
			success: true,
		});
	} catch {
		return Response.json(
			{
				error: "Failed to delete inventory",
			},
			{
				status: 500,
			},
		);
	}
}