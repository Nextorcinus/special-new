import type {
	ChiefGearType,
	GearData,
	GearFormValues,
	GearLevelOption,
	GearProgressionItem,
} from "../type";

export const CHIEF_GEAR_TYPES: ChiefGearType[] = [
	"Cap",
	"Watch",
	"Coat",
	"Pants",
	"Belt",
	"Weapon",
];

export const CHIEF_GEAR_LABELS: Record<ChiefGearType, string> = {
	Cap: "Cap",
	Watch: "Watch",
	Coat: "Coat",
	Pants: "Pants",
	Belt: "Belt",
	Weapon: "Weapon",
};

export const CHIEF_GEAR_TROOP_TYPES: Record<
	ChiefGearType,
	GearData["gearTypes"][ChiefGearType]
> = {
	Cap: "Lancer",
	Watch: "Lancer",
	Coat: "Infantry",
	Pants: "Infantry",
	Belt: "Marksman",
	Weapon: "Marksman",
};

function normalizeText(value: unknown): string {
	return String(value ?? "").trim().toLowerCase();
}

function isSameText(firstValue: unknown, secondValue: unknown): boolean {
	return normalizeText(firstValue) === normalizeText(secondValue);
}

function getProgression(data: GearData): GearProgressionItem[] {
	if (!data || !Array.isArray(data.progression)) {
		return [];
	}

	return data.progression;
}

export function getGearRows(
	data: GearData,
	_gear: ChiefGearType | "",
): GearProgressionItem[] {
	return getProgression(data);
}

export function getGearLevels(
	data: GearData,
	_gear: ChiefGearType | "",
): string[] {
	const progression = getProgression(data);

	// Intermediate .1-.4 stages stay in the calculation data,
	// but are not shown as selectable UI levels.
	return progression
		.filter((item) => item.stage === 0)
		.map((item) => item.name)
		.filter((level, index, levels) => levels.indexOf(level) === index);
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
	data: GearData,
	gear: ChiefGearType | "",
): GearLevelOption[] {
	const levels = getGearLevels(data, gear);

	if (levels.length <= 1) {
		return createGearLevelOptions(levels);
	}

	return createGearLevelOptions(levels.slice(0, -1));
}

export function getToLevelOptions(
	data: GearData,
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

	return createGearLevelOptions(levels.slice(fromIndex + 1));
}

export function getGearLevelIndex(
	data: GearData,
	gear: ChiefGearType | "",
	level: string,
): number {
	if (!gear || !level) {
		return -1;
	}

	return getGearLevels(data, gear).findIndex((currentLevel) =>
		isSameText(currentLevel, level),
	);
}

export function getNextGearLevel(
	data: GearData,
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

	if (currentIndex === -1 || currentIndex >= levels.length - 1) {
		return null;
	}

	return levels[currentIndex + 1];
}

export function getPreviousGearLevel(
	data: GearData,
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
	data: GearData,
	_gear: ChiefGearType | "",
	level: string,
): GearProgressionItem | null {
	if (!level) {
		return null;
	}

	return (
		getProgression(data).find((item) =>
			isSameText(item.name, level),
		) ?? null
	);
}

export function isValidGearSelection(
	data: GearData,
	values: GearFormValues,
): boolean {
	if (!values.gear || !values.fromLevel || !values.toLevel) {
		return false;
	}

	const levels = getGearLevels(data, values.gear);

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
	data: GearData,
	values: GearFormValues,
): GearFormValues {
	if (!values.gear) {
		return {
			gear: "",
			fromLevel: "",
			toLevel: "",
		};
	}

	if (!CHIEF_GEAR_TYPES.includes(values.gear)) {
		return {
			gear: "",
			fromLevel: "",
			toLevel: "",
		};
	}

	const levels = getGearLevels(data, values.gear);

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
	data: GearData,
	values: GearFormValues,
): GearProgressionItem[] {
	if (
		!values.gear ||
		!values.fromLevel ||
		!values.toLevel
	) {
		return [];
	}

	const progression = getProgression(data);

	const fromIndex = progression.findIndex((item) =>
		isSameText(item.name, values.fromLevel),
	);

	const toIndex = progression.findIndex((item) =>
		isSameText(item.name, values.toLevel),
	);

	if (
		fromIndex === -1 ||
		toIndex === -1 ||
		toIndex <= fromIndex
	) {
		return [];
	}

	// IMPORTANT:
	// This includes .1-.4 intermediate stages even though those stages
	// are hidden from the UI.
	return progression.slice(fromIndex + 1, toIndex + 1);
}
