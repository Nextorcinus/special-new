import type { ResourceKey } from "@/config/resources";
import { useInventoryStore } from "@/features/inventory/store/inventory.store";
import { formatCompactNumber, parseShortNumber } from "@/lib/number";

type ResourceAmount = {
	key: ResourceKey;
	amount: number;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
	return typeof value === "object" && value !== null;
}

function normalizeKey(value: string) {
	return value
		.toLowerCase()
		.replace(/[\s_-]+/g, "")
		.replace(/[^\w]/g, "");
}

/**
 * Convert every possible resource naming
 * convention into the canonical ResourceKey.
 *
 * The calculator can use:
 *
 * Design Plans
 * design-plans
 * designPlans
 * Plans
 *
 * while Inventory uses its own resource IDs.
 */
const RESOURCE_ALIASES: Record<string, ResourceKey> = {
	designplans: "designPlans" as ResourceKey,

	designplan: "designPlans" as ResourceKey,

	plans: "designPlans" as ResourceKey,

	polishingsolution: "polishingSolution" as ResourceKey,

	polishingsolutions: "polishingSolution" as ResourceKey,

	polish: "polishingSolution" as ResourceKey,

	hardenedalloy: "hardenedAlloy" as ResourceKey,

	alloy: "hardenedAlloy" as ResourceKey,

	lunaramber: "lunarAmber" as ResourceKey,

	amber: "lunarAmber" as ResourceKey,

	meat: "meat" as ResourceKey,

	wood: "wood" as ResourceKey,

	coal: "coal" as ResourceKey,

	iron: "iron" as ResourceKey,

	crystal: "crystal" as ResourceKey,

	rfc: "rfc" as ResourceKey,
};

function resolveResourceKey(value: unknown): ResourceKey | null {
	if (typeof value !== "string") {
		return null;
	}

	const normalized = normalizeKey(value);

	return RESOURCE_ALIASES[normalized] ?? null;
}

/**
 * Convert:
 *
 * 100
 * "100"
 * "1K"
 * "1.5K"
 * "2M"
 * "1.2B"
 *
 * into a number.
 */
function toNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value !== "string") {
		return null;
	}

	const cleaned = value.replace(/,/g, "").trim();

	if (!cleaned) {
		return null;
	}

	/**
	 * First try the project's own
	 * number parser.
	 *
	 * This supports the same format
	 * used by Inventory.
	 */
	const parsedShort = parseShortNumber(cleaned);

	if (Number.isFinite(parsedShort)) {
		return parsedShort;
	}

	/**
	 * Fallback parser.
	 */
	const match = cleaned.match(/^([\d.]+)\s*([kmb])?$/i);

	if (!match) {
		const parsed = Number(cleaned);

		return Number.isFinite(parsed) ? parsed : null;
	}

	const base = Number(match[1]);

	if (!Number.isFinite(base)) {
		return null;
	}

	const suffix = match[2]?.toLowerCase();

	switch (suffix) {
		case "k":
			return base * 1_000;

		case "m":
			return base * 1_000_000;

		case "b":
			return base * 1_000_000_000;

		default:
			return base;
	}
}

function addResource(
	resources: ResourceAmount[],
	key: ResourceKey,
	amount: number,
) {
	if (!Number.isFinite(amount) || amount <= 0) {
		return;
	}

	const existing = resources.find((resource) => resource.key === key);

	if (existing) {
		existing.amount += amount;

		return;
	}

	resources.push({
		key,
		amount,
	});
}

/**
 * Extract resources from:
 *
 * {
 *   designPlans: 100
 * }
 *
 * or:
 *
 * {
 *   Plans: 100
 * }
 *
 * or nested structures.
 */
function extractFromObject(value: unknown, resources: ResourceAmount[]) {
	if (!isRecord(value)) {
		return;
	}

	for (const [rawKey, rawValue] of Object.entries(value)) {
		const resourceKey = resolveResourceKey(rawKey);

		if (resourceKey) {
			const amount = toNumber(rawValue);

			if (amount !== null) {
				addResource(resources, resourceKey, amount);
			}

			continue;
		}

		if (isRecord(rawValue)) {
			const nestedResource =
				resolveResourceKey(rawValue.resource) ??
				resolveResourceKey(rawValue.key) ??
				resolveResourceKey(rawValue.name);

			if (nestedResource) {
				const amount =
					toNumber(rawValue.amount) ??
					toNumber(rawValue.value) ??
					toNumber(rawValue.quantity) ??
					toNumber(rawValue.required);

				if (amount !== null) {
					addResource(resources, nestedResource, amount);
				}
			}
		}
	}
}

/**
 * Extract resources from arrays such as:
 *
 * [
 *   {
 *     resource: "designPlans",
 *     amount: 100
 *   }
 * ]
 */
function extractFromArray(value: unknown, resources: ResourceAmount[]) {
	if (!Array.isArray(value)) {
		return;
	}

	for (const item of value) {
		if (!isRecord(item)) {
			continue;
		}

		const resourceKey =
			resolveResourceKey(item.resource) ??
			resolveResourceKey(item.key) ??
			resolveResourceKey(item.name) ??
			resolveResourceKey(item.type);

		if (!resourceKey) {
			continue;
		}

		const amount =
			toNumber(item.amount) ??
			toNumber(item.value) ??
			toNumber(item.quantity) ??
			toNumber(item.required) ??
			toNumber(item.cost);

		if (amount !== null) {
			addResource(resources, resourceKey, amount);
		}
	}
}

/**
 * Extract all required resources
 * from a calculator result.
 */
export function extractRequiredResources(result: unknown): ResourceAmount[] {
	const resources: ResourceAmount[] = [];

	if (!isRecord(result)) {
		return resources;
	}

	/**
	 * Most common resource containers.
	 */
	const directCandidates = [
		result.resources,
		result.requiredResources,
		result.requirements,
		result.cost,
		result.materials,
	];

	for (const candidate of directCandidates) {
		extractFromObject(candidate, resources);

		extractFromArray(candidate, resources);
	}

	/**
	 * Search one level deeper.
	 */
	for (const [key, value] of Object.entries(result)) {
		if (
			key === "resources" ||
			key === "requiredResources" ||
			key === "requirements" ||
			key === "cost" ||
			key === "materials"
		) {
			continue;
		}

		if (!isRecord(value)) {
			continue;
		}

		extractFromObject(value.resources, resources);

		extractFromObject(value.requiredResources, resources);

		extractFromObject(value.requirements, resources);

		extractFromArray(value.resources, resources);

		extractFromArray(value.requiredResources, resources);

		extractFromArray(value.requirements, resources);
	}

	return resources;
}

/**
 * Convert canonical ResourceKey into
 * the actual Inventory storage key.
 *
 * ResourceKey:
 *
 * designPlans
 * hardenedAlloy
 * polishingSolution
 * lunarAmber
 *
 * Inventory:
 *
 * design-plans
 * hardened-alloy
 * polishing-solution
 * lunar-amber
 */
const INVENTORY_KEY_MAP: Partial<Record<ResourceKey, string>> = {
	designPlans: "design-plans",

	hardenedAlloy: "hardened-alloy",

	polishingSolution: "polishing-solution",

	lunarAmber: "lunar-amber",

	meat: "meat",

	wood: "wood",

	coal: "coal",

	iron: "iron",

	crystal: "crystal",

	rfc: "rfc",
};

function getInventoryKey(key: ResourceKey): string {
	return INVENTORY_KEY_MAP[key] ?? key;
}

/**
 * Consume all resources required
 * by a calculator result.
 *
 * This function is intentionally
 * all-or-nothing.
 *
 * If one resource is insufficient:
 *
 * NOTHING is consumed.
 */
export function consumeHistoryResources(result: unknown): {
	success: boolean;
	resources: ResourceAmount[];
} {
	const requiredResources = extractRequiredResources(result);

	/**
	 * No resources required.
	 */
	if (requiredResources.length === 0) {
		return {
			success: true,
			resources: [],
		};
	}

	const inventoryState = useInventoryStore.getState();

	const currentResources = inventoryState.resources;

	/**
	 * ============================================================
	 * CHECK ALL RESOURCES FIRST
	 * ============================================================
	 *
	 * Do NOT modify Inventory yet.
	 */
	for (const resource of requiredResources) {
		const inventoryKey = getInventoryKey(resource.key);

		const rawCurrentAmount = currentResources[inventoryKey];

		const currentAmount = parseShortNumber(rawCurrentAmount ?? "0");

		if (!Number.isFinite(currentAmount) || currentAmount < resource.amount) {
			return {
				success: false,

				resources: requiredResources,
			};
		}
	}

	/**
	 * ============================================================
	 * CALCULATE NEXT INVENTORY
	 * ============================================================
	 */

	const nextResources = {
		...currentResources,
	};

	for (const resource of requiredResources) {
		const inventoryKey = getInventoryKey(resource.key);

		const currentAmount = parseShortNumber(nextResources[inventoryKey] ?? "0");

		const nextAmount = Math.max(0, currentAmount - resource.amount);

		nextResources[inventoryKey] = formatCompactNumber(nextAmount);
	}

	/**
	 * ============================================================
	 * SAVE INVENTORY
	 * ============================================================
	 */

	inventoryState.setResources(nextResources);

	return {
		success: true,

		resources: requiredResources,
	};
}
