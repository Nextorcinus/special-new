export type RfcTierNumber = 1 | 2 | 3 | 4 | 5;

export type RfcProbability = {
	rfc: number;
	chance: number;
};

export type RfcTier = {
	tier: RfcTierNumber;
	conversionRange: [number, number];
	cost: number;
	fcCost?: number;
	probabilities: RfcProbability[];
};

export type RfcHistoryItem = {
	tier: RfcTierNumber;
	rfc: number;
	fc: number;
	discounted: boolean;
};

export type RfcLuck = "lucky" | "neutral" | "unlucky";

export type RfcLuckResult = {
	label: string;
	luck: RfcLuck;
};

export type RfcSetupValues = {
	startingCount: number;
	fcInventory: number;
};

export type RfcConversionResult = {
	rfc: number;
	fcUsed: number;
	discounted: boolean;
	tier: RfcTierNumber;
};

export type RfcStatistics = {
	rfcGained: number;
	fcUsed: number;
	conversions: number;
	averageRfc: number;
	expectedRfc: number;
	luck: RfcLuck;
};

export type RfcSimulatorState = {
	startingCount: number;
	fcInventory: number;
	fcUsed: number;
	history: RfcHistoryItem[];
};

export type RfcCalculation = {
	currentCount: number;
	tier: RfcTier;
	progress: number;
	progressPercent: number;
	normalCost: number;
	discountCost: number;
	canConvert: boolean;
	canDiscount: boolean;
	expectedRfc: number;
};

export type RfcTierProgress = {
	currentCount: number;
	tier: RfcTierNumber;
	progress: number;
	progressMax: number;
};

export type RfcSessionResult = {
	state: RfcSimulatorState;
	calculation: RfcCalculation;
	statistics: RfcStatistics;
};