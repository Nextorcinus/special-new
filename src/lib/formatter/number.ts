export function parseShortNumber(value: string): number {
	const cleanValue = value.trim().toUpperCase().replace(/,/g, "");

	if (!cleanValue) return 0;

	const number = Number.parseFloat(cleanValue);

	if (Number.isNaN(number)) return 0;

	if (cleanValue.endsWith("K")) return number * 1_000;
	if (cleanValue.endsWith("M")) return number * 1_000_000;
	if (cleanValue.endsWith("B")) return number * 1_000_000_000;

	return number;
}

export function formatShortNumber(value: number): string {
	if (value >= 1_000_000_000) return `${trimDecimal(value / 1_000_000_000)}B`;
	if (value >= 1_000_000) return `${trimDecimal(value / 1_000_000)}M`;
	if (value >= 1_000) return `${trimDecimal(value / 1_000)}K`;

	return String(value);
}

function trimDecimal(value: number): string {
	return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
