import type {
	UnlockT12AttributeResult,
	UnlockT12Database,
	UnlockT12Level,
	UnlockT12Resources,
} from "../type";

export function parseUnlockT12Number(value: unknown): number {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}

	const normalized = String(value ?? "")
		.trim()
		.replace(/,/g, "");

	if (!normalized) {
		return 0;
	}

	const suffix = normalized.slice(-1).toUpperCase();
	const numericPart =
		suffix === "K" || suffix === "M" || suffix === "B"
			? normalized.slice(0, -1)
			: normalized;

	const number = Number(numericPart);

	if (!Number.isFinite(number)) {
		return 0;
	}

	switch (suffix) {
		case "K":
			return number * 1_000;

		case "M":
			return number * 1_000_000;

		case "B":
			return number * 1_000_000_000;

		default:
			return number;
	}
}

export function getUnlockT12ResearchList(
	data: UnlockT12Database,
	category: string,
): string[] {
	const categoryData = data[category as keyof UnlockT12Database];

	return categoryData ? Object.keys(categoryData) : [];
}

export function getUnlockT12Levels(
	data: UnlockT12Database,
	category: string,
	research: string,
): UnlockT12Level[] {
	const categoryData = data[category as keyof UnlockT12Database];

	return categoryData?.[research] ?? [];
}

export function getUnlockT12LevelsInRange(
	levels: UnlockT12Level[],
	fromLevel: string,
	toLevel: string,
): UnlockT12Level[] {
	const from = parseUnlockT12Number(fromLevel);
	const to = parseUnlockT12Number(toLevel);

	if (to <= from) {
		return [];
	}

	return levels.filter((item) => {
		const level = parseUnlockT12Number(item.level);

		return level > from && level <= to;
	});
}

export function sumUnlockT12Resources(
	levels: UnlockT12Level[],
): UnlockT12Resources {
	return levels.reduce<UnlockT12Resources>(
		(total, level) => {
			total.Steel += parseUnlockT12Number(level.Steel);

			total.RFC += parseUnlockT12Number(level.RFC);

			total.Shard += parseUnlockT12Number(level["FC Shards"]);

			return total;
		},
		{
			Steel: 0,
			RFC: 0,
			Shard: 0,
		},
	);
}

export function sumUnlockT12Power(levels: UnlockT12Level[]): number {
	return levels.reduce(
		(total, level) => total + parseUnlockT12Number(level.power),
		0,
	);
}

function getAttributeMap(
	level?: UnlockT12Level,
): Map<string, UnlockT12AttributeResult> {
	const map = new Map<string, UnlockT12AttributeResult>();

	for (const attribute of level?.attributes ?? []) {
		const normalizedName = attribute.name.trim().toLowerCase();

		map.set(normalizedName, {
			name: normalizedName,
			value: parseUnlockT12Number(attribute.value),
			unit: attribute.unit ?? "",
		});
	}

	return map;
}

export function calculateUnlockT12Attributes(
	levels: UnlockT12Level[],
	fromLevel: string,
	toLevel: string,
): UnlockT12AttributeResult[] {
	const from = parseUnlockT12Number(fromLevel);
	const to = parseUnlockT12Number(toLevel);

	if (to <= from) {
		return [];
	}

	const fromData = levels.find(
		(item) => parseUnlockT12Number(item.level) === from,
	);

	const toData = levels.find((item) => parseUnlockT12Number(item.level) === to);

	if (!toData) {
		return [];
	}

	const fromAttributes = getAttributeMap(fromData);
	const toAttributes = getAttributeMap(toData);

	const result: UnlockT12AttributeResult[] = [];

	for (const [key, targetAttribute] of toAttributes) {
		const startingAttribute = fromAttributes.get(key);

		const value = targetAttribute.value - (startingAttribute?.value ?? 0);

		if (value === 0) {
			continue;
		}

		result.push({
			name: targetAttribute.name,
			value,
			unit: targetAttribute.unit || startingAttribute?.unit || "",
		});
	}

	return result.sort((a, b) => a.name.localeCompare(b.name));
}

export function isValidUnlockT12Selection(values: {
	research: string;
	fromLevel: string;
	toLevel: string;
}): boolean {
	if (!values.research || values.fromLevel === "" || values.toLevel === "") {
		return false;
	}

	const from = parseUnlockT12Number(values.fromLevel);

	const to = parseUnlockT12Number(values.toLevel);

	return to > from;
}
