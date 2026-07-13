import type { ResourceKey } from "@/config/resources";

export type WarAcademyCategory = "Infantry" | "Lancer" | "Marksman";

export type WarAcademyDatabaseResources = {
	meat: number;
	wood: number;
	coal: number;
	iron: number;
	steel: number;
	shard: number;
};

export type WarAcademyLevel = {
	level: number;
	resources: WarAcademyDatabaseResources;
	raw_time_seconds: number;
	buff: string;
};

export type WarAcademyResearchMap = Record<string, WarAcademyLevel[]>;

export type WarAcademyDatabase = Record<
	WarAcademyCategory,
	WarAcademyResearchMap
>;

export type WarAcademyFormValues = {
	research: string;
	fromLevel: string;
	toLevel: string;

	vpLevel: string;
	agnesLevel: string;
	researchSpeed: string;
	doubleTime: boolean;
};

export type WarAcademyResultResources = Partial<Record<ResourceKey, number>>;

export type SelectedWarAcademyLevel = {
	level: number;
	resources: WarAcademyDatabaseResources;
	rawTimeSeconds: number;
	buff: string;
};

export type WarAcademyCalculationTime = {
	totalSeconds: number;
	reducedSeconds: number;
	finalSeconds: number;

	total: string;
	reduced: string;
	final: string;
};

export type WarAcademyCalculationResult = {
	category: WarAcademyCategory;
	research: string;
	fromLevel: number;
	toLevel: number;

	resources: WarAcademyResultResources;
	time: WarAcademyCalculationTime;

	buff: string;
	buffs: string[];

	selectedLevels: SelectedWarAcademyLevel[];

	bonuses: {
		vpResearchSpeed: number;
		agnesTimeReduction: number;
		researchSpeed: number;
		doubleTimeSpeed: number;
		totalResearchSpeed: number;
	};
};

export type CalculateWarAcademyParams = {
	category: WarAcademyCategory;
	data: WarAcademyDatabase;
	values: WarAcademyFormValues;
};
