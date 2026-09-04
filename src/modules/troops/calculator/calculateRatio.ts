import type { TroopCounts, TroopLegion, TroopRatio } from "../type";

import type {
	CalculatePreferredRatioOptions,
	CalculateRemainingTroopsOptions,
	CalculateSuggestedRatioOptions,
	SimulateTroopDistributionOptions,
	TroopDistributionSimulation,
} from "./types";

/**
 * Safe numeric helper.
 */
function safeNumber(value: unknown): number {
	const number = Number(value);

	if (!Number.isFinite(number)) {
		return 0;
	}

	return Math.max(0, number);
}

/**
 * Calculate remaining troops from the current inventory
 * after subtracting troops already assigned to locked legions.
 */
export function calculateRemainingTroops({
	troops,
	legions,
}: CalculateRemainingTroopsOptions): TroopCounts {
	const safeTroops: TroopCounts = {
		infantry: safeNumber(troops.infantry),
		lancer: safeNumber(troops.lancer),
		marksman: safeNumber(troops.marksman),
	};

	const lockedLegions = legions.filter((legion) => legion.isLocked);

	const lockedUsed = lockedLegions.reduce<TroopCounts>(
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
		infantry: Math.max(0, safeTroops.infantry - lockedUsed.infantry),

		lancer: Math.max(0, safeTroops.lancer - lockedUsed.lancer),

		marksman: Math.max(0, safeTroops.marksman - lockedUsed.marksman),
	};
}

/**
 * Calculate total capacity of unlocked legions.
 */
export function calculateUnlockedCapacity(legions: TroopLegion[]): number {
	return legions
		.filter((legion) => !legion.isLocked)
		.reduce((sum, legion) => sum + safeNumber(legion.maxSize), 0);
}

/**
 * Calculate raw troop ratio from remaining troops.
 *
 * The result is normalized to exactly 100%.
 */
export function calculateRawRatio(remainingTroops: TroopCounts): TroopRatio {
	const infantry = safeNumber(remainingTroops.infantry);

	const lancer = safeNumber(remainingTroops.lancer);

	const marksman = safeNumber(remainingTroops.marksman);

	const total = infantry + lancer + marksman;

	if (total <= 0) {
		return {
			infantry: 0,
			lancer: 0,
			marksman: 0,
		};
	}

	const rawInfantry = Math.floor((infantry / total) * 100);

	const rawLancer = Math.floor((lancer / total) * 100);

	const rawMarksman = Math.floor((marksman / total) * 100);

	/*
	 * Because flooring each value independently
	 * can result in 99%, calculate the final
	 * Marksman value from the remainder.
	 */
	const normalizedMarksman = Math.max(0, 100 - rawInfantry - rawLancer);

	return {
		infantry: rawInfantry,
		lancer: rawLancer,
		marksman: normalizedMarksman,
	};
}

/**
 * Calculate preferred ratio.
 *
 * Default:
 * 1 : 1 : 98
 *
 * Rules:
 * - Infantry cannot exceed 5%.
 * - Lancer must be greater than Infantry.
 * - Marksman must be greater than Lancer.
 * - If Marksman is insufficient for 1:1:98,
 *   adapt the ratio based on the actual Marksman supply.
 */
export function calculatePreferredRatio({
	remainingTroops,
	unlockedCapacity,
}: CalculatePreferredRatioOptions): TroopRatio {
	const capacity = safeNumber(unlockedCapacity);

	if (capacity <= 0) {
		return {
			infantry: 0,
			lancer: 0,
			marksman: 0,
		};
	}

	let infantry = 1;
	let lancer = 1;
	let marksman = 98;

	const availableMarksman = safeNumber(remainingTroops.marksman);

	const idealMarksman = Math.floor(capacity * 0.98);

	const hasEnoughMarksman = availableMarksman >= idealMarksman;

	/*
	 * Only adjust the default ratio when
	 * Marksman is actually insufficient.
	 */
	if (!hasEnoughMarksman) {
		const actualMarksman = Math.floor((availableMarksman / capacity) * 100);

		marksman = Math.max(actualMarksman, 50);

		/*
		 * Never allow Marksman to consume
		 * the entire ratio.
		 */
		marksman = Math.min(marksman, 98);

		const remaining = 100 - marksman;

		/*
		 * Keep Lancer above Infantry.
		 */
		lancer = Math.max(infantry + 1, remaining - 1);

		/*
		 * Infantry remains capped at 5%.
		 */
		infantry = Math.min(5, Math.max(0, 100 - lancer - marksman));
	}

	/*
	 * Enforce Infantry limit.
	 */
	infantry = Math.min(5, Math.max(0, infantry));

	/*
	 * Make sure Lancer is greater than Infantry.
	 */
	if (lancer <= infantry) {
		lancer = infantry + 1;
	}

	/*
	 * Make sure Marksman is greater than Lancer.
	 */
	if (marksman <= lancer) {
		marksman = lancer + 1;
	}

	/*
	 * Normalize the ratio.
	 */
	const total = infantry + lancer + marksman;

	if (total <= 0) {
		return {
			infantry: 0,
			lancer: 0,
			marksman: 0,
		};
	}

	infantry = Math.round((infantry / total) * 100);

	lancer = Math.round((lancer / total) * 100);

	marksman = 100 - infantry - lancer;

	/*
	 * Final safety normalization.
	 */
	infantry = Math.max(0, Math.min(5, infantry));

	lancer = Math.max(0, lancer);

	marksman = Math.max(0, 100 - infantry - lancer);

	return {
		infantry,
		lancer,
		marksman,
	};
}

/**
 * Simulate how remaining troops are consumed
 * by unlocked legions.
 *
 * Distribution priority:
 * 1. Keep minimum Infantry at 1%.
 * 2. Fill Marksman first.
 * 3. Fill Lancer with the remaining capacity.
 * 4. Use remaining Infantry.
 */
export function simulateTroopDistribution({
	remainingTroops,
	unlockedLegions,
}: SimulateTroopDistributionOptions): TroopDistributionSimulation {
	let simInf = safeNumber(remainingTroops.infantry);

	let simLan = safeNumber(remainingTroops.lancer);

	let simMar = safeNumber(remainingTroops.marksman);

	let usedInf = 0;
	let usedLan = 0;
	let usedMar = 0;

	unlockedLegions.forEach((legion) => {
		const capacity = safeNumber(legion.maxSize);

		if (capacity <= 0) {
			return;
		}

		/*
		 * Minimum Infantry allocation.
		 *
		 * At least 1% of the legion capacity
		 * when Infantry is available.
		 */
		const minInfantry = Math.min(Math.floor(capacity * 0.01), simInf);

		/*
		 * Marksman gets priority.
		 */
		const mar = Math.min(simMar, Math.max(0, capacity - minInfantry));

		/*
		 * Lancer fills the remaining capacity.
		 */
		const lan = Math.min(simLan, Math.max(0, capacity - minInfantry - mar));

		/*
		 * Infantry uses whatever capacity remains.
		 */
		let inf = Math.min(simInf, Math.max(0, capacity - mar - lan));

		/*
		 * Ensure minimum Infantry allocation.
		 */
		inf = Math.max(minInfantry, inf);

		/*
		 * Safety clamp.
		 */
		inf = Math.min(inf, simInf);

		simInf = Math.max(0, simInf - inf);

		simLan = Math.max(0, simLan - lan);

		simMar = Math.max(0, simMar - mar);

		usedInf += inf;
		usedLan += lan;
		usedMar += mar;
	});

	return {
		used: {
			infantry: usedInf,
			lancer: usedLan,
			marksman: usedMar,
		},

		remaining: {
			infantry: Math.max(0, simInf),

			lancer: Math.max(0, simLan),

			marksman: Math.max(0, simMar),
		},

		totalUsed: usedInf + usedLan + usedMar,
	};
}

/**
 * Calculate the suggested ratio based on
 * the actual Marksman supply and unlocked capacity.
 *
 * Default:
 * 1 : 1 : 98
 *
 * When Marksman is below 98% capacity:
 * - Marksman follows the available supply.
 * - Lancer receives the remaining percentage.
 * - If Lancer becomes too large, Infantry is increased to 10%.
 */
export function calculateSuggestedRatio({
	remainingTroops,
	unlockedCapacity,
}: CalculateSuggestedRatioOptions): TroopRatio {
	const capacity = safeNumber(unlockedCapacity);

	if (capacity <= 0) {
		return {
			infantry: 0,
			lancer: 0,
			marksman: 0,
		};
	}

	let infantry = 1;

	const availableMarksman = safeNumber(remainingTroops.marksman);

	const marksman = Math.min(
		98,
		Math.floor((availableMarksman / capacity) * 100),
	);

	let lancer = 100 - infantry - marksman;

	/*
	 * If Marksman becomes too low,
	 * Lancer would become too large.
	 *
	 * Legacy behavior increases Infantry
	 * to 10%.
	 */
	if (marksman < 98 && lancer > 65) {
		infantry = 10;

		lancer = 100 - infantry - marksman;
	}

	/*
	 * Final safety normalization.
	 */
	lancer = Math.max(0, lancer);

	const total = infantry + lancer + marksman;

	if (total <= 0) {
		return {
			infantry: 0,
			lancer: 0,
			marksman: 0,
		};
	}

	/*
	 * Normally total is already 100.
	 * Keep the normalization here so the
	 * function remains safe if the rules change.
	 */
	if (total !== 100) {
		infantry = Math.round((infantry / total) * 100);

		lancer = Math.round((lancer / total) * 100);

		return {
			infantry,
			lancer,
			marksman: 100 - infantry - lancer,
		};
	}

	return {
		infantry,
		lancer,
		marksman,
	};
}

/**
 * Calculate all ratio-related information
 * in one call.
 *
 * This helper is intended for the main
 * Troop Assistant calculator.
 */
export function calculateTroopRatios({
	troops,
	legions,
}: {
	troops: TroopCounts;
	legions: TroopLegion[];
}) {
	const remainingTroops = calculateRemainingTroops({
		troops,
		legions,
	});

	const unlockedLegions = legions.filter((legion) => !legion.isLocked);

	const unlockedCapacity = calculateUnlockedCapacity(legions);

	const rawRatio = calculateRawRatio(remainingTroops);

	const preferredRatio = calculatePreferredRatio({
		remainingTroops,
		unlockedCapacity,
	});

	const suggestedRatio = calculateSuggestedRatio({
		remainingTroops,
		unlockedCapacity,
	});

	const simulation = simulateTroopDistribution({
		remainingTroops,
		unlockedLegions,
	});

	return {
		remainingTroops,
		unlockedCapacity,
		rawRatio,
		preferredRatio,
		suggestedRatio,
		simulation,
	};
}
