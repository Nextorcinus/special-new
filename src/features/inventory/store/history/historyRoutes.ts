import type { CalculationHistoryItem } from "./types";

export function getHistoryRoute(item: CalculationHistoryItem) {
	const categoryPath = item.category ? `/${item.category}` : "";

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

	return `${baseRoute}?historyId=${item.id}`;
}