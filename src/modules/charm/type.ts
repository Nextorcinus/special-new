export const CHARM_TYPES = [
	"Cap",
	"Watch",
	"Coat",
	"Pants",
	"Belt",
	"Weapon",
] as const;

export type CharmTroopType =
	| "Infantry"
	| "Lancer"
	| "Marksman";

export const CHARM_STAT_LABEL_MAP: Record<
	ChiefCharmType,
	CharmTroopType
> = {
	Cap: "Lancer",
	Watch: "Lancer",
	Coat: "Infantry",
	Pants: "Infantry",
	Belt: "Marksman",
	Weapon: "Marksman",
};

export type ChiefCharmType =
	(typeof CHARM_TYPES)[number];

export type CharmFormValues = {
	type: ChiefCharmType | "";
	fromLevel: string;
	toLevel: string;
	valeriaLevel: string;
};

export type CharmResourceMap = {
	Guide: number;
	Design: number;
	Jewel: number;
};

export type CharmStatResult = {
	troopType: CharmTroopType;

	powerFrom: number;
	powerTo: number;
	powerIncrease: number;

	statFrom: number;
	statTo: number;
	statIncrease: number;

	lethalityIncrease: number;
	healthIncrease: number;
};
export type CharmCalculationResult = {
	type: ChiefCharmType;

	fromLevel: string;
	toLevel: string;

	form: CharmFormValues;

	resources: CharmResourceMap;

	baseSvsPoints: number;
	valeriaLevel: number;
	valeriaBonus: number;
	valeriaBonusPoints: number;
	svsPoints: number;

	stats: CharmStatResult;
};

export type CharmDataItem = {
	level: number | string;

	guide_cost: number | string;
	design_cost: number | string;
	jewel_cost: number | string;

	power_total: number | string;
	stat_total: number | string;

	power_diff: number | string;
	stat_diff: number | string;

	svs_point: number | string;
};

export type CharmLevelOption = {
	value: string;
	label: string;
};

export const DEFAULT_CHARM_FORM_VALUES: CharmFormValues = {
	type: "",
	fromLevel: "",
	toLevel: "",
	valeriaLevel: "0",
};

export const EMPTY_CHARM_RESOURCES: CharmResourceMap = {
	Guide: 0,
	Design: 0,
	Jewel: 0,
};

export const EMPTY_CHARM_STATS: CharmStatResult = {
	troopType: "Infantry",

	powerFrom: 0,
	powerTo: 0,
	powerIncrease: 0,

	statFrom: 0,
	statTo: 0,
	statIncrease: 0,

	lethalityIncrease: 0,
	healthIncrease: 0,
};