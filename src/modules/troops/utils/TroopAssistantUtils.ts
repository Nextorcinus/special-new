import type {
	AutoBearTrapFormationParams,
	ClampTroopValueParams,
	TroopCounts,
	TroopLegion,
	TroopRatioTuple,
	TroopType,
} from "../type";

export function createLegion(
	maxSize = 100000,
	name: string | null = null,
): TroopLegion {
	return {
		id: Date.now() + Math.random(),
		name,
		maxSize,

		infantry: 0,
		lancer: 0,
		marksman: 0,

		ratio: {
			infantry: 1,
			lancer: 1,
			marksman: 98,
		},

		isLocked: false,
	};
}

export function totalUsed(legions: TroopLegion[], type: TroopType): number {
	return legions.reduce((sum, legion) => sum + legion[type], 0);
}

export function remainingGlobal(
	totalTroops: TroopCounts,
	legions: TroopLegion[],
	type: TroopType,
	current = 0,
): number {
	return totalTroops[type] - totalUsed(legions, type) + current;
}

export function remainingLegionCapacity(
	legion: TroopLegion,
	type: TroopType,
): number {
	return (
		legion.maxSize -
		(legion.infantry + legion.lancer + legion.marksman - legion[type])
	);
}

export function legionTotal(legion: TroopLegion): number {
	return legion.infantry + legion.lancer + legion.marksman;
}

export function clampTroopValue({
	legion,
	type,
	value,
	totalTroops,
	legions,
}: ClampTroopValueParams): number {
	const maxByLegion = remainingLegionCapacity(legion, type);

	const maxByGlobal = remainingGlobal(totalTroops, legions, type, legion[type]);

	const maxAllowed = Math.min(maxByLegion, maxByGlobal);

	return Math.max(0, Math.min(value, maxAllowed));
}

type ApplyRatioToLegionParams = {
	legion: TroopLegion;
	ratio: TroopRatioTuple;
	totalTroops: TroopCounts;
	legions: TroopLegion[];
	respectGlobalLimit?: boolean;
};

export function applyRatioToLegion({
	legion,
	ratio,
	totalTroops,
	legions,
	respectGlobalLimit = true,
}: ApplyRatioToLegionParams): void {
	const totalRatio = ratio.reduce((a, b) => a + b, 0);

	if (!respectGlobalLimit) {
		const unit = legion.maxSize / totalRatio;

		legion.infantry = Math.floor(ratio[0] * unit);

		legion.lancer = Math.floor(ratio[1] * unit);

		legion.marksman = Math.floor(ratio[2] * unit);

		legion.ratio = {
			infantry: ratio[0],
			lancer: ratio[1],
			marksman: ratio[2],
		};

		return;
	}

	const available = {
		infantry: remainingGlobal(
			totalTroops,
			legions,
			"infantry",
			legion.infantry,
		),

		lancer: remainingGlobal(totalTroops, legions, "lancer", legion.lancer),

		marksman: remainingGlobal(
			totalTroops,
			legions,
			"marksman",
			legion.marksman,
		),
	};

	const totalAvailable = Math.min(
		legion.maxSize,
		available.infantry + available.lancer + available.marksman,
	);

	const unit = totalAvailable / totalRatio;

	let inf = Math.floor(ratio[0] * unit);

	let lan = Math.floor(ratio[1] * unit);

	let mar = Math.floor(ratio[2] * unit);

	inf = Math.min(inf, available.infantry);

	lan = Math.min(lan, available.lancer);

	mar = Math.min(mar, available.marksman);

	legion.infantry = inf;
	legion.lancer = lan;
	legion.marksman = mar;

	legion.ratio = {
		infantry: ratio[0],
		lancer: ratio[1],
		marksman: ratio[2],
	};
}

type DistributeAllLegionsParams = {
	legions: TroopLegion[];
	ratio: TroopRatioTuple;
	totalTroops: TroopCounts;
};

export function distributeAllLegions({
	legions,
	ratio,
	totalTroops,
}: DistributeAllLegionsParams): void {
	legions.forEach((legion) => {
		applyRatioToLegion({
			legion,
			ratio,
			totalTroops,
			legions,
		});
	});
}

export function calculateTroopDistribution(
	troops: TroopCounts,
	ratio: TroopRatioTuple,
	legionCount: number,
): TroopCounts[] {
	const legions = Array.from({ length: legionCount }, () => ({
		id: Date.now() + Math.random(),
		name: null,
		infantry: 0,
		lancer: 0,
		marksman: 0,
		maxSize: Number.MAX_SAFE_INTEGER,
		ratio: {
			infantry: 1,
			lancer: 1,
			marksman: 98,
		},
		isLocked: false,
	}));

	distributeAllLegions({
		legions,
		ratio,
		totalTroops: troops,
	});

	return legions.map((legion) => ({
		infantry: legion.infantry,
		lancer: legion.lancer,
		marksman: legion.marksman,
	}));
}

export function autoBearTrapFormation({
	totalTroops,
	rallySize,
	joinerSize,
	joinerCount,
}: AutoBearTrapFormationParams): TroopLegion[] {
	const legions: TroopLegion[] = [];

	legions.push(createLegion(rallySize, "Rally Starter"));

	while (legions.length < joinerCount + 1) {
		legions.push(createLegion(joinerSize));
	}

	return legions;
}
