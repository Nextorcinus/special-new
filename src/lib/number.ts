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

function trimTrailingZeros(value: string) {
	return value.replace(/\.?0+$/, "");
}

export function formatCompactNumber(value: number, decimals = 2): string {
	const absoluteValue = Math.abs(value);

	if (absoluteValue >= 1_000_000_000) {
		return `${trimTrailingZeros((value / 1_000_000_000).toFixed(decimals))}B`;
	}

	if (absoluteValue >= 1_000_000) {
		return `${trimTrailingZeros((value / 1_000_000).toFixed(decimals))}M`;
	}

	if (absoluteValue >= 1_000) {
		return `${trimTrailingZeros((value / 1_000).toFixed(decimals))}K`;
	}

	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: decimals,
	}).format(value);
}
