export type CalculationModule =
	| "buildings"
	| "gear"
	| "charm"
	| "research"
	| "war-academy"
	| "unlock-t12"
	| "skill-t12"
	| "widget"
	| "pet"
	| "troops";

export type CalculationHistoryEntry<TForm = any, TResult = any> = {
	id: string;

	title: string;
	subtitle?: string;

	form: TForm;
	result: TResult;

	createdAt: string;
};

export type CalculationHistoryItem<TForm = any, TResult = any> = {
	id: string;
	module: CalculationModule;
	category?: string;

	title: string;
	subtitle?: string;

	/**
	 * Legacy (sementara)
	 * Akan dihapus setelah semua calculator menggunakan items[]
	 */
	form: TForm;
	result: TResult;

	/**
	 * New structure
	 */
	items?: CalculationHistoryEntry<TForm, TResult>[];

	isPinned?: boolean;

	createdAt: string;
	updatedAt?: string;
};
