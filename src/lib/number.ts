export function parseResource(value: string | number | undefined | null): number {
	if (value === undefined || value === null) return 0;
	if (typeof value === "number") return value;

	const text = value.trim().toLowerCase();
	const num = parseFloat(text);

	if (Number.isNaN(num)) return 0;

	if (text.endsWith("k")) return num * 1_000;
	if (text.endsWith("m")) return num * 1_000_000;
	if (text.endsWith("b")) return num * 1_000_000_000;

	return num;
}