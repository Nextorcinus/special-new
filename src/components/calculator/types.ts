import type { ReactNode } from "react";

export type CalculatorCompareType = "plus" | "minus" | "muted";

export type CalculatorResultItem = {
	id: string;
	label: string;
	icon: string;
	value: string | number;
	hidden?: boolean;
	className?: string;
	valueClassName?: string;
	compareValue?: string | number;
	compareType?: CalculatorCompareType;
};

export type CalculatorResultSection = {
	id: string;
	title: string;
	icon?: ReactNode;
	items: CalculatorResultItem[];
	tutorialTarget?: string;
};

export type CalculatorResultProps = {
	title?: string;
	categoryTitle: string;
	categoryIcon: string;
	name: string;
	subtitle?: ReactNode;
	highlightLabel?: string;
	highlightValue?: string | number;

	createdAt?: string;
	updatedAt?: string;

	sections: CalculatorResultSection[];
};