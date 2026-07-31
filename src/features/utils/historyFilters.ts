import type {
	CalculationHistoryItem,
	CalculationModule,
} from "@/features/inventory/store/history/types";

type FilterHistoryParams = {
	items: CalculationHistoryItem[];
	search?: string;
	module?: CalculationModule | "all";
};

function normalizeValue(value: unknown): string {
	return String(value ?? "")
		.trim()
		.toLowerCase();
}

function isWarAcademyModule(itemModule: CalculationModule): boolean {
	return ["war-academy", "unlock-t12", "skill-t12"].includes(itemModule);
}

function matchesModule(
	item: CalculationHistoryItem,
	module: CalculationModule | "all",
): boolean {
	if (module === "all") {
		return true;
	}

	/*
	 * Unlock T12 dan Skill T12 tetap ditampilkan
	 * di kelompok History War Academy.
	 */
	if (module === "war-academy") {
		return isWarAcademyModule(item.module);
	}

	return item.module === module;
}

function matchesSearch(item: CalculationHistoryItem, search: string): boolean {
	const normalizedSearch = normalizeValue(search);

	if (!normalizedSearch) {
		return true;
	}

	const values = [item.title, item.subtitle, item.category, item.module];

	return values.some((value) =>
		normalizeValue(value).includes(normalizedSearch),
	);
}

export function filterHistory({
	items,
	search = "",
	module = "all",
}: FilterHistoryParams): CalculationHistoryItem[] {
	return items
		.filter((item) => matchesModule(item, module))
		.filter((item) => matchesSearch(item, search))
		.sort((a, b) => {
			if (a.isPinned !== b.isPinned) {
				return a.isPinned ? -1 : 1;
			}

			const dateA = new Date(a.updatedAt ?? a.createdAt).getTime();

			const dateB = new Date(b.updatedAt ?? b.createdAt).getTime();

			return dateB - dateA;
		});
}
