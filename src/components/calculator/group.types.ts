import type { ReactNode } from "react";

export type CalculationGroupResultProps<T> = {
	items: T[];

	renderItem: (item: T, index: number) => ReactNode;

	renderTotal?: (items: T[]) => ReactNode;

	emptyState?: ReactNode;
};
