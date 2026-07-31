export type SkillT12Category =
	| "Exalted Infantry"
	| "Exalted Lancer"
	| "Exalted Marksman";

export type SkillT12Unit =
	| "Infantry"
	| "Lancer"
	| "Marksman";

export type SkillT12Group =
	| "Skill 1"
	| "Skill 2"
	| "Skill 3"
	| "Special Skill"
	| "Solar Supremacy";

export type SkillT12TemplateKey = string;

export type SkillT12SelectOption = {
	value: string;
	label: string;
};

export type SkillT12Level = {
	level: number;

	Meat?: number;
	Wood?: number;
	Coal?: number;
	Iron?: number;
	Steel?: number;
	RFC?: number;
	"FC Shards"?: number;

	time?: string | number;
	power?: number;
	stat?: number;
	capacity?: number;
};

export type SkillT12SkillUnitDefinition = {
	name: string;
	type: string;
};

export type SkillT12RegularDefinition = {
	template: SkillT12TemplateKey;
	maxLevel: number;

	units: Partial<
		Record<
			SkillT12Unit,
			SkillT12SkillUnitDefinition[]
		>
	>;
};

export type SkillT12SpecialUnitDefinition = {
	name: string;
	type: string;
	template: SkillT12TemplateKey;
};

export type SkillT12SpecialDefinition = {
	units: Partial<
		Record<
			SkillT12Unit,
			SkillT12SpecialUnitDefinition
		>
	>;
};

export type SkillT12SolarDefinition = {
	template: SkillT12TemplateKey;
	maxLevel: number;
	type: string;
};

export type SkillT12Skills = {
	"Skill 1"?: SkillT12RegularDefinition;
	"Skill 2"?: SkillT12RegularDefinition;
	"Skill 3"?: SkillT12RegularDefinition;
	"Special Skill"?: SkillT12SpecialDefinition;
	"Solar Supremacy"?: SkillT12SolarDefinition;
};

export type SkillT12Database = {
	tables: Record<
		SkillT12TemplateKey,
		SkillT12Level[]
	>;

	skills: SkillT12Skills;
};

export type SkillT12ResearchOption = {
	name: string;
	group: SkillT12Group;
	template: SkillT12TemplateKey;
	type: string;
	maxLevel: number;
};

export type SkillT12FormValues = {
	category: SkillT12Category;

	research: string;
	fromLevel: string;
	toLevel: string;

	researchSpeed: string;
	vpLevel: string;
	agnesLevel: string;
	presidentSkill: boolean;
};

export type SkillT12ResultResources = {
	Meat: number;
	Wood: number;
	Coal: number;
	Iron: number;
	Steel: number;
	RFC: number;
	Shard: number;
};

export type SelectedSkillT12Level = {
	level: number;

	resources: SkillT12ResultResources;

	rawTimeSeconds: number;
	time: string;

	power: number;
	stat: number;
	capacity: number;
};

export type SkillT12TimeResult = {
	baseSeconds: number;

	speedAdjustedSeconds: number;

	agnesReductionSeconds: number;

	finalSeconds: number;

	researchSpeed: number;
	vpBonus: number;
	presidentBonus: number;
	totalSpeedBonus: number;
};

export type SkillT12CalculationResult = {
	category: SkillT12Category;

	research: string;
	group: SkillT12Group;
	type: string;

	fromLevel: number;
	toLevel: number;

	resources: SkillT12ResultResources;

	power: number;
	stat: number;
	capacity: number;

	time: SkillT12TimeResult;

	selectedLevels: SelectedSkillT12Level[];
};

export type CalculateSkillT12Params = {
	data: SkillT12Database;
	values: SkillT12FormValues;
};