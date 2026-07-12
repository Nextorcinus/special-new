import type {
	ChiefGearType,
	GearDataItem,
	GearFormValues,
	GearLevelOption,
} from "../type";

export const CHIEF_GEAR_TYPES: ChiefGearType[] = [
	"Cap",
	"Watch",
	"Coat",
	"Pants",
	"Belt",
	"Weapon",
];

export const CHIEF_GEAR_LABELS: Record<
	ChiefGearType,
	string
> = {
	Cap: "Cap",
	Watch: "Watch",
	Coat: "Coat",
	Pants: "Pants",
	Belt: "Belt",
	Weapon: "Weapon",
};

function normalizeText(value: unknown): string {
	return String(value ?? "")
		.trim()
		.toLowerCase();
}

function isSameText(
	firstValue: unknown,
	secondValue: unknown,
): boolean {
	return (
		normalizeText(firstValue) ===
		normalizeText(secondValue)
	);
}

export function getGearRows(
	data: GearDataItem[],
	gear: ChiefGearType | "",
): GearDataItem[] {
	if (!Array.isArray(data) || !gear) {
		return [];
	}

	return data.filter((item) =>
		isSameText(item.Type, gear),
	);
}

export function getGearLevels(
	data: GearDataItem[],
	gear: ChiefGearType | "",
): string[] {
	if (!gear) {
		return [];
	}

	const uniqueLevels = new Set<string>();

	for (const item of getGearRows(data, gear)) {
		const level = String(item.Level ?? "").trim();

		if (!level || uniqueLevels.has(level)) {
			continue;
		}

		uniqueLevels.add(level);
	}

	return Array.from(uniqueLevels);
}

export function createGearLevelOptions(
	levels: string[],
): GearLevelOption[] {
	return levels.map((level) => ({
		value: level,
		label: level,
	}));
}

export function getFromLevelOptions(
	data: GearDataItem[],
	gear: ChiefGearType | "",
): GearLevelOption[] {
	const levels = getGearLevels(data, gear);

	if (levels.length <= 1) {
		return createGearLevelOptions(levels);
	}


	return createGearLevelOptions(
		levels.slice(0, -1),
	);
}

export function getToLevelOptions(
	data: GearDataItem[],
	gear: ChiefGearType | "",
	fromLevel: string,
): GearLevelOption[] {
	if (!gear || !fromLevel) {
		return [];
	}

	const levels = getGearLevels(data, gear);

	const fromIndex = levels.findIndex((level) =>
		isSameText(level, fromLevel),
	);

	if (fromIndex === -1) {
		return [];
	}

	return createGearLevelOptions(
		levels.slice(fromIndex + 1),
	);
}

export function getGearLevelIndex(
	data: GearDataItem[],
	gear: ChiefGearType | "",
	level: string,
): number {
	if (!gear || !level) {
		return -1;
	}

	const levels = getGearLevels(data, gear);

	return levels.findIndex((currentLevel) =>
		isSameText(currentLevel, level),
	);
}

export function getNextGearLevel(
	data: GearDataItem[],
	gear: ChiefGearType | "",
	currentLevel: string,
): string | null {
	if (!gear || !currentLevel) {
		return null;
	}

	const levels = getGearLevels(data, gear);

	const currentIndex = levels.findIndex((level) =>
		isSameText(level, currentLevel),
	);

	if (
		currentIndex === -1 ||
		currentIndex >= levels.length - 1
	) {
		return null;
	}

	return levels[currentIndex + 1];
}

export function getPreviousGearLevel(
	data: GearDataItem[],
	gear: ChiefGearType | "",
	currentLevel: string,
): string | null {
	if (!gear || !currentLevel) {
		return null;
	}

	const levels = getGearLevels(data, gear);

	const currentIndex = levels.findIndex((level) =>
		isSameText(level, currentLevel),
	);

	if (currentIndex <= 0) {
		return null;
	}

	return levels[currentIndex - 1];
}

export function getGearLevelRow(
	data: GearDataItem[],
	gear: ChiefGearType | "",
	level: string,
): GearDataItem | null {
	if (!gear || !level) {
		return null;
	}

	return (
		getGearRows(data, gear).find((item) =>
			isSameText(item.Level, level),
		) ?? null
	);
}

export function isValidGearSelection(
	data: GearDataItem[],
	values: GearFormValues,
): boolean {
	if (
		!values.gear ||
		!values.fromLevel ||
		!values.toLevel
	) {
		return false;
	}

	const levels = getGearLevels(
		data,
		values.gear,
	);

	const fromIndex = levels.findIndex((level) =>
		isSameText(level, values.fromLevel),
	);

	const toIndex = levels.findIndex((level) =>
		isSameText(level, values.toLevel),
	);

	return (
		fromIndex !== -1 &&
		toIndex !== -1 &&
		toIndex > fromIndex
	);
}

export function sanitizeGearFormValues(
	data: GearDataItem[],
	values: GearFormValues,
): GearFormValues {
	if (!values.gear) {
		return {
			gear: "",
			fromLevel: "",
			toLevel: "",
		};
	}

	const gearExists = CHIEF_GEAR_TYPES.includes(
		values.gear,
	);

	if (!gearExists) {
		return {
			gear: "",
			fromLevel: "",
			toLevel: "",
		};
	}

	const levels = getGearLevels(
		data,
		values.gear,
	);

	const fromIndex = levels.findIndex((level) =>
		isSameText(level, values.fromLevel),
	);

	if (fromIndex === -1) {
		return {
			gear: values.gear,
			fromLevel: "",
			toLevel: "",
		};
	}

	const toIndex = levels.findIndex((level) =>
		isSameText(level, values.toLevel),
	);

	if (toIndex <= fromIndex) {
		return {
			gear: values.gear,
			fromLevel: levels[fromIndex],
			toLevel: "",
		};
	}

	return {
		gear: values.gear,
		fromLevel: levels[fromIndex],
		toLevel: levels[toIndex],
	};
}

export function getGearDisplayName(
	gear: ChiefGearType | "",
): string {
	if (!gear) {
		return "Chief Gear";
	}

	return CHIEF_GEAR_LABELS[gear];
}

export function getGearUpgradeSubtitle(
	fromLevel: string,
	toLevel: string,
): string {
	if (!fromLevel && !toLevel) {
		return "";
	}

	if (!fromLevel) {
		return toLevel;
	}

	if (!toLevel) {
		return fromLevel;
	}

	return `${fromLevel} → ${toLevel}`;
}

export function getGearUpgradeRows(
	data: GearDataItem[],
	values: GearFormValues,
): GearDataItem[] {
	if (
		!values.gear ||
		!values.fromLevel ||
		!values.toLevel
	) {
		return [];
	}

	const rows = getGearRows(
		data,
		values.gear,
	);

	const fromIndex = rows.findIndex((item) =>
		isSameText(item.Level, values.fromLevel),
	);

	const toIndex = rows.findIndex((item) =>
		isSameText(item.Level, values.toLevel),
	);

	if (
		fromIndex === -1 ||
		toIndex === -1 ||
		toIndex <= fromIndex
	) {
		return [];
	}

	return rows.slice(
		fromIndex + 1,
		toIndex + 1,
	);
}