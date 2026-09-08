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
	 * Consume resources from the inventory.
	 *
	 * Returns false when one or more resources
	 * are not available in sufficient quantity.
	 */
	consumeResources: (resources: Record<string, number>) => boolean;

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
			set({
				resources: {},
			});

			return;
		}

		try {
			const parsed = JSON.parse(saved);

			if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
				set({
					resources: {},
				});

				return;
			}

			set({
				resources: parsed,
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

	/**
	 * Consume multiple resources
	 * atomically.
	 *
	 * Example:
	 *
	 * consumeResources({
	 *   "design-plans": 151,
	 *   "polishing-solution": 905,
	 *   "hardened-alloy": 78250,
	 *   "lunar-amber": 21,
	 * })
	 *
	 * If even one resource is insufficient,
	 * NOTHING is changed.
	 */
	consumeResources: (required) => {
		const current = get().resources;

		/**
		 * Ignore invalid values and
		 * zero/negative requirements.
		 */
		const normalized = Object.entries(required).reduce<Record<string, number>>(
			(acc, [key, value]) => {
				const amount = Number(value);

				if (Number.isFinite(amount) && amount > 0) {
					acc[key] = amount;
				}

				return acc;
			},
			{},
		);

		/**
		 * Nothing to consume.
		 */
		if (Object.keys(normalized).length === 0) {
			return true;
		}

		/**
		 * FIRST PASS
		 *
		 * Check ALL resources before
		 * changing anything.
		 *
		 * This prevents partial consumption.
		 */
		for (const [key, requiredAmount] of Object.entries(normalized)) {
			const currentAmount = parseShortNumber(current[key] ?? "");

			if (!Number.isFinite(currentAmount) || currentAmount < requiredAmount) {
				return false;
			}
		}

		/**
		 * SECOND PASS
		 *
		 * All resources are available,
		 * so now calculate the new values.
		 */
		const next = {
			...current,
		};

		for (const [key, requiredAmount] of Object.entries(normalized)) {
			const currentAmount = parseShortNumber(current[key] ?? "");

			const remaining = Math.max(0, currentAmount - requiredAmount);

			next[key] = formatCompactNumber(remaining);
		}

		/**
		 * Persist inventory.
		 */
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

		/**
		 * Update Zustand.
		 */
		set({
			resources: next,
		});

		return true;
	},

	/**
	 * Convert Design Plans -> Lunar Amber
	 * Ratio 10 : 1
	 */
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
