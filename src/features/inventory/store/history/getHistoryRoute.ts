import type { CalculationHistoryItem } from "./types";

function normalizeCategoryPath(
	module: CalculationHistoryItem["module"],
	category?: string,
): string {
	if (!category) {
		return "";
	}

	const normalizedCategory = category.trim().toLowerCase();

	if (module === "research") {
		const researchRoutes: Record<string, string> = {
			growth: "growth",
			economy: "economy",
			battle: "battle",
		};

		const categoryRoute = researchRoutes[normalizedCategory];

		return categoryRoute ? `/${categoryRoute}` : "/categories";
	}

	if (module === "buildings") {
		const buildingRoutes: Record<string, string> = {
			regular: "regular",
			fc: "fc",
		};

		const categoryRoute = buildingRoutes[normalizedCategory];

		return categoryRoute ? `/${categoryRoute}` : "";
	}

	return `/${normalizedCategory}`;
}

function getPetId(item: CalculationHistoryItem): string | null {
	const form = item.form as
		| {
				petId?: unknown;
		  }
		| undefined;

	const result = item.result as
		| {
				petId?: unknown;
		  }
		| undefined;

	const petId = result?.petId ?? form?.petId;

	if (typeof petId !== "string") {
		return null;
	}

	const normalizedPetId = petId.trim();

	return normalizedPetId || null;
}

export function getHistoryRoute(item: CalculationHistoryItem): string {
	const historyId = encodeURIComponent(String(item.id));

	if (item.module === "pet") {
		const petId =
			typeof item.result?.petId === "string"
				? item.result.petId
				: typeof item.form?.petId === "string"
					? item.form.petId
					: null;

		if (!petId) {
			return "/pets";
		}

		return `/pets/${encodeURIComponent(
			petId,
		)}?historyId=${encodeURIComponent(String(item.id))}`;
	}

	const categoryPath = normalizeCategoryPath(item.module, item.category);

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
