export function sumNumber(value: unknown): number {
	const numberValue = Number(value);

	return Number.isFinite(numberValue) ? numberValue : 0;
}

export function sumResourceMap<TKey extends string, TItem>(
	items: TItem[],
	keys: TKey[],
	getResources: (item: TItem) => Partial<Record<TKey, unknown>> | undefined,
): Record<TKey, number> {
	const result = {} as Record<TKey, number>;

	for (const key of keys) {
		let total = 0;

		for (const item of items) {
			const resources = getResources(item);
			total += sumNumber(resources?.[key]);
		}

		result[key] = total;
	}

	return result;
}

export function sumField<TItem>(
	items: TItem[],
	getValue: (item: TItem) => unknown,
): number {
	let total = 0;

	for (const item of items) {
		total += sumNumber(getValue(item));
	}

	return total;
}
