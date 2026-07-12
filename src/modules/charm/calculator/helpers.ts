import type {
	CharmDataItem,
	CharmFormValues,
	CharmLevelOption,
	ChiefCharmType,
} from "../type";
import {
	CHARM_TYPES,
	DEFAULT_CHARM_FORM_VALUES,
} from "../type";

function parseLevel(value: unknown): number {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : Number.NaN;
	}

	if (typeof value !== "string") {
		return Number.NaN;
	}

	const normalizedValue = value
		.trim()
		.replaceAll(",", "");

	if (!normalizedValue) {
		return Number.NaN;
	}

	const parsedValue = Number.parseFloat(normalizedValue);

	return Number.isFinite(parsedValue)
		? parsedValue
		: Number.NaN;
}

function formatLevelLabel(level: number): string {
	return `Lv.${level}`;
}

function isChiefCharmType(
	value: unknown,
): value is ChiefCharmType {
	return CHARM_TYPES.includes(
		value as ChiefCharmType,
	);
}

function sanitizeValeriaLevel(
	value: unknown,
): string {
	const parsedLevel = Number.parseInt(
		String(value ?? ""),
		10,
	);

	if (!Number.isFinite(parsedLevel)) {
		return DEFAULT_CHARM_FORM_VALUES.valeriaLevel;
	}

	return String(
		Math.min(
			Math.max(parsedLevel, 0),
			10,
		),
	);
}

export function sortCharmData(
	data: CharmDataItem[],
): CharmDataItem[] {
	if (!Array.isArray(data)) {
		return [];
	}

	return [...data]
		.filter((item) =>
			Number.isFinite(parseLevel(item.level)),
		)
		.sort(
			(firstItem, secondItem) =>
				parseLevel(firstItem.level) -
				parseLevel(secondItem.level),
		);
}

export function getCharmLevels(
	data: CharmDataItem[],
): number[] {
	const uniqueLevels = new Set<number>();

	for (const item of sortCharmData(data)) {
		const level = parseLevel(item.level);

		if (!Number.isFinite(level)) {
			continue;
		}

		uniqueLevels.add(level);
	}

	return Array.from(uniqueLevels);
}

export function createCharmLevelOptions(
	levels: number[],
): CharmLevelOption[] {
	return levels.map((level) => ({
		value: String(level),
		label: formatLevelLabel(level),
	}));
}

export function getFromLevelOptions(
	data: CharmDataItem[],
): CharmLevelOption[] {
	const levels = getCharmLevels(data);

	if (levels.length <= 1) {
		return createCharmLevelOptions(levels);
	}

	return createCharmLevelOptions(
		levels.slice(0, -1),
	);
}

export function getToLevelOptions(
	data: CharmDataItem[],
	fromLevel: string,
): CharmLevelOption[] {
	if (!fromLevel) {
		return [];
	}

	const levels = getCharmLevels(data);
	const selectedFromLevel = parseLevel(fromLevel);

	if (!Number.isFinite(selectedFromLevel)) {
		return [];
	}

	const fromIndex = levels.findIndex(
		(level) => level === selectedFromLevel,
	);

	if (fromIndex === -1) {
		return [];
	}

	return createCharmLevelOptions(
		levels.slice(fromIndex + 1),
	);
}

export function getCharmLevelIndex(
	data: CharmDataItem[],
	level: string,
): number {
	if (!level) {
		return -1;
	}

	const selectedLevel = parseLevel(level);

	if (!Number.isFinite(selectedLevel)) {
		return -1;
	}

	return getCharmLevels(data).findIndex(
		(currentLevel) =>
			currentLevel === selectedLevel,
	);
}

export function getCharmLevelRow(
	data: CharmDataItem[],
	level: string,
): CharmDataItem | null {
	if (!level) {
		return null;
	}

	const selectedLevel = parseLevel(level);

	if (!Number.isFinite(selectedLevel)) {
		return null;
	}

	return (
		sortCharmData(data).find(
			(item) =>
				parseLevel(item.level) ===
				selectedLevel,
		) ?? null
	);
}

export function getNextCharmLevel(
	data: CharmDataItem[],
	currentLevel: string,
): string | null {
	const currentIndex = getCharmLevelIndex(
		data,
		currentLevel,
	);

	const levels = getCharmLevels(data);

	if (
		currentIndex === -1 ||
		currentIndex >= levels.length - 1
	) {
		return null;
	}

	return String(levels[currentIndex + 1]);
}

export function getPreviousCharmLevel(
	data: CharmDataItem[],
	currentLevel: string,
): string | null {
	const currentIndex = getCharmLevelIndex(
		data,
		currentLevel,
	);

	const levels = getCharmLevels(data);

	if (currentIndex <= 0) {
		return null;
	}

	return String(levels[currentIndex - 1]);
}

export function isValidCharmSelection(
	data: CharmDataItem[],
	values: CharmFormValues,
): boolean {
	if (
		!values.type ||
		!values.fromLevel ||
		!values.toLevel
	) {
		return false;
	}

	if (!isChiefCharmType(values.type)) {
		return false;
	}

	const levels = getCharmLevels(data);

	const fromLevel = parseLevel(
		values.fromLevel,
	);
	const toLevel = parseLevel(
		values.toLevel,
	);

	if (
		!Number.isFinite(fromLevel) ||
		!Number.isFinite(toLevel)
	) {
		return false;
	}

	const fromIndex = levels.findIndex(
		(level) => level === fromLevel,
	);

	const toIndex = levels.findIndex(
		(level) => level === toLevel,
	);

	return (
		fromIndex !== -1 &&
		toIndex !== -1 &&
		toIndex > fromIndex
	);
}

export function sanitizeCharmFormValues(
	data: CharmDataItem[],
	values: CharmFormValues,
): CharmFormValues {
	const type: ChiefCharmType | "" =
		isChiefCharmType(values.type)
			? values.type
			: "";

	const valeriaLevel =
		sanitizeValeriaLevel(
			values.valeriaLevel,
		);

	const levels = getCharmLevels(data);

	const selectedFromLevel = parseLevel(
		values.fromLevel,
	);

	const fromIndex = levels.findIndex(
		(level) =>
			level === selectedFromLevel,
	);

	if (fromIndex === -1) {
		return {
			type,
			fromLevel: "",
			toLevel: "",
			valeriaLevel,
		};
	}

	const selectedToLevel = parseLevel(
		values.toLevel,
	);

	const toIndex = levels.findIndex(
		(level) =>
			level === selectedToLevel,
	);

	if (toIndex <= fromIndex) {
		return {
			type,
			fromLevel: String(
				levels[fromIndex],
			),
			toLevel: "",
			valeriaLevel,
		};
	}

	return {
		type,
		fromLevel: String(
			levels[fromIndex],
		),
		toLevel: String(
			levels[toIndex],
		),
		valeriaLevel,
	};
}

export function getCharmUpgradeSubtitle(
	fromLevel: string,
	toLevel: string,
): string {
	if (!fromLevel && !toLevel) {
		return "";
	}

	if (!fromLevel) {
		return `Lv.${toLevel}`;
	}

	if (!toLevel) {
		return `Lv.${fromLevel}`;
	}

	return `Lv.${fromLevel} → Lv.${toLevel}`;
}

export function getCharmUpgradeRows(
	data: CharmDataItem[],
	values: CharmFormValues,
): CharmDataItem[] {
	if (
		!values.fromLevel ||
		!values.toLevel
	) {
		return [];
	}

	const rows = sortCharmData(data);

	const selectedFromLevel = parseLevel(
		values.fromLevel,
	);
	const selectedToLevel = parseLevel(
		values.toLevel,
	);

	if (
		!Number.isFinite(selectedFromLevel) ||
		!Number.isFinite(selectedToLevel)
	) {
		return [];
	}

	const fromIndex = rows.findIndex(
		(item) =>
			parseLevel(item.level) ===
			selectedFromLevel,
	);

	const toIndex = rows.findIndex(
		(item) =>
			parseLevel(item.level) ===
			selectedToLevel,
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