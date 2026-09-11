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
	loadHistory: () => Promise<void>;
	saveCalculation: (item: SaveCalculationPayload) => CalculationHistoryItem;
	updateCalculation: (
		id: string,
		item: SaveCalculationPayload,
	) => CalculationHistoryItem | null;
	addCalculationItem: (
		id: string,
		item: SaveCalculationPayload,
	) => CalculationHistoryItem | null;
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

function createId(module: string) {
	return `${module}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function saveToStorage(items: CalculationHistoryItem[]) {
	if (typeof window === "undefined") {
		return;
	}

	localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

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

function normalizeHistoryEntry<TForm = any, TResult = any>(
	entry: CalculationHistoryEntry<TForm, TResult>,
): CalculationHistoryEntry<TForm, TResult> {
	return {
		...entry,
		completed: entry.completed ?? false,
		completedAt: entry.completed ? entry.completedAt : undefined,
	};
}

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

async function getSession() {
	if (typeof window === "undefined") {
		return null;
	}

	try {
		const response = await fetch("/api/auth/session", {
			method: "GET",
			cache: "no-store",
		});

		if (!response.ok) {
			return null;
		}

		const session = await response.json();

		if (!session?.user?.id) {
			return null;
		}

		return session;
	} catch {
		return null;
	}
}

async function getRemoteHistory() {
	const response = await fetch("/api/history", {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Failed to load remote history");
	}

	const data = await response.json();

	if (!Array.isArray(data?.items)) {
		return [];
	}

	return data.items as CalculationHistoryItem[];
}

async function createRemoteHistory(item: CalculationHistoryItem) {
	const response = await fetch("/api/history", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(item),
	});

	if (!response.ok && response.status !== 409) {
		throw new Error("Failed to create remote history");
	}
}

async function updateRemoteHistory(id: string, item: CalculationHistoryItem) {
	const response = await fetch(`/api/history/${encodeURIComponent(id)}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(item),
	});

	if (!response.ok) {
		throw new Error("Failed to update remote history");
	}
}

async function deleteRemoteHistory(id: string) {
	const response = await fetch(`/api/history/${encodeURIComponent(id)}`, {
		method: "DELETE",
	});

	if (!response.ok && response.status !== 404) {
		throw new Error("Failed to delete remote history");
	}
}

async function clearRemoteHistory(module?: CalculationModule) {
	const histories = await getRemoteHistory();

	const targets = module
		? histories.filter((item) => item.module === module)
		: histories;

	await Promise.all(targets.map((item) => deleteRemoteHistory(item.id)));
}

async function syncLocalHistoryToRemote(
	localItems: CalculationHistoryItem[],
	remoteItems: CalculationHistoryItem[],
) {
	const remoteIds = new Set(remoteItems.map((item) => item.id));

	const localItemsToUpload = localItems.filter(
		(item) => !remoteIds.has(item.id),
	);

	await Promise.all(
		localItemsToUpload.map((item) => createRemoteHistory(item)),
	);
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
	items: [],

	loadHistory: async () => {
		if (typeof window === "undefined") {
			return;
		}

		const session = await getSession();

		if (!session) {
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

				saveToStorage(normalizedItems);
			} catch {
				set({
					items: [],
				});
			}

			return;
		}

		try {
			const localSaved = localStorage.getItem(STORAGE_KEY);

			let localItems: CalculationHistoryItem[] = [];

			if (localSaved) {
				try {
					const parsedLocal = JSON.parse(
						localSaved,
					) as CalculationHistoryItem[];

					if (Array.isArray(parsedLocal)) {
						localItems = parsedLocal.map(normalizeHistoryItem);
					}
				} catch {
					localItems = [];
				}
			}

			const remoteItems = await getRemoteHistory();

			await syncLocalHistoryToRemote(localItems, remoteItems);

			const syncedItems = await getRemoteHistory();

			set({
				items: syncedItems.map(normalizeHistoryItem),
			});

			localStorage.removeItem(STORAGE_KEY);
		} catch {
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

				set({
					items: parsedItems.map(normalizeHistoryItem),
				});
			} catch {
				set({
					items: [],
				});
			}
		}
	},

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

		set({
			items: nextItems,
		});

		void getSession().then(async (session) => {
			if (!session) {
				saveToStorage(nextItems);
				return;
			}

			try {
				await createRemoteHistory(newItem);
			} catch {}
		});

		return newItem;
	},

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
				id: entry.id,
				title: updatedEntry.title,
				subtitle: updatedEntry.subtitle,
				form: updatedEntry.form,
				result: updatedEntry.result,
				completed: false,
				completedAt: undefined,
			};
		});

		const updatedItem: CalculationHistoryItem = {
			...existingItem,
			form: item.form,
			result: item.result,
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

		set({
			items: nextItems,
		});

		void getSession().then(async (session) => {
			if (!session) {
				saveToStorage(nextItems);
				return;
			}

			try {
				await updateRemoteHistory(id, updatedItem);
			} catch {}
		});

		return updatedItem;
	},

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

		set({
			items: nextItems,
		});

		void getSession().then(async (session) => {
			if (!session) {
				saveToStorage(nextItems);
				return;
			}

			try {
				await updateRemoteHistory(id, updatedItem);
			} catch {}
		});

		return updatedItem;
	},

	completeCalculationItem: (historyId, entryId) => {
		const currentItems = get().items;

		const existingHistory = currentItems.find(
			(history) => history.id === historyId,
		);

		if (!existingHistory) {
			return {
				history: null,
				success: false,
				reason: "NOT_FOUND",
			};
		}

		const existingEntries =
			existingHistory.items && existingHistory.items.length > 0
				? existingHistory.items.map(normalizeHistoryEntry)
				: [createLegacyHistoryEntry(existingHistory)];

		const existingEntry = existingEntries.find((entry) => entry.id === entryId);

		if (!existingEntry) {
			return {
				history: existingHistory,
				success: false,
				reason: "NOT_FOUND",
			};
		}

		if (existingEntry.completed === true) {
			return {
				history: existingHistory,
				success: false,
				reason: "ALREADY_COMPLETED",
			};
		}

		const now = new Date().toISOString();

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

		const nextItems = currentItems.map((history) =>
			history.id === historyId ? updatedHistory : history,
		);

		set({
			items: nextItems,
		});

		void getSession().then(async (session) => {
			if (!session) {
				saveToStorage(nextItems);
				return;
			}

			try {
				await updateRemoteHistory(historyId, updatedHistory);
			} catch {}
		});

		return {
			history: updatedHistory,
			success: true,
		};
	},

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

		set({
			items: nextItems,
		});

		const updatedItem = nextItems.find((item) => item.id === id);

		void getSession().then(async (session) => {
			if (!session) {
				saveToStorage(nextItems);
				return;
			}

			if (!updatedItem) {
				return;
			}

			try {
				await updateRemoteHistory(id, updatedItem);
			} catch {}
		});
	},

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

		set({
			items: nextItems,
		});

		const updatedItem = nextItems.find((item) => item.id === id);

		void getSession().then(async (session) => {
			if (!session) {
				saveToStorage(nextItems);
				return;
			}

			if (!updatedItem) {
				return;
			}

			try {
				await updateRemoteHistory(id, updatedItem);
			} catch {}
		});
	},

	deleteHistory: (id) => {
		const nextItems = get().items.filter((item) => item.id !== id);

		set({
			items: nextItems,
		});

		void getSession().then(async (session) => {
			if (!session) {
				saveToStorage(nextItems);
				return;
			}

			try {
				await deleteRemoteHistory(id);
			} catch {}
		});
	},

	clearHistory: (module) => {
		const currentItems = get().items;

		const nextItems = module
			? currentItems.filter((item) => item.module !== module)
			: [];

		set({
			items: nextItems,
		});

		void getSession().then(async (session) => {
			if (!session) {
				if (!module) {
					localStorage.removeItem(STORAGE_KEY);
					return;
				}

				saveToStorage(nextItems);
				return;
			}

			try {
				await clearRemoteHistory(module);
			} catch {}
		});
	},
}));
