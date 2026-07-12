export type ChiefGearType =
	| "Cap"
	| "Watch"
	| "Coat"
	| "Pants"
	| "Belt"
	| "Weapon";

export type GearFormValues = {
	gear: ChiefGearType | "";
	fromLevel: string;
	toLevel: string;
};

export type GearResourceMap = {
	Plans: number;
	Polish: number;
	Alloy: number;
	Amber: number;
};

export type GearStatResult = {
	attackFrom: number;
	attackTo: number;
	attackIncrease: number;

	defenseFrom: number;
	defenseTo: number;
	defenseIncrease: number;

	deploymentFrom: number;
	deploymentTo: number;
	deploymentIncrease: number;
};

export type GearCalculationResult = {
	gear: ChiefGearType;
	fromLevel: string;
	toLevel: string;

	form: GearFormValues;

	resources: GearResourceMap;
	svsPoints: number;
	stats: GearStatResult;
};

export type GearDataItem = {
	"": string;
	Type: ChiefGearType;
	Level: string;

	Plans: string;
	Polish: string;
	Alloy: string;
	Amber: string;

	"SvS Points": string;

	Attack: string;
	Defense: string;

	"troops deployment capacity": string;
};

export type ChiefGearData = {
	data: GearDataItem[];
};

export type GearLevelOption = {
	value: string;
	label: string;
};

export const DEFAULT_GEAR_FORM_VALUES: GearFormValues = {
	gear: "",
	fromLevel: "",
	toLevel: "",
};

export const EMPTY_GEAR_RESOURCES: GearResourceMap = {
	Plans: 0,
	Polish: 0,
	Alloy: 0,
	Amber: 0,
};

export const EMPTY_GEAR_STATS: GearStatResult = {
	attackFrom: 0,
	attackTo: 0,
	attackIncrease: 0,

	defenseFrom: 0,
	defenseTo: 0,
	defenseIncrease: 0,

	deploymentFrom: 0,
	deploymentTo: 0,
	deploymentIncrease: 0,
};