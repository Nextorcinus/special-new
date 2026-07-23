import type { CalculationHistoryItem } from "./types";

function normalizeCategory(value: unknown): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-");
}

function getCategoryPath(item: CalculationHistoryItem): string {
	const category = normalizeCategory(item.category);

	if (!category) {
		return "";
	}

	switch (item.module) {
		case "research": {
			const validRoutes: Record<string, string> = {
				growth: "growth",
				economy: "economy",
				battle: "battle",
			};

			const route = validRoutes[category];

			return route ? `/${route}` : "/categories";
		}

		case "buildings": {
			const validRoutes: Record<string, string> = {
				regular: "regular",
				fc: "fc",
			};

			const route = validRoutes[category];

			return route ? `/${route}` : "";
		}

		case "war-academy": {
			const validRoutes: Record<string, string> = {
				infantry: "infantry",
				lancer: "lancer",
				marksman: "marksman",
				support: "support",
			};

			const route = validRoutes[category];

			return route ? `/${route}` : "";
		}

		default:
			return `/${category}`;
	}
}

function getPetId(item: CalculationHistoryItem): string | null {
	const result = item.result as
		| {
				petId?: unknown;
		  }
		| undefined;

	const form = item.form as
		| {
				petId?: unknown;
		  }
		| undefined;

	const petId = result?.petId ?? form?.petId ?? item.category;

	if (typeof petId !== "string") {
		return null;
	}

	const normalizedPetId = normalizeCategory(petId);

	return normalizedPetId || null;
}

export function getHistoryRoute(item: CalculationHistoryItem): string {
	const historyId = encodeURIComponent(String(item.id));

	/*
	 * Pet memakai dynamic route:
	 *
	 * /pets/[petId]
	 *
	 * Jadi Pet tidak boleh memakai route umum:
	 *
	 * /pet/{category}
	 */
	if (item.module === "pet") {
		const petId = getPetId(item);

		if (!petId) {
			return "/pets";
		}

		return `/pets/${encodeURIComponent(petId)}?historyId=${historyId}`;
	}

	const categoryPath = getCategoryPath(item);

	const routes: Record<string, string> = {
		buildings: `/buildings${categoryPath}`,
		gear: `/gear${categoryPath}`,
		charm: `/charm${categoryPath}`,
		research: `/research${categoryPath}`,
		"war-academy": `/war-academy${categoryPath}`,
		widget: `/widget${categoryPath}`,
		troops: `/troops${categoryPath}`,
	};

	const baseRoute = routes[item.module] ?? "/";

	return `${baseRoute}?historyId=${historyId}`;
}
