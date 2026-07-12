import type { ResourceKey } from "@/config/resources";

export type ResearchCategory =
	| "Growth"
	| "Economy"
	| "Battle";

export type ResearchTier =
	| "I"
	| "II"
	| "III"
	| "IV"
	| "V"
	| "VI"
	| "VII"
	| "VIII"
	| "IX"
	| "X"
	| (string & {});

export type ResearchResources = {
	Meat?: number;
	Wood?: number;
	Coal?: number;
	Iron?: number;
	Steel?: number;
	Crystal?: number;
	RFC?: number;
	"Fire Crystal"?: number;
	"Refined Fire Crystal"?: number;
	[key: string]: number | undefined;
};

export type ResearchLevelData = {
	level: number;
	prerequisites: string;
	power: number;
	buff: string;
	raw_time_seconds: number;
	resources: ResearchResources;
};

export type ResearchTierMap = Record<
	string,
	ResearchLevelData[]
>;

export type ResearchItemData = {
	tiers: ResearchTierMap;
};

export type ResearchCategoryData = Record<
	string,
	ResearchItemData
>;

export type ResearchDatabase = Record<
	string,
	ResearchCategoryData
>;

export type ResearchFormValues = {
	category: ResearchCategory | "";
	research: string;
	tier: string;
	fromLevel: string;
	toLevel: string;

	researchSpeed: string;
	vpLevel: string;
	agnesLevel: string;
	presidentSkill: boolean;
};

export type SelectedResearchLevel = {
	category: string;
	research: string;
	tier: string;
	level: number;
	prerequisites: string;
	power: number;
	buff: string;
	rawTimeSeconds: number;
	resources: ResearchResources;
};

export type ResearchResultResources = Partial<
	Record<ResourceKey, number>
>;

export type ResearchTimeResult = {
	total: number;
	reduced: number;
	final: number;

	totalSpeedBonus: number;
	researchSpeed: number;
	vpBonus: number;
	presidentBonus: number;

	agnesHours: number;
	agnesSeconds: number;

	presidentSkill: boolean;
};

export type ResearchCalculationResult = {
	category: string;
	research: string;
	tier: string;

	fromLevel: number;
	toLevel: number;

	resources: ResearchResultResources;

	power: number;
	buffs: string[];
	prerequisites: string;

	time: ResearchTimeResult;

	selectedLevels: SelectedResearchLevel[];
};

export type ResearchSelectOption = {
	value: string;
	label: string;
};

export type CalculateResearchParams = {
	data: ResearchDatabase;
	values: ResearchFormValues;
};

export const DEFAULT_RESEARCH_FORM_VALUES: ResearchFormValues = {
	category: "",
	research: "",
	tier: "",
	fromLevel: "0",
	toLevel: "",
	researchSpeed: "",
	vpLevel: "Off",
	agnesLevel: "0",
	presidentSkill: false,
};