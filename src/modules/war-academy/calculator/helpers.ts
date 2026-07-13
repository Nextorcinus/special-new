import type {
	WarAcademyCategory,
	WarAcademyDatabase,
	WarAcademyDatabaseResources,
	WarAcademyLevel,
} from "../type";

export function parseWarAcademyNumber(value: unknown, fallback = 0): number {
	const parsed = Number(value);

	if (!Number.isFinite(parsed)) {
		return fallback;
	}

	return parsed;
}

export function getWarAcademyResearchMap(
	data: WarAcademyDatabase,
	category: WarAcademyCategory,
) {
	return data?.[category] ?? {};
}

export function getWarAcademyResearchNames(
	data: WarAcademyDatabase,
	category: WarAcademyCategory,
): string[] {
	return Object.keys(getWarAcademyResearchMap(data, category));
}

export function getWarAcademyRows(
	data: WarAcademyDatabase,
	category: WarAcademyCategory,
	research: string,
): WarAcademyLevel[] {
	const rows = getWarAcademyResearchMap(data, category)?.[research];

	if (!Array.isArray(rows)) {
		return [];
	}

	return [...rows].sort((a, b) => a.level - b.level);
}

export function getWarAcademyLevels(
	data: WarAcademyDatabase,
	category: WarAcademyCategory,
	research: string,
): number[] {
	return getWarAcademyRows(data, category, research).map((row) => row.level);
}

export function getWarAcademyFromLevelOptions(
	data: WarAcademyDatabase,
	category: WarAcademyCategory,
	research: string,
): number[] {
	const levels = getWarAcademyLevels(data, category, research);

	if (levels.length <= 1) {
		return levels;
	}

	return levels.slice(0, -1);
}

export function getWarAcademyToLevelOptions(
	data: WarAcademyDatabase,
	category: WarAcademyCategory,
	research: string,
	fromLevel: string | number,
): number[] {
	const from = parseWarAcademyNumber(fromLevel, -1);

	return getWarAcademyLevels(data, category, research).filter(
		(level) => level > from,
	);
}

export function getWarAcademyLevelsInRange(
	rows: WarAcademyLevel[],
	fromLevel: number,
	toLevel: number,
): WarAcademyLevel[] {
	return rows.filter((row) => row.level > fromLevel && row.level <= toLevel);
}

export function isValidWarAcademySelection(params: {
	rows: WarAcademyLevel[];
	fromLevel: number;
	toLevel: number;
}): boolean {
	const { rows, fromLevel, toLevel } = params;

	if (rows.length === 0) {
		return false;
	}

	if (!Number.isFinite(fromLevel)) {
		return false;
	}

	if (!Number.isFinite(toLevel)) {
		return false;
	}

	if (toLevel <= fromLevel) {
		return false;
	}

	const availableLevels = new Set(rows.map((row) => row.level));

	return availableLevels.has(fromLevel) && availableLevels.has(toLevel);
}

export function createEmptyWarAcademyDatabaseResources(): WarAcademyDatabaseResources {
	return {
		meat: 0,
		wood: 0,
		coal: 0,
		iron: 0,
		steel: 0,
		shard: 0,
	};
}

export function normalizeWarAcademyDatabaseResources(
	resources?: Partial<WarAcademyDatabaseResources>,
): WarAcademyDatabaseResources {
	return {
		meat: parseWarAcademyNumber(resources?.meat),
		wood: parseWarAcademyNumber(resources?.wood),
		coal: parseWarAcademyNumber(resources?.coal),
		iron: parseWarAcademyNumber(resources?.iron),
		steel: parseWarAcademyNumber(resources?.steel),
		shard: parseWarAcademyNumber(resources?.shard),
	};
}
