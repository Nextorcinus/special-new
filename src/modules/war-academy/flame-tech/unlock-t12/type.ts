export type UnlockT12Category =
	| "Exalted Infantry"
	| "Exalted Lancer"
	| "Exalted Marksman";

export type UnlockT12Attribute = {
	name: string;
	value: number;
	unit?: string;
};

export type UnlockT12Level = {
	level: string;
	Steel: string;
	RFC: string;
	"FC Shards": string;
	power: string;
	attributes: UnlockT12Attribute[];
};

export type UnlockT12ResearchMap = Record<string, UnlockT12Level[]>;

export type UnlockT12Database = Record<UnlockT12Category, UnlockT12ResearchMap>;

export type UnlockT12FormValues = {
	category: UnlockT12Category;
	research: string;
	fromLevel: string;
	toLevel: string;
};

export type UnlockT12Resources = {
	Steel: number;
	RFC: number;
	Shard: number;
};

export type UnlockT12AttributeResult = {
	name: string;
	value: number;
	unit: string;
};

export type UnlockT12CalculationResult = {
	category: UnlockT12Category;
	research: string;
	fromLevel: string;
	toLevel: string;
	selectedLevels: UnlockT12Level[];
	resources: UnlockT12Resources;
	power: number;
	attributes: UnlockT12AttributeResult[];
};
