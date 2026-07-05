// src/features/history/utils/historyFilters.ts

import type {
	CalculationHistoryItem,
	CalculationModule,
} from "@/features/inventory/store/history/types";

type FilterHistoryParams = {
	items: CalculationHistoryItem[];
	search?: string;
	module?: CalculationModule | "all";
	category?: string;
};

export function filterHistory({
	items,
	search = "",
	module = "all",
	category,
}: FilterHistoryParams) {
	const keyword = search.trim().toLowerCase();

	return items
		.filter((item) => {
			if (module !== "all" && item.module !== module) {
				return false;
			}

			if (category && item.category !== category) {
				return false;
			}

			if (!keyword) {
				return true;
			}

			const searchableText = [
				item.title,
				item.subtitle,
				item.module,
				item.category,
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();

			return searchableText.includes(keyword);
		})
		.sort((a, b) => {
			if (a.isPinned && !b.isPinned) return -1;
			if (!a.isPinned && b.isPinned) return 1;

			const dateA = new Date(a.updatedAt ?? a.createdAt).getTime();
			const dateB = new Date(b.updatedAt ?? b.createdAt).getTime();

			return dateB - dateA;
		});
}