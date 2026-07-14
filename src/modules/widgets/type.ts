export type WidgetStatus = "new" | "next-update";

export type WidgetLevelType = "exploration" | "expedition";

export type WidgetHero = {
	id: string;
	name: string;
	generation: number;

	exploration: string;
	expedition: string;

	status?: WidgetStatus;
	thumbnail?: string;
};

export type WidgetDatabaseItem = WidgetHero;

export type WidgetLevelData = {
	level: number;
	required: number;
	value: number;
	type: WidgetLevelType;
};

export type WidgetFormValues = {
	heroId: string;
	fromLevel: string;
	toLevel: string;
};

export type WidgetResources = {
	WidgetStone: number;
};

export type WidgetCalculationResult = {
	heroId: string;
	heroName: string;
	generation: number;
	status?: WidgetStatus;

	fromLevel: number;
	toLevel: number;

	level: number;
	type: WidgetLevelType;
	value: number;
	skill: string;

	totalRequired: number;

	resources: WidgetResources;

	powerIncrease: number;
	svsPoints: number;
};

export type CalculateWidgetParams = {
	data: WidgetDatabaseItem[];
	values: WidgetFormValues;
};
