import type {
	CharmCalculationResult,
	CharmDataItem,
	CharmFormValues,
	CharmResourceMap,
	CharmStatResult,
	ChiefCharmType,
} from "../type";

import {
	CHARM_STAT_LABEL_MAP,
	EMPTY_CHARM_RESOURCES,
	EMPTY_CHARM_STATS,
} from "../type";

type CharmNumericField =
	| "guide_cost"
	| "design_cost"
	| "jewel_cost"
	| "power_total"
	| "stat_total"
	| "power_diff"
	| "stat_diff"
	| "svs_point";

/**
 * Whiteout Survival SvS Preparation Phase:
 *
 * 1 Charm Score = 70 SvS Points
 */
const CHARM_SVS_MULTIPLIER = 70;

function parseNumber(value: unknown): number {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value !== "string") {
		return 0;
	}

	const normalizedValue = value.trim().replaceAll(",", "").replace(/\s+/g, "");

	if (!normalizedValue) {
		return 0;
	}

	const suffix = normalizedValue.slice(-1).toUpperCase();
	const numericPart = Number.parseFloat(normalizedValue);

	if (!Number.isFinite(numericPart)) {
		return 0;
	}

	switch (suffix) {
		case "K":
			return numericPart * 1_000;

		case "M":
			return numericPart * 1_000_000;

		case "B":
			return numericPart * 1_000_000_000;

		default:
			return numericPart;
	}
}

function getNumericValue(
	item: CharmDataItem,
	field: CharmNumericField,
): number {
	return parseNumber(item[field]);
}

function getLevelValue(level: unknown): number {
	return parseNumber(level);
}

function getLevelIndex(data: CharmDataItem[], level: string): number {
	const selectedLevel = getLevelValue(level);

	return data.findIndex((item) => getLevelValue(item.level) === selectedLevel);
}

function getSelectedRows(
	data: CharmDataItem[],
	fromLevel: string,
	toLevel: string,
) {
	const fromIndex = getLevelIndex(data, fromLevel);

	const toIndex = getLevelIndex(data, toLevel);

	if (fromIndex === -1) {
		throw new Error(`From level "${fromLevel}" tidak ditemukan.`);
	}

	if (toIndex === -1) {
		throw new Error(`To level "${toLevel}" tidak ditemukan.`);
	}

	if (toIndex <= fromIndex) {
		throw new Error("To level harus lebih tinggi dari From level.");
	}

	return {
		fromRow: data[fromIndex],
		toRow: data[toIndex],

		/*
		 * Biaya upgrade dihitung mulai dari level setelah From
		 * sampai level To.
		 *
		 * Contoh:
		 * From: Lv.3
		 * To: Lv.5
		 *
		 * Yang dijumlahkan:
		 * Lv.4 + Lv.4.1 + Lv.4.2 + Lv.4.3
		 * + Lv.5
		 */
		upgradeRows: data.slice(fromIndex + 1, toIndex + 1),
	};
}

function calculateResources(rows: CharmDataItem[]): CharmResourceMap {
	return rows.reduce<CharmResourceMap>(
		(total, item) => {
			total.Guide += getNumericValue(item, "guide_cost");

			total.Design += getNumericValue(item, "design_cost");

			total.Jewel += getNumericValue(item, "jewel_cost");

			return total;
		},
		{ ...EMPTY_CHARM_RESOURCES },
	);
}

/**
 * Calculate actual SvS Points.
 *
 * The JSON `svs_point` value represents Charm Score.
 *
 * Example:
 *
 * Lv.16.1 = 2,500 Charm Score
 * 2,500 × 70 = 175,000 SvS Points
 *
 * Lv.17.1 = 2,700 Charm Score
 * 2,700 × 70 = 189,000 SvS Points
 */
function calculateSvsPoints(rows: CharmDataItem[]): number {
	const charmScore = rows.reduce(
		(total, item) => total + getNumericValue(item, "svs_point"),
		0,
	);

	return charmScore * CHARM_SVS_MULTIPLIER;
}

function calculateStats(
	fromRow: CharmDataItem,
	toRow: CharmDataItem,
	upgradeRows: CharmDataItem[],
	type: ChiefCharmType,
): CharmStatResult {
	const powerFrom = getNumericValue(fromRow, "power_total");

	const powerToRaw = getNumericValue(toRow, "power_total");

	const statFrom = getNumericValue(fromRow, "stat_total");

	const statToRaw = getNumericValue(toRow, "stat_total");

	const powerIncrease = upgradeRows.reduce(
		(total, item) => total + getNumericValue(item, "power_diff"),
		0,
	);

	const statIncrease = upgradeRows.reduce(
		(total, item) => total + getNumericValue(item, "stat_diff"),
		0,
	);

	const powerTo = powerToRaw > 0 ? powerToRaw : powerFrom + powerIncrease;

	const statTo = statToRaw > 0 ? statToRaw : statFrom + statIncrease;

	return {
		...EMPTY_CHARM_STATS,

		troopType: CHARM_STAT_LABEL_MAP[type],

		powerFrom,
		powerTo,
		powerIncrease,

		statFrom,
		statTo,
		statIncrease,

		lethalityIncrease: statIncrease,
		healthIncrease: statIncrease,
	};
}

function validateForm(
	values: CharmFormValues,
): asserts values is CharmFormValues & {
	type: ChiefCharmType;
} {
	if (!values.type) {
		throw new Error("Pilih tipe Chief Charm terlebih dahulu.");
	}

	if (!values.fromLevel) {
		throw new Error("Pilih From level terlebih dahulu.");
	}

	if (!values.toLevel) {
		throw new Error("Pilih To level terlebih dahulu.");
	}
}

export function calculateCharm(
	values: CharmFormValues,
	data: CharmDataItem[],
): CharmCalculationResult {
	validateForm(values);

	if (!Array.isArray(data) || data.length === 0) {
		throw new Error("Data Chief Charm tidak tersedia.");
	}

	const sortedData = [...data].sort(
		(firstItem, secondItem) =>
			getLevelValue(firstItem.level) - getLevelValue(secondItem.level),
	);

	const { fromRow, toRow, upgradeRows } = getSelectedRows(
		sortedData,
		values.fromLevel,
		values.toLevel,
	);

	/*
	 * `svs_point` dari JSON adalah Charm Score.
	 *
	 * calculateSvsPoints() mengubahnya menjadi
	 * actual SvS Points dengan multiplier ×70.
	 */
	const baseSvsPoints = calculateSvsPoints(upgradeRows);

	const parsedValeriaLevel = Number.parseInt(values.valeriaLevel, 10);

	const valeriaLevel = Number.isFinite(parsedValeriaLevel)
		? Math.min(Math.max(parsedValeriaLevel, 0), 10)
		: 0;

	/*
	 * Valeria memberikan +2% SvS Points
	 * per level, maksimal +20%.
	 */
	const valeriaBonus = Math.min(valeriaLevel * 2, 20);

	const valeriaBonusPoints = baseSvsPoints * (valeriaBonus / 100);

	const svsPoints = baseSvsPoints + valeriaBonusPoints;

	return {
		type: values.type,

		fromLevel: values.fromLevel,
		toLevel: values.toLevel,

		form: {
			...values,
			valeriaLevel: String(valeriaLevel),
		},

		resources: calculateResources(upgradeRows),

		baseSvsPoints,
		valeriaLevel,
		valeriaBonus,
		valeriaBonusPoints,
		svsPoints,

		stats: calculateStats(fromRow, toRow, upgradeRows, values.type),
	};
}

export default calculateCharm;
