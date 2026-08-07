import { create } from "zustand";

import { formatCompactNumber, parseShortNumber } from "@/lib/number";

const STORAGE_KEY = "special-lazyness-inventory";

type InventoryState = {
	resources: Record<string, string>;

	setResource: (id: string, value: string) => void;

	setResources: (resources: Record<string, string>) => void;

	loadResources: () => void;

	clearResources: () => void;

	/**
	 * Convert Design Plans -> Lunar Amber
	 * Ratio 10 : 1
	 */
	exchangeDesignPlans: (amberAmount: number) => boolean;
};

export const useInventoryStore = create<InventoryState>((set, get) => ({
	resources: {},

	setResource: (id, value) => {
		const next = {
			...get().resources,
			[id]: value,
		};

		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

		set({
			resources: next,
		});
	},

	setResources: (resources) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));

		set({
			resources,
		});
	},

	loadResources: () => {
		const saved = localStorage.getItem(STORAGE_KEY);

		if (!saved) {
			return;
		}

		try {
			set({
				resources: JSON.parse(saved),
			});
		} catch {
			set({
				resources: {},
			});
		}
	},

	clearResources: () => {
		localStorage.removeItem(STORAGE_KEY);

		set({
			resources: {},
		});
	},

	exchangeDesignPlans: (amberAmount) => {
		if (!Number.isFinite(amberAmount) || amberAmount <= 0) {
			return false;
		}

		const resources = get().resources;

		const plans = parseShortNumber(resources["design-plans"] ?? "");

		const amber = parseShortNumber(resources["lunar-amber"] ?? "");

		const requiredPlans = amberAmount * 10;

		if (plans < requiredPlans) {
			return false;
		}

		const next = {
			...resources,

			"design-plans": formatCompactNumber(plans - requiredPlans),

			"lunar-amber": formatCompactNumber(amber + amberAmount),
		};

		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

		set({
			resources: next,
		});

		return true;
	},
}));
