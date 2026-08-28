import type {
	RfcCalculation,
	RfcHistoryItem,
	RfcSessionResult,
	RfcSetupValues,
	RfcStatistics,
	RfcTier,
} from "../type";

import {
	calculateExpectedRfc,
	calculateLuck,
	rollRfc,
} from "./rfcProbability";

const WEEKLY_LIMIT = 100;
const TIER_SIZE = 20;
const DISCOUNT_RATE = 0.5;

const RFC_TIERS: RfcTier[] = [
	{
		tier: 1,
		cost: 20,
		conversionRange: [1, 20],
		probabilities: [
			{ rfc: 1, chance: 65 },
			{ rfc: 2, chance: 25 },
			{ rfc: 3, chance: 10 },
		],
	},
	{
		tier: 2,
		cost: 50,
		conversionRange: [21, 40],
		probabilities: [
			{ rfc: 2, chance: 85 },
			{ rfc: 3, chance: 15 },
		],
	},
	{
		tier: 3,
		cost: 100,
		conversionRange: [41, 60],
		probabilities: [
			{ rfc: 3, chance: 85 },
			{ rfc: 4, chance: 12.5 },
			{ rfc: 5, chance: 2 },
			{ rfc: 6, chance: 0.5 },
		],
	},
	{
		tier: 4,
		cost: 130,
		conversionRange: [61, 80],
		probabilities: [
			{ rfc: 3, chance: 75 },
			{ rfc: 4, chance: 15 },
			{ rfc: 5, chance: 5 },
			{ rfc: 6, chance: 3 },
			{ rfc: 7, chance: 1 },
			{ rfc: 8, chance: 0.5 },
			{ rfc: 9, chance: 0.5 },
		],
	},
	{
		tier: 5,
		cost: 160,
		conversionRange: [81, 100],
		probabilities: [
			{ rfc: 3, chance: 70 },
			{ rfc: 4, chance: 12 },
			{ rfc: 5, chance: 9 },
			{ rfc: 6, chance: 4 },
			{ rfc: 7, chance: 1.5 },
			{ rfc: 8, chance: 1 },
			{ rfc: 9, chance: 1 },
			{ rfc: 10, chance: 0.5 },
			{ rfc: 11, chance: 0.5 },
			{ rfc: 12, chance: 0.5 },
		],
	},
];

function normalizeStartingCount(
	value: unknown,
): number {
	const number = Number(value);

	if (!Number.isFinite(number)) {
		return 0;
	}

	return Math.min(
		Math.max(
			Math.floor(number),
			0,
		),
		WEEKLY_LIMIT,
	);
}

function normalizeFcInventory(
	value: unknown,
): number {
	const number = Number(value);

	if (!Number.isFinite(number)) {
		return 0;
	}

	return Math.max(
		Math.floor(number),
		0,
	);
}

function normalizeSetup(
	setup: RfcSetupValues,
): RfcSetupValues {
	return {
		startingCount:
			normalizeStartingCount(
				setup?.startingCount,
			),
		fcInventory:
			normalizeFcInventory(
				setup?.fcInventory,
			),
	};
}

function normalizeHistory(
	history: RfcHistoryItem[] | undefined,
): RfcHistoryItem[] {
	if (!Array.isArray(history)) {
		return [];
	}

	return history.filter(Boolean);
}

function getHistoryFcUsed(
	history: RfcHistoryItem[],
): number {
	return history.reduce(
		(total, item) =>
			total +
			Number(item.fc ?? 0),
		0,
	);
}

function getHistoryRfcGained(
	history: RfcHistoryItem[],
): number {
	return history.reduce(
		(total, item) =>
			total +
			Number(item.rfc ?? 0),
		0,
	);
}

export function getRfcTier(
	count: number,
): RfcTier {
	const normalizedCount =
		Math.min(
			Math.max(
				Math.floor(
					Number(count) || 0,
				),
				0,
			),
			WEEKLY_LIMIT,
		);

	if (normalizedCount <= 0) {
		return RFC_TIERS[0];
	}

	return (
		RFC_TIERS.find(
			(tier) =>
				normalizedCount >=
					tier.conversionRange[0] &&
				normalizedCount <=
					tier.conversionRange[1],
		) ??
		RFC_TIERS[
			RFC_TIERS.length - 1
		]
	);
}

export function getCurrentTierNumber(
	count: number,
): number {
	return getRfcTier(
		Math.min(
			Math.max(
				Math.floor(
					Number(count) || 0,
				),
				1,
			),
			WEEKLY_LIMIT,
		),
	).tier;
}

export function getTierProgress(
	count: number,
): number {
	const normalizedCount =
		Math.min(
			Math.max(
				Math.floor(
					Number(count) || 0,
				),
				0,
			),
			WEEKLY_LIMIT,
		);

	if (normalizedCount <= 0) {
		return 0;
	}

	const tier =
		getRfcTier(
			normalizedCount,
		);

	return Math.min(
		Math.max(
			normalizedCount -
				tier.conversionRange[0] +
				1,
			0,
		),
		TIER_SIZE,
	);
}

export function getTierProgressMax(): number {
	return TIER_SIZE;
}

export function getNormalCost(
	tier: RfcTier | number,
): number {
	const resolvedTier =
		typeof tier === "number"
			? getRfcTier(tier)
			: tier;

	return Math.max(
		0,
		Number(
			resolvedTier?.cost ?? 0,
		),
	);
}

export function getDiscountCost(
	tier: RfcTier | number,
): number {
	return Math.ceil(
		getNormalCost(tier) *
			DISCOUNT_RATE,
	);
}

export function getExpectedRfc(
	tier: RfcTier | number,
): number {
	const resolvedTier =
		typeof tier === "number"
			? getRfcTier(tier)
			: tier;

	return calculateExpectedRfc(
		resolvedTier,
	);
}

export function calculateProgress(
	setup: RfcSetupValues,
	history: RfcHistoryItem[] = [],
): number {
	const normalizedSetup =
		normalizeSetup(setup);

	const safeHistory =
		normalizeHistory(history);

	return Math.min(
		normalizedSetup.startingCount +
			safeHistory.length,
		WEEKLY_LIMIT,
	);
}

export function calculateStatistics(
	history: RfcHistoryItem[] = [],
): RfcStatistics {
	const safeHistory =
		normalizeHistory(history);

	const conversions =
		safeHistory.length;

	const rfcGained =
		getHistoryRfcGained(
			safeHistory,
		);

	const fcUsed =
		getHistoryFcUsed(
			safeHistory,
		);

	const averageRfc =
		conversions > 0
			? rfcGained /
				conversions
			: 0;

	const expectedRfc =
		conversions > 0
			? safeHistory.reduce(
					(total, item) =>
						total +
						getExpectedRfc(
							item.tier,
						),
					0,
				) / conversions
			: 0;

	const luckResult =
		calculateLuck(
			averageRfc,
			expectedRfc,
		);

	return {
		rfcGained,
		fcUsed,
		conversions,
		averageRfc,
		expectedRfc,
		luck: luckResult.luck,
	};
}

export function createHistoryItem(
	tier: RfcTier | number,
	fc: number,
	rfc: number,
	discounted = false,
): RfcHistoryItem {
	const resolvedTier =
		typeof tier === "number"
			? getRfcTier(tier)
			: tier;

	return {
		tier: resolvedTier.tier,
		fc: Math.max(
			0,
			Math.floor(
				Number(fc) || 0,
			),
		),
		rfc: Math.max(
			0,
			Math.floor(
				Number(rfc) || 0,
			),
		),
		discounted:
			Boolean(discounted),
	};
}

export function createConversion(
	tier: RfcTier | number,
	discounted = false,
): RfcHistoryItem {
	const resolvedTier =
		typeof tier === "number"
			? getRfcTier(tier)
			: tier;

	const normalCost =
		getNormalCost(
			resolvedTier,
		);

	const fc =
		discounted
			? getDiscountCost(
					resolvedTier,
				)
			: normalCost;

	const rfc =
		rollRfc(
			resolvedTier,
		);

	return createHistoryItem(
		resolvedTier,
		fc,
		rfc,
		discounted,
	);
}

export function performConversion(
	setup: RfcSetupValues,
	history: RfcHistoryItem[] = [],
	discounted = false,
): RfcHistoryItem | null {
	const normalizedSetup =
		normalizeSetup(setup);

	const safeHistory =
		normalizeHistory(history);

	const currentCount =
		normalizedSetup.startingCount +
		safeHistory.length;

	if (
		currentCount >=
		WEEKLY_LIMIT
	) {
		return null;
	}

	const tier =
		getRfcTier(
			currentCount + 1,
		);

	const normalCost =
		getNormalCost(tier);

	const cost =
		discounted
			? getDiscountCost(tier)
			: normalCost;

	const fcUsed =
		getHistoryFcUsed(
			safeHistory,
		);

	const remainingFc =
		normalizedSetup.fcInventory -
		fcUsed;

	if (remainingFc < cost) {
		return null;
	}

	return createConversion(
		tier,
		discounted,
	);
}

export function runConversion(
	setup: RfcSetupValues,
	history: RfcHistoryItem[] = [],
	discounted = false,
): RfcSessionResult | null {
	const normalizedSetup =
		normalizeSetup(setup);

	const safeHistory =
		normalizeHistory(history);

	const conversion =
		performConversion(
			normalizedSetup,
			safeHistory,
			discounted,
		);

	if (!conversion) {
		return null;
	}

	const nextHistory:
		RfcHistoryItem[] = [
			...safeHistory,
			conversion,
		];

	return createInitialState(
		normalizedSetup,
		nextHistory,
	);
}

export function createInitialCalculatorResult(
	setup: RfcSetupValues,
	history: RfcHistoryItem[] = [],
): RfcSessionResult {
	return createInitialState(
		setup,
		history,
	);
}

export function createInitialState(
	setup: RfcSetupValues,
	history: RfcHistoryItem[] = [],
): RfcSessionResult {
	const normalizedSetup =
		normalizeSetup(setup);

	const safeHistory =
		normalizeHistory(history);

	const currentCount =
		calculateProgress(
			normalizedSetup,
			safeHistory,
		);

	const tier =
		getRfcTier(
			Math.min(
				Math.max(
					currentCount + 1,
					1,
				),
				WEEKLY_LIMIT,
			),
		);

	const progress =
		getTierProgress(
			currentCount,
		);

	const normalCost =
		getNormalCost(tier);

	const discountCost =
		getDiscountCost(tier);

	const expectedRfc =
		getExpectedRfc(tier);

	const fcUsed =
		getHistoryFcUsed(
			safeHistory,
		);

	const remainingFc =
		Math.max(
			normalizedSetup.fcInventory -
				fcUsed,
			0,
		);

	const canConvert =
		currentCount <
			WEEKLY_LIMIT &&
		remainingFc >=
			normalCost;

	const canDiscount =
		currentCount <
			WEEKLY_LIMIT &&
		remainingFc >=
			discountCost;

	const statistics =
		calculateStatistics(
			safeHistory,
		);

	const calculation:
		RfcCalculation = {
		currentCount,
		tier,
		progress,
		progressPercent:
			(currentCount /
				WEEKLY_LIMIT) *
			100,
		normalCost,
		discountCost,
		canConvert,
		canDiscount,
		expectedRfc,
	};

	return {
		state: {
			startingCount:
				normalizedSetup.startingCount,
			fcInventory:
				normalizedSetup.fcInventory,
			fcUsed,
			history: safeHistory,
		},
		calculation,
		statistics,
	};
}

export function resetSession(
	setup: RfcSetupValues,
): RfcSessionResult {
	return createInitialState(
		normalizeSetup(setup),
		[],
	);
}