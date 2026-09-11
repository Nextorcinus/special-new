import { create } from "zustand";

import { formatCompactNumber, parseShortNumber } from "@/lib/number";

const STORAGE_KEY = "special-lazyness-inventory";

type InventoryResources = Record<string, string>;

type InventoryState = {
	resources: InventoryResources;

	setResource: (id: string, value: string) => void;

	setResources: (resources: InventoryResources) => void;

	loadResources: () => Promise<void>;

	clearResources: () => void;

	consumeResources: (resources: Record<string, number>) => boolean;

	exchangeDesignPlans: (amberAmount: number) => boolean;
};

function saveToStorage(resources: InventoryResources) {
	if (typeof window === "undefined") {
		return;
	}

	localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
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

async function getRemoteInventory(): Promise<InventoryResources> {
	const response = await fetch("/api/inventory", {
		method: "GET",
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Failed to load remote inventory");
	}

	const data = await response.json();

	if (
		!data?.resources ||
		typeof data.resources !== "object" ||
		Array.isArray(data.resources)
	) {
		return {};
	}

	return data.resources as InventoryResources;
}

async function saveRemoteInventory(resources: InventoryResources) {
	const response = await fetch("/api/inventory", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			resources,
		}),
	});

	if (!response.ok) {
		throw new Error("Failed to save remote inventory");
	}
}

async function deleteRemoteInventory() {
	const response = await fetch("/api/inventory", {
		method: "DELETE",
	});

	if (!response.ok) {
		throw new Error("Failed to delete remote inventory");
	}
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
	resources: {},

	setResource: (id, value) => {
		const next = {
			...get().resources,
			[id]: value,
		};

		set({
			resources: next,
		});

		void getSession().then(async (session) => {
			if (!session) {
				saveToStorage(next);
				return;
			}

			try {
				await saveRemoteInventory(next);
				localStorage.removeItem(STORAGE_KEY);
			} catch {
				saveToStorage(next);
			}
		});
	},

	setResources: (resources) => {
		set({
			resources,
		});

		void getSession().then(async (session) => {
			if (!session) {
				saveToStorage(resources);
				return;
			}

			try {
				await saveRemoteInventory(resources);
				localStorage.removeItem(STORAGE_KEY);
			} catch {
				saveToStorage(resources);
			}
		});
	},

	loadResources: async () => {
		if (typeof window === "undefined") {
			return;
		}

		const session = await getSession();

		if (!session) {
			const saved = localStorage.getItem(STORAGE_KEY);

			if (!saved) {
				set({
					resources: {},
				});

				return;
			}

			try {
				const parsed = JSON.parse(saved);

				if (
					!parsed ||
					typeof parsed !== "object" ||
					Array.isArray(parsed)
				) {
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

			return;
		}

		try {
			const localSaved = localStorage.getItem(STORAGE_KEY);

			if (localSaved) {
				try {
					const localResources = JSON.parse(localSaved);

					if (
						localResources &&
						typeof localResources === "object" &&
						!Array.isArray(localResources)
					) {
						await saveRemoteInventory(localResources);

						localStorage.removeItem(STORAGE_KEY);

						set({
							resources: localResources,
						});

						return;
					}
				} catch {}
			}

			const remoteResources = await getRemoteInventory();

			set({
				resources: remoteResources,
			});
		} catch {
			const saved = localStorage.getItem(STORAGE_KEY);

			if (!saved) {
				set({
					resources: {},
				});

				return;
			}

			try {
				const parsed = JSON.parse(saved);

				if (
					parsed &&
					typeof parsed === "object" &&
					!Array.isArray(parsed)
				) {
					set({
						resources: parsed,
					});
				}
			} catch {
				set({
					resources: {},
				});
			}
		}
	},

	clearResources: () => {
		set({
			resources: {},
		});

		void getSession().then(async (session) => {
			if (!session) {
				localStorage.removeItem(STORAGE_KEY);
				return;
			}

			try {
				await deleteRemoteInventory();
				localStorage.removeItem(STORAGE_KEY);
			} catch {
				saveToStorage({});
			}
		});
	},

	consumeResources: (required) => {
		const current = get().resources;

		const normalized = Object.entries(required).reduce<
			Record<string, number>
		>((acc, [key, value]) => {
			const amount = Number(value);

			if (Number.isFinite(amount) && amount > 0) {
				acc[key] = amount;
			}

			return acc;
		}, {});

		if (Object.keys(normalized).length === 0) {
			return true;
		}

		for (const [key, requiredAmount] of Object.entries(normalized)) {
			const currentAmount = parseShortNumber(current[key] ?? "");

			if (
				!Number.isFinite(currentAmount) ||
				currentAmount < requiredAmount
			) {
				return false;
			}
		}

		const next = {
			...current,
		};

		for (const [key, requiredAmount] of Object.entries(normalized)) {
			const currentAmount = parseShortNumber(current[key] ?? "");

			const remaining = Math.max(0, currentAmount - requiredAmount);

			next[key] = formatCompactNumber(remaining);
		}

		set({
			resources: next,
		});

		void getSession().then(async (session) => {
			if (!session) {
				saveToStorage(next);
				return;
			}

			try {
				await saveRemoteInventory(next);
				localStorage.removeItem(STORAGE_KEY);
			} catch {
				saveToStorage(next);
			}
		});

		return true;
	},

	exchangeDesignPlans: (amberAmount) => {
		if (!Number.isFinite(amberAmount) || amberAmount <= 0) {
			return false;
		}

		const resources = get().resources;

		const plans = parseShortNumber(
			resources["design-plans"] ?? "",
		);

		const amber = parseShortNumber(
			resources["lunar-amber"] ?? "",
		);

		const requiredPlans = amberAmount * 10;

		if (plans < requiredPlans) {
			return false;
		}

		const next = {
			...resources,
			"design-plans": formatCompactNumber(
				plans - requiredPlans,
			),
			"lunar-amber": formatCompactNumber(
				amber + amberAmount,
			),
		};

		set({
			resources: next,
		});

		void getSession().then(async (session) => {
			if (!session) {
				saveToStorage(next);
				return;
			}

			try {
				await saveRemoteInventory(next);
				localStorage.removeItem(STORAGE_KEY);
			} catch {
				saveToStorage(next);
			}
		});

		return true;
	},
}));