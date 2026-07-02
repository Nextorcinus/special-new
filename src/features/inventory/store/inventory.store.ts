import { create } from "zustand";

type InventoryState = {
	resources: Record<string, string>;
	setResource: (id: string, value: string) => void;
	setResources: (resources: Record<string, string>) => void;
	loadResources: () => void;
	clearResources: () => void;
};

const STORAGE_KEY = "special-lazyness-inventory";

export const useInventoryStore = create<InventoryState>((set, get) => ({
	resources: {},

	setResource: (id, value) => {
		const nextResources = {
			...get().resources,
			[id]: value,
		};

		localStorage.setItem(STORAGE_KEY, JSON.stringify(nextResources));
		set({ resources: nextResources });
	},

	setResources: (resources) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
		set({ resources });
	},

	loadResources: () => {
		const saved = localStorage.getItem(STORAGE_KEY);

		if (!saved) return;

		try {
			set({ resources: JSON.parse(saved) });
		} catch {
			set({ resources: {} });
		}
	},

	clearResources: () => {
		localStorage.removeItem(STORAGE_KEY);
		set({ resources: {} });
	},
}));
