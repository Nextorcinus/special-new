import { create } from "zustand";
import type { CalculationHistoryItem, CalculationModule } from "./types";

type SaveCalculationPayload = Omit<
	CalculationHistoryItem,
	"id" | "createdAt" | "updatedAt"
>;

type HistoryState = {
	items: CalculationHistoryItem[];

	loadHistory: () => void;

	saveCalculation: (
		item: SaveCalculationPayload
	) => CalculationHistoryItem;

	updateCalculation: (
		id: string,
		item: SaveCalculationPayload
	) => CalculationHistoryItem | null;

	renameHistory: (id: string, title: string) => void;
	togglePinHistory: (id: string) => void;

	deleteHistory: (id: string) => void;
	clearHistory: (module?: CalculationModule) => void;
};

const STORAGE_KEY = "special-lazyness-history";

function createId(module: string) {
	return `${module}_${Date.now()}_${Math.random()
		.toString(36)
		.slice(2, 8)}`;
}

function saveToStorage(items: CalculationHistoryItem[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
	items: [],

	loadHistory: () => {
		const saved = localStorage.getItem(STORAGE_KEY);

		if (!saved) return;

		try {
			const parsedItems = JSON.parse(saved) as CalculationHistoryItem[];
			set({ items: parsedItems });
		} catch {
			set({ items: [] });
		}
	},

	saveCalculation: (item) => {
		const now = new Date().toISOString();

		const newItem: CalculationHistoryItem = {
			...item,
			id: createId(item.module),
			isPinned: item.isPinned ?? false,
			createdAt: now,
			updatedAt: undefined,
		};

		const nextItems = [newItem, ...get().items];

		saveToStorage(nextItems);
		set({ items: nextItems });

		return newItem;
	},

	updateCalculation: (id, item) => {
		const now = new Date().toISOString();
		const currentItems = get().items;

		const existingItem = currentItems.find(
			(history) => history.id === id
		);

		if (!existingItem) return null;

		const updatedItem: CalculationHistoryItem = {
			...existingItem,
			...item,
			id: existingItem.id,
			isPinned: existingItem.isPinned ?? item.isPinned ?? false,
			createdAt: existingItem.createdAt,
			updatedAt: now,
		};

		const nextItems = currentItems.map((history) =>
			history.id === id ? updatedItem : history
		);

		saveToStorage(nextItems);
		set({ items: nextItems });

		return updatedItem;
	},

	renameHistory: (id, title) => {
		const cleanTitle = title.trim();

		if (!cleanTitle) return;

		const nextItems = get().items.map((item) =>
			item.id === id
				? {
						...item,
						title: cleanTitle,
						updatedAt: new Date().toISOString(),
					}
				: item
		);

		saveToStorage(nextItems);
		set({ items: nextItems });
	},

	togglePinHistory: (id) => {
		const nextItems = get().items.map((item) =>
			item.id === id
				? {
						...item,
						isPinned: !item.isPinned,
						updatedAt: new Date().toISOString(),
					}
				: item
		);

		saveToStorage(nextItems);
		set({ items: nextItems });
	},

	deleteHistory: (id) => {
		const nextItems = get().items.filter(
			(item) => item.id !== id
		);

		saveToStorage(nextItems);
		set({ items: nextItems });
	},

	clearHistory: (module) => {
		if (!module) {
			localStorage.removeItem(STORAGE_KEY);
			set({ items: [] });
			return;
		}

		const nextItems = get().items.filter(
			(item) => item.module !== module
		);

		saveToStorage(nextItems);
		set({ items: nextItems });
	},
}));