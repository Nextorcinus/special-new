export type CalculationModule =
	| "buildings"
	| "gear"
	| "charm"
	| "research"
	| "war-academy"
	| "widget"
	| "pet"
	| "troops";

export type CalculationHistoryItem<TForm = any, TResult = any> = {
	id: string;
	module: CalculationModule;
	category?: string;

	title: string;
	subtitle?: string;

	form: TForm;
	result: TResult;

	isPinned?: boolean;


	createdAt: string;
	updatedAt?: string;
};