import type {
	TroopAssistantCalculationResult,
	TroopCounts,
	TroopLegion,
	TroopRatio,
	TroopType,
} from "../type";

/* =========================================================
   PREFERRED RATIO
   ========================================================= */

export type CalculatePreferredRatioOptions = {
	remainingTroops: TroopCounts;
	unlockedCapacity: number;
};

/* =========================================================
   REMAINING TROOPS
   ========================================================= */

export type CalculateRemainingTroopsOptions = {
	troops: TroopCounts;
	legions: TroopLegion[];
};

/* =========================================================
   SUGGESTED RATIO
   ========================================================= */

export type CalculateSuggestedRatioOptions = {
	remainingTroops: TroopCounts;
	unlockedCapacity: number;
};

/* =========================================================
   TROOP TOTALS
   ========================================================= */

export type CalculateTroopTotalsOptions = {
	legions: TroopLegion[];
};

/* =========================================================
   UNLOCKED CAPACITY
   ========================================================= */

export type CalculateUnlockedCapacityOptions = {
	legions: TroopLegion[];
};

/* =========================================================
   TROOP ASSISTANT
   ========================================================= */

export type CalculateTroopAssistantOptions = {
	troops: TroopCounts;
	legions: TroopLegion[];
};

/* =========================================================
   SIMULATION
   ========================================================= */

export type SimulateTroopDistributionOptions = {
	remainingTroops: TroopCounts;
	unlockedLegions: TroopLegion[];
};

/* =========================================================
   RESULTS
   ========================================================= */

export type RatioResult = {
	infantry: number;
	lancer: number;
	marksman: number;
};

export type RemainingTroopsResult = {
	remainingTroops: TroopCounts;
};

export type UnlockedCapacityResult = {
	unlockedCapacity: number;
};

export type TroopTotalsResult = {
	totalRequired: TroopCounts;
	currentUsed: TroopCounts;
};

export type TroopDistributionSimulation = {
	used: TroopCounts;
	remaining: TroopCounts;
	totalUsed: number;
};

/*
 * Re-export untuk consumer yang menginginkan
 * hasil kalkulasi lengkap.
 */
export type {
	TroopAssistantCalculationResult,
	TroopCounts,
	TroopLegion,
	TroopRatio,
	TroopType,
};
