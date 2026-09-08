import { create } from "zustand";

import type {
	CalculationHistoryEntry,
	CalculationHistoryItem,
	CalculationModule,
} from "./types";

type SaveCalculationPayload = Omit<
	CalculationHistoryItem,
	"id" | "createdAt" | "updatedAt" | "items"
>;

type CompleteCalculationResult = {
	history: CalculationHistoryItem | null;
	success: boolean;
	reason?: "NOT_FOUND" | "ALREADY_COMPLETED";
};

type HistoryState = {
	items: CalculationHistoryItem[];

	loadHistory: () => void;

	saveCalculation: (item: SaveCalculationPayload) => CalculationHistoryItem;

	updateCalculation: (
		id: string,
		item: SaveCalculationPayload,
	) => CalculationHistoryItem | null;

	addCalculationItem: (
		id: string,
		item: SaveCalculationPayload,
	) => CalculationHistoryItem | null;

	/**
	 * Complete ONE individual calculation
	 * inside a History.
	 */
	completeCalculationItem: (
		historyId: string,
		entryId: string,
	) => CompleteCalculationResult;

	renameHistory: (id: string, title: string) => void;

	togglePinHistory: (id: string) => void;

	deleteHistory: (id: string) => void;

	clearHistory: (module?: CalculationModule) => void;
};

const STORAGE_KEY = "special-lazyness-history";

/**
 * Generate a unique ID.
 */
function createId(module: string) {
	return `${module}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Persist History to localStorage.
 */
function saveToStorage(items: CalculationHistoryItem[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * Create a new individual History Entry.
 *
 * Every newly created calculation starts as:
 *
 * completed: false
 */
function createHistoryEntry(
	item: SaveCalculationPayload,
): CalculationHistoryEntry {
	return {
		id: createId(`${item.module}_item`),

		title: item.title,

		subtitle: item.subtitle,

		form: item.form,

		result: item.result,

		createdAt: new Date().toISOString(),

		completed: false,

		completedAt: undefined,
	};
}

/**
 * Normalize an existing History Entry.
 *
 * This makes old localStorage data compatible
 * with the Completed system.
 */
function normalizeHistoryEntry<TForm = any, TResult = any>(
	entry: CalculationHistoryEntry<TForm, TResult>,
): CalculationHistoryEntry<TForm, TResult> {
	return {
		...entry,

		completed: entry.completed ?? false,

		completedAt: entry.completed ? entry.completedAt : undefined,
	};
}

/**
 * Create a fallback Entry for old History data.
 *
 * Older History records may have:
 *
 * {
 *   id,
 *   form,
 *   result
 * }
 *
 * without:
 *
 * items: []
 *
 * We convert that old structure into
 * one individual Entry.
 *
 * The ID is deterministic so it does not
 * change every time localStorage is loaded.
 */
function createLegacyHistoryEntry<TForm = any, TResult = any>(
	item: CalculationHistoryItem<TForm, TResult>,
): CalculationHistoryEntry<TForm, TResult> {
	return {
		id: `${item.id}_item`,

		title: item.title,

		subtitle: item.subtitle,

		form: item.form,

		result: item.result,

		createdAt: item.createdAt,

		completed: false,

		completedAt: undefined,
	};
}

/**
 * Normalize an entire History item.
 *
 * Important:
 *
 * If an old History has no items,
 * we create one legacy entry from
 * the History's existing form/result.
 */
function normalizeHistoryItem(
	item: CalculationHistoryItem,
): CalculationHistoryItem {
	const normalizedEntries =
		item.items && item.items.length > 0
			? item.items.map(normalizeHistoryEntry)
			: [createLegacyHistoryEntry(item)];

	return {
		...item,

		items: normalizedEntries,

		isPinned: item.isPinned ?? false,
	};
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
	items: [],

	/*
	 * ========================================================
	 * LOAD HISTORY
	 * ========================================================
	 */

	loadHistory: () => {
		const saved = localStorage.getItem(STORAGE_KEY);

		if (!saved) {
			set({
				items: [],
			});

			return;
		}

		try {
			const parsedItems = JSON.parse(saved) as CalculationHistoryItem[];

			if (!Array.isArray(parsedItems)) {
				set({
					items: [],
				});

				return;
			}

			const normalizedItems = parsedItems.map(normalizeHistoryItem);

			set({
				items: normalizedItems,
			});

			/**
			 * Save normalized data back
			 * to localStorage.
			 *
			 * This upgrades old History
			 * records automatically.
			 */
			saveToStorage(normalizedItems);
		} catch {
			set({
				items: [],
			});
		}
	},

	/*
	 * ========================================================
	 * SAVE CALCULATION
	 * ========================================================
	 */

	saveCalculation: (item) => {
		const now = new Date().toISOString();

		const firstEntry = createHistoryEntry(item);

		const newItem: CalculationHistoryItem = {
			...item,

			id: createId(item.module),

			items: [firstEntry],

			isPinned: item.isPinned ?? false,

			createdAt: now,

			updatedAt: undefined,
		};

		const nextItems = [newItem, ...get().items];

		saveToStorage(nextItems);

		set({
			items: nextItems,
		});

		return newItem;
	},

	/*
	 * ========================================================
	 * UPDATE CALCULATION
	 * ========================================================
	 *
	 * Updating the first result means
	 * the calculation itself has changed.
	 *
	 * Therefore the first result becomes
	 * pending again.
	 */

	updateCalculation: (id, item) => {
		const now = new Date().toISOString();

		const currentItems = get().items;

		const existingItem = currentItems.find((history) => history.id === id);

		if (!existingItem) {
			return null;
		}

		const updatedEntry = createHistoryEntry(item);

		const existingEntries =
			existingItem.items && existingItem.items.length > 0
				? existingItem.items.map(normalizeHistoryEntry)
				: [createLegacyHistoryEntry(existingItem)];

		const nextEntries = existingEntries.map((entry, index) => {
			if (index !== 0) {
				return entry;
			}

			return {
				...entry,

				/**
				 * Keep the original
				 * entry ID.
				 *
				 * This is important
				 * because the parent
				 * component may already
				 * reference this entry.
				 */
				id: entry.id,

				title: updatedEntry.title,

				subtitle: updatedEntry.subtitle,

				form: updatedEntry.form,

				result: updatedEntry.result,

				/**
				 * The calculation
				 * changed, so it is
				 * no longer completed.
				 */
				completed: false,

				completedAt: undefined,
			};
		});

		const updatedItem: CalculationHistoryItem = {
			...existingItem,

			form: item.form,

			result: item.result,

			/**
			 * Keep the original
			 * History title.
			 */
			title: existingItem.title,

			subtitle:
				nextEntries.length > 1 ? `${nextEntries.length} Items` : item.subtitle,

			items: nextEntries,

			isPinned: existingItem.isPinned ?? false,

			createdAt: existingItem.createdAt,

			updatedAt: now,
		};

		const nextItems = currentItems.map((history) =>
			history.id === id ? updatedItem : history,
		);

		saveToStorage(nextItems);

		set({
			items: nextItems,
		});

		return updatedItem;
	},

	/*
	 * ========================================================
	 * ADD CALCULATION ITEM
	 * ========================================================
	 *
	 * Adds a new result to an existing
	 * History.
	 *
	 * Existing completed results remain
	 * completed.
	 *
	 * The newly added result starts
	 * as pending.
	 */

	addCalculationItem: (id, item) => {
		const now = new Date().toISOString();

		const currentItems = get().items;

		const existingItem = currentItems.find((history) => history.id === id);

		if (!existingItem) {
			return null;
		}

		const nextEntry = createHistoryEntry(item);

		const existingEntries =
			existingItem.items && existingItem.items.length > 0
				? existingItem.items.map(normalizeHistoryEntry)
				: [createLegacyHistoryEntry(existingItem)];

		const updatedItem: CalculationHistoryItem = {
			...existingItem,

			title: existingItem.title,

			subtitle: `${existingEntries.length + 1} Items`,

			items: [...existingEntries, nextEntry],

			updatedAt: now,
		};

		const nextItems = currentItems.map((history) =>
			history.id === id ? updatedItem : history,
		);

		saveToStorage(nextItems);

		set({
			items: nextItems,
		});

		return updatedItem;
	},

	/*
	 * ========================================================
	 * COMPLETE ONE CALCULATION ITEM
	 * ========================================================
	 *
	 * This is the main action for:
	 *
	 * [ Completed ]
	 *
	 * It changes ONLY one individual
	 * result inside the History.
	 *
	 * Example:
	 *
	 * History
	 * ├── Pants  -> true
	 * ├── Belt   -> false
	 * └── Coat   -> false
	 *
	 * Calling:
	 *
	 * completeCalculationItem(
	 *   historyId,
	 *   pantsEntryId
	 * )
	 *
	 * changes ONLY Pants.
	 */

	completeCalculationItem: (historyId, entryId) => {
		const currentItems = get().items;

		const existingHistory = currentItems.find(
			(history) => history.id === historyId,
		);

		/*
		 * History does not exist.
		 */
		if (!existingHistory) {
			return {
				history: null,

				success: false,

				reason: "NOT_FOUND",
			};
		}

		/*
		 * Make sure old History data
		 * also has an Entry.
		 */
		const existingEntries =
			existingHistory.items && existingHistory.items.length > 0
				? existingHistory.items.map(normalizeHistoryEntry)
				: [createLegacyHistoryEntry(existingHistory)];

		/*
		 * Find ONLY the requested Entry.
		 */
		const existingEntry = existingEntries.find((entry) => entry.id === entryId);

		/*
		 * Entry does not exist.
		 */
		if (!existingEntry) {
			return {
				history: existingHistory,

				success: false,

				reason: "NOT_FOUND",
			};
		}

		/*
		 * Already completed.
		 *
		 * Prevent duplicate completion.
		 */
		if (existingEntry.completed === true) {
			return {
				history: existingHistory,

				success: false,

				reason: "ALREADY_COMPLETED",
			};
		}

		const now = new Date().toISOString();

		/*
		 * Update ONLY the requested Entry.
		 */
		const updatedEntries = existingEntries.map((entry) => {
			if (entry.id !== entryId) {
				return entry;
			}

			return {
				...entry,

				completed: true,

				completedAt: now,
			};
		});

		const updatedHistory: CalculationHistoryItem = {
			...existingHistory,

			items: updatedEntries,

			updatedAt: now,
		};

		/*
		 * Replace ONLY the parent History.
		 */
		const nextItems = currentItems.map((history) =>
			history.id === historyId ? updatedHistory : history,
		);

		/*
		 * Persist to localStorage.
		 */
		saveToStorage(nextItems);

		/*
		 * Update Zustand.
		 */
		set({
			items: nextItems,
		});

		return {
			history: updatedHistory,

			success: true,
		};
	},

	/*
	 * ========================================================
	 * RENAME HISTORY
	 * ========================================================
	 */

	renameHistory: (id, title) => {
		const cleanTitle = title.trim();

		if (!cleanTitle) {
			return;
		}

		const nextItems = get().items.map((item) =>
			item.id === id
				? {
						...item,

						title: cleanTitle,

						updatedAt: new Date().toISOString(),
					}
				: item,
		);

		saveToStorage(nextItems);

		set({
			items: nextItems,
		});
	},

	/*
	 * ========================================================
	 * TOGGLE PIN
	 * ========================================================
	 */

	togglePinHistory: (id) => {
		const nextItems = get().items.map((item) =>
			item.id === id
				? {
						...item,

						isPinned: !item.isPinned,

						updatedAt: new Date().toISOString(),
					}
				: item,
		);

		saveToStorage(nextItems);

		set({
			items: nextItems,
		});
	},

	/*
	 * ========================================================
	 * DELETE HISTORY
	 * ========================================================
	 *
	 * Deletes the entire History.
	 *
	 * This is different from:
	 *
	 * completeCalculationItem()
	 *
	 * which only completes one result.
	 */

	deleteHistory: (id) => {
		const nextItems = get().items.filter((item) => item.id !== id);

		saveToStorage(nextItems);

		set({
			items: nextItems,
		});
	},

	/*
	 * ========================================================
	 * CLEAR HISTORY
	 * ========================================================
	 */

	clearHistory: (module) => {
		/*
		 * Clear everything.
		 */
		if (!module) {
			localStorage.removeItem(STORAGE_KEY);

			set({
				items: [],
			});

			return;
		}

		/*
		 * Clear only one module.
		 */
		const nextItems = get().items.filter((item) => item.module !== module);

		saveToStorage(nextItems);

		set({
			items: nextItems,
		});
	},
}));
