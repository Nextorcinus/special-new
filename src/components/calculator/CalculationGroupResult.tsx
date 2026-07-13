"use client";

import type { ReactNode } from "react";

type CalculationGroupResultProps<T> = {
	items: T[];
	getKey: (item: T, index: number) => React.Key;
	renderItem: (item: T, index: number) => ReactNode;
	renderTotal?: (items: T[]) => ReactNode;
	emptyState?: ReactNode;
};

export default function CalculationGroupResult<T>({
	items,
	getKey,
	renderItem,
	renderTotal,
	emptyState = null,
}: CalculationGroupResultProps<T>) {
	if (items.length === 0) {
		return <>{emptyState}</>;
	}

	return (
		<div className="space-y-6">
			{items.map((item, index) => (
				<div key={getKey(item, index)}>{renderItem(item, index)}</div>
			))}

			{renderTotal && (
				<div className="border-t border-white/10 pt-6">
					{renderTotal(items)}
				</div>
			)}
		</div>
	);
}
