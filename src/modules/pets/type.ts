export type PetRarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export type PetResourceKey =
	| "PetFood"
	| "TamingManual"
	| "EnergizingPotion"
	| "StrengtheningSerum";

export type PetScoringRuleKey =
	| PetResourceKey
	| "CommonWildMark"
	| "AdvancedWildMark";

export type PetResources = Record<PetResourceKey, number>;
export type PetScoringRules = Record<PetScoringRuleKey, number>;

export type PetUnlockRequirement = {
	days: number | null;
	furnace: number | null;
	pet: string | null;
	petLevel: number | null;
};

export type PetSkill = {
	name: string;
	description: string;
};

export type PetAdvancement = {
	manual: number;
	potion: number;
	serum: number;
};

export type PetMilestone = {
	level: number;
	skillLevel: number;
	skillValue: string;
	cooldown: string;
	passiveTroopADPct: number;
	power: number;
	advancement: PetAdvancement;
};

export type PetData = {
	id: string;
	name: string;
	rarity: PetRarity;
	generation: number;
	maxLevel: number;
	image: string;
	unlock: PetUnlockRequirement;
	skill: PetSkill;

	/**
	 * Index array sama dengan target level.
	 * food[0] = 0
	 * food[1] = biaya Lv.0 -> Lv.1
	 * food[10] = biaya Lv.9 -> Lv.10
	 */
	food: number[];
	milestones: PetMilestone[];
};

export type PetDatabase = {
	game: string;
	category: string;
	dataVersion: string;
	totalPets: number;
	scoringRules: PetScoringRules;
	resources: PetResourceKey[];
	pets: PetData[];
};

export type PetFormValues = {
	petId: string;
	fromLevel: number;
	toLevel: number;
	valeriaLevel: number;
};

export type PetValidationErrors = Partial<Record<keyof PetFormValues, string>>;

export type PetMilestoneSnapshot = {
	level: number;
	skillLevel: number;
	skillValue: string;
	cooldown: string;
	passiveTroopADPct: number;
	power: number;
};

export type PetCalculationResult = {
	petId: string;
	petName: string;
	rarity: PetRarity;
	generation: number;
	image: string;

	fromLevel: number;
	toLevel: number;
	maxLevel: number;

	/** Biaya leveling saja, saat ini hanya Pet Food. */
	levelResources: PetResources;

	/** Biaya seluruh Open Gate yang dilewati. */
	advancementResources: PetResources;

	/** levelResources + advancementResources. */
	resources: PetResources;

	milestonesReached: PetMilestone[];
	currentMilestone: PetMilestoneSnapshot | null;
	targetMilestone: PetMilestoneSnapshot | null;

	powerBefore: number;
	powerAfter: number;
	powerIncrease: number;

	passiveBeforePct: number;
	passiveAfterPct: number;
	passiveIncreasePct: number;

	levelSvsPoints: number;
	advancementSvsPoints: number;
	baseSvsPoints: number;
	valeriaLevel: number;
	valeriaBonusPct: number;
	finalSvsPoints: number;
};

export const PET_RESOURCE_KEYS: PetResourceKey[] = [
	"PetFood",
	"TamingManual",
	"EnergizingPotion",
	"StrengtheningSerum",
];

export const DEFAULT_PET_FORM_VALUES: PetFormValues = {
	petId: "",
	fromLevel: 0,
	toLevel: 1,
	valeriaLevel: 0,
};
