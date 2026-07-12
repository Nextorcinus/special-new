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

		const categoryRoute =
			researchRoutes[normalizedCategory];

		return categoryRoute
			? `/${categoryRoute}`
			: "/categories";
	}

	if (module === "buildings") {
		const buildingRoutes: Record<string, string> = {
			regular: "regular",
			fc: "fc",
		};

		const categoryRoute =
			buildingRoutes[normalizedCategory];

		return categoryRoute
			? `/${categoryRoute}`
			: "";
	}

	return `/${normalizedCategory}`;
}

export function getHistoryRoute(
	item: CalculationHistoryItem,
): string {
	const categoryPath = normalizeCategoryPath(
		item.module,
		item.category,
	);

	const routes: Record<string, string> = {
		buildings: `/buildings${categoryPath}`,
		gear: `/gear${categoryPath}`,
		charm: `/charm${categoryPath}`,
		research: `/research${categoryPath}`,
		"war-academy": `/war-academy${categoryPath}`,
		widget: `/widget${categoryPath}`,
		pet: `/pet${categoryPath}`,
		troops: `/troops${categoryPath}`,
	};

	const baseRoute = routes[item.module] ?? "/";

	return `${baseRoute}?historyId=${encodeURIComponent(
		String(item.id),
	)}`;
}