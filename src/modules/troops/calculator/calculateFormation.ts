import type { TroopCounts, TroopLegion, TroopRatio } from "../type";

import { createLegion } from "../utils/TroopAssistantUtils";

/*
 * ============================================================
 * CONSTANTS
 * ============================================================
 */

export const TUMBLING_VALUES = [
	0, 1500, 3000, 4500, 6000, 7500, 9000, 10500, 12000, 13500, 15000,
] as const;

export const URSA_BANE_VALUES = [
	0, 3000, 6000, 9000, 12000, 15000, 18000, 21000, 24000, 27000, 30000,
] as const;

/*
 * ============================================================
 * LOCAL TYPES
 * ============================================================
 */

export type FormationBuff = {
	tumbling: number;
	ursaBane: number;
	cityBuff: number;
	total: number;
};

export type FormationCapacity = {
	rallySize: number;
	joinerSize: number;
	joinerCount: number;
	maxJoinerCapacity: number;
	totalCapacity: number;
};

export type FormationOptions = {
	totalTroops: TroopCounts;
	rallySize: number;
	joinerSize: number;
	joinerCount: number;
	tumblingLevel?: number;
	ursaBaneLevel?: number;
	cityBuff?: number;
};

export type FormationResult = {
	legions: TroopLegion[];
	buff: FormationBuff;
	capacity: FormationCapacity;
	totalTroops: TroopCounts;
};

export type BearTrapFormationOptions = {
	totalTroops: TroopCounts;
	rallySize: number;
	joinerSize: number;
	joinerCount: number;
};

/*
 * ============================================================
 * SAFE HELPERS
 * ============================================================
 */

function safeNumber(value: unknown): number {
	const number = Number(value);

	if (!Number.isFinite(number)) {
		return 0;
	}

	return Math.max(0, number);
}

function safeInteger(value: unknown): number {
	return Math.floor(safeNumber(value));
}

/*
 * ============================================================
 * NORMALIZE JOINER SIZE
 * ============================================================
 *
 * The joiner march cannot exceed the total troop inventory
 * divided by the number of joiners.
 */

export function normalizeJoinerSize({
	joinerSize,
	totalTroops,
	joinerCount,
}: {
	joinerSize: number;
	totalTroops: TroopCounts;
	joinerCount: number;
}): number {
	const safeJoinerSize = safeInteger(joinerSize);

	const safeJoinerCount = safeInteger(joinerCount);

	if (safeJoinerSize <= 0 || safeJoinerCount <= 0) {
		return 0;
	}

	const total =
		safeNumber(totalTroops.infantry) +
		safeNumber(totalTroops.lancer) +
		safeNumber(totalTroops.marksman);

	if (total <= 0) {
		return 0;
	}

	const maxCapacity = Math.floor(total / safeJoinerCount);

	return Math.min(safeJoinerSize, maxCapacity);
}

/*
 * ============================================================
 * MAX JOINER CAPACITY
 * ============================================================
 */

export function calculateMaxJoinerCapacity({
	totalTroops,
	joinerCount,
}: {
	totalTroops: TroopCounts;
	joinerCount: number;
}): number {
	const count = safeInteger(joinerCount);

	if (count <= 0) {
		return 0;
	}

	const total =
		safeNumber(totalTroops.infantry) +
		safeNumber(totalTroops.lancer) +
		safeNumber(totalTroops.marksman);

	if (total <= 0) {
		return 0;
	}

	return Math.floor(total / count);
}

/*
 * ============================================================
 * FORMATION BUFF
 * ============================================================
 *
 * Legacy calculation:
 *
 * base rally
 * + Tumbling / Snow Ape
 * + Ursa's Bane
 * + city percentage buff
 *
 * City buff is applied after the flat buffs.
 */

export function calculateFormationBuff({
	rallySize,
	tumblingLevel = 0,
	ursaBaneLevel = 0,
	cityBuff = 0,
}: {
	rallySize: number;
	tumblingLevel?: number;
	ursaBaneLevel?: number;
	cityBuff?: number;
}): FormationBuff {
	const safeRallySize = safeNumber(rallySize);

	const safeTumblingLevel = Math.max(
		0,
		Math.min(TUMBLING_VALUES.length - 1, safeInteger(tumblingLevel)),
	);

	const safeUrsaBaneLevel = Math.max(
		0,
		Math.min(URSA_BANE_VALUES.length - 1, safeInteger(ursaBaneLevel)),
	);

	const safeCityBuff = Math.max(0, safeNumber(cityBuff));

	const tumbling = TUMBLING_VALUES[safeTumblingLevel] ?? 0;

	const ursaBane = URSA_BANE_VALUES[safeUrsaBaneLevel] ?? 0;

	const beforeCityBuff = safeRallySize + tumbling + ursaBane;

	const cityBuffValue = Math.floor(beforeCityBuff * safeCityBuff);

	const total = beforeCityBuff + cityBuffValue;

	return {
		tumbling,
		ursaBane,
		cityBuff: cityBuffValue,
		total,
	};
}

/*
 * ============================================================
 * FORMATION CAPACITY
 * ============================================================
 */

export function createFormationOptions({
	totalTroops,
	rallySize,
	joinerSize,
	joinerCount,
}: {
	totalTroops: TroopCounts;
	rallySize: number;
	joinerSize: number;
	joinerCount: number;
}): FormationCapacity {
	const safeRallySize = safeInteger(rallySize);

	const safeJoinerCount = safeInteger(joinerCount);

	const maxJoinerCapacity = calculateMaxJoinerCapacity({
		totalTroops,
		joinerCount: safeJoinerCount,
	});

	const normalizedJoinerSize = normalizeJoinerSize({
		joinerSize,
		totalTroops,
		joinerCount: safeJoinerCount,
	});

	const effectiveJoinerSize =
		normalizedJoinerSize > 0 ? normalizedJoinerSize : maxJoinerCapacity;

	const totalCapacity = safeRallySize + effectiveJoinerSize * safeJoinerCount;

	return {
		rallySize: safeRallySize,

		joinerSize: effectiveJoinerSize,

		joinerCount: safeJoinerCount,

		maxJoinerCapacity,

		totalCapacity,
	};
}

/*
 * ============================================================
 * BEAR TRAP FORMATION
 * ============================================================
 *
 * Creates:
 *
 * 1 Rally Starter
 * + N Joiner Marches
 */

export function calculateBearTrapFormation({
	totalTroops,
	rallySize,
	joinerSize,
	joinerCount,
}: BearTrapFormationOptions): TroopLegion[] {
	const safeRallySize = safeInteger(rallySize);

	const safeJoinerCount = safeInteger(joinerCount);

	const normalizedJoinerSize = normalizeJoinerSize({
		joinerSize,
		totalTroops,
		joinerCount: safeJoinerCount,
	});

	const formations: TroopLegion[] = [];

	/*
	 * Rally Starter.
	 */
	formations.push(createLegion(safeRallySize, "Rally Starter"));

	/*
	 * Joiner Marches.
	 */
	for (let index = 0; index < safeJoinerCount; index += 1) {
		formations.push(createLegion(normalizedJoinerSize));
	}

	return formations;
}

/*
 * ============================================================
 * FULL FORMATION CALCULATION
 * ============================================================
 *
 * This is the main formation calculation entry point.
 */

export function calculateFormation(options: FormationOptions): FormationResult {
	const {
		totalTroops,
		rallySize,
		joinerSize,
		joinerCount,
		tumblingLevel = 0,
		ursaBaneLevel = 0,
		cityBuff = 0,
	} = options;

	const safeTroops: TroopCounts = {
		infantry: safeNumber(totalTroops.infantry),

		lancer: safeNumber(totalTroops.lancer),

		marksman: safeNumber(totalTroops.marksman),
	};

	const buff = calculateFormationBuff({
		rallySize,
		tumblingLevel,
		ursaBaneLevel,
		cityBuff,
	});

	const capacity = createFormationOptions({
		totalTroops: safeTroops,

		rallySize: buff.total,

		joinerSize,

		joinerCount,
	});

	const legions = calculateBearTrapFormation({
		totalTroops: safeTroops,

		rallySize: buff.total,

		joinerSize: capacity.joinerSize,

		joinerCount: capacity.joinerCount,
	});

	return {
		legions,
		buff,
		capacity,
		totalTroops: safeTroops,
	};
}

/*
 * ============================================================
 * MERGE FORMATION RESULTS
 * ============================================================
 *
 * Used when an existing formation already has locked
 * legions or existing ratios.
 */

export function mergeFormationResults(
	currentLegions: TroopLegion[],
	newLegions: TroopLegion[],
): TroopLegion[] {
	return newLegions.map((newLegion, index) => {
		const current = currentLegions[index];

		if (!current) {
			return {
				...newLegion,
			};
		}

		const ratio: TroopRatio = current.ratio ?? {
			infantry: 1,
			lancer: 1,
			marksman: 98,
		};

		return {
			...newLegion,

			id: current.id,

			name: newLegion.name ?? current.name,

			isLocked: current.isLocked,

			ratio: {
				infantry: safeNumber(ratio.infantry),

				lancer: safeNumber(ratio.lancer),

				marksman: safeNumber(ratio.marksman),
			},
		};
	});
}

/*
 * ============================================================
 * CONVENIENCE FORMATION CALCULATION
 * ============================================================
 *
 * This keeps the API simple for callers that only need
 * the formation itself.
 */

export function calculateFormationLegions({
	totalTroops,
	rallySize,
	joinerSize,
	joinerCount,
	tumblingLevel = 0,
	ursaBaneLevel = 0,
	cityBuff = 0,
}: FormationOptions): TroopLegion[] {
	const result = calculateFormation({
		totalTroops,
		rallySize,
		joinerSize,
		joinerCount,
		tumblingLevel,
		ursaBaneLevel,
		cityBuff,
	});

	return result.legions;
}

/*
 * ============================================================
 * FORMATION SUMMARY
 * ============================================================
 */

export function calculateFormationSummary({
	totalTroops,
	rallySize,
	joinerSize,
	joinerCount,
	tumblingLevel = 0,
	ursaBaneLevel = 0,
	cityBuff = 0,
}: FormationOptions) {
	const result = calculateFormation({
		totalTroops,
		rallySize,
		joinerSize,
		joinerCount,
		tumblingLevel,
		ursaBaneLevel,
		cityBuff,
	});

	const totalRequired = result.legions.reduce<TroopCounts>(
		(accumulator, legion) => ({
			infantry: accumulator.infantry + safeNumber(legion.infantry),

			lancer: accumulator.lancer + safeNumber(legion.lancer),

			marksman: accumulator.marksman + safeNumber(legion.marksman),
		}),
		{
			infantry: 0,
			lancer: 0,
			marksman: 0,
		},
	);

	return {
		...result,
		totalRequired,
	};
}
