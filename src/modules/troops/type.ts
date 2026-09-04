export type TroopType = "infantry" | "lancer" | "marksman";

export type TroopCounts = {
	infantry: number;
	lancer: number;
	marksman: number;
};

export type TroopRatio = {
	infantry: number;
	lancer: number;
	marksman: number;
};

export type TroopRatioTuple = [number, number, number];

export type TroopLegion = {
	id: number;
	name: string | null;
	maxSize: number;
	infantry: number;
	lancer: number;
	marksman: number;
	ratio: TroopRatio;
	isLocked: boolean;
};

export type TroopPreset = {
	name: string;
	value: TroopRatioTuple | null;
};

export type TroopAssistantState = {
	troops: TroopCounts;
	joinerCount: number;
	rallySize: number;
	joinerSize: number;
	legions: TroopLegion[];
};

export type TroopAssistantContext = {
	troops: TroopCounts;

	setTroops: (
		updater: TroopCounts | ((prev: TroopCounts) => TroopCounts),
	) => void;

	joinerCount: number;

	setJoinerCount: (value: number) => void;

	rallySize: number;

	setRallySize: (value: number) => void;

	joinerSize: number;

	setJoinerSize: (value: number) => void;

	legions: TroopLegion[];

	setLegions: (
		updater: TroopLegion[] | ((prev: TroopLegion[]) => TroopLegion[]),
	) => void;
};

/* =========================================================
   RATIO / TROOP OPTIONS
   ========================================================= */

export type ApplyRatioOptions = {
	legion: TroopLegion;
	ratio: TroopRatioTuple;
	totalTroops: TroopCounts;
	legions: TroopLegion[];
	respectGlobalLimit?: boolean;
};

export type ClampTroopValueOptions = {
	legion: TroopLegion;
	type: TroopType;
	value: number;
	totalTroops: TroopCounts;
	legions: TroopLegion[];
};

export type AutoBearTrapFormationOptions = {
	totalTroops: TroopCounts;
	rallySize: number;
	joinerSize: number;
	joinerCount: number;
};

/* Legacy-compatible aliases */

export type ApplyRatioParams = ApplyRatioOptions;

export type ClampTroopValueParams = ClampTroopValueOptions;

export type AutoBearTrapFormationParams = AutoBearTrapFormationOptions;

/* =========================================================
   BUFF / FORMATION TYPES
   ========================================================= */

export type TroopBuff = {
	tumblingLevel: number;
	tumblingValue: number;

	ursaBaneLevel: number;
	ursaBaneValue: number;

	cityBuff: number;
	cityBuffValue: number;
};

export type TroopCapacity = {
	baseRally: number;
	beforeCityBuff: number;
	finalRallySize: number;
	maxJoinerCapacity: number;
};

export type TroopFormation = {
	rallySize: number;
	joinerSize: number;
	joinerCount: number;
};

export type TroopFormationResult = {
	legions: TroopLegion[];
	rallySize: number;
	joinerSize: number;
	joinerCount: number;
};

export type TroopRemaining = {
	infantry: number;
	lancer: number;
	marksman: number;
};

export type TroopTotals = {
	infantry: number;
	lancer: number;
	marksman: number;
	total: number;
};

/* =========================================================
   RATIO RESULTS
   ========================================================= */

export type CustomRatio = TroopRatio;

export type TroopRatioCalculation = {
	rawRatio: TroopRatio;
	preferredRatio: TroopRatio;
	suggestedRatio: TroopRatio;
};

export type TroopAssistantCalculationResult = {
	remainingTroops: TroopCounts;
	unlockedCapacity: number;
	rawRatio: TroopRatio;
	preferredRatio: TroopRatio;
	suggestedRatio: TroopRatio;
	simulation: TroopDistributionSimulation;
};

/* =========================================================
   CALCULATOR STATE
   ========================================================= */

export type RatioResult = TroopRatio;

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

/* =========================================================
   SIMULATION
   ========================================================= */

export type TroopDistributionSimulation = {
	used: TroopCounts;
	remaining: TroopCounts;
	totalUsed: number;
};
