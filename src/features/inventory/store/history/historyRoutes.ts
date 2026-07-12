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

		default:
			return `/${category}`;
	}
}

export function getHistoryRoute(
	item: CalculationHistoryItem,
): string {
	const categoryPath = getCategoryPath(item);

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

	const historyId = encodeURIComponent(
		String(item.id),
	);

	return `${baseRoute}?historyId=${historyId}`;
}