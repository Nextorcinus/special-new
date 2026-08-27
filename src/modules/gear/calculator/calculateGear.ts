import type {
	ChiefGearType,
	GearCalculationResult,
	GearData,
	GearFormValues,
	GearProgressionItem,
	GearResourceMap,
	GearStatResult,
} from "../type";

import { EMPTY_GEAR_RESOURCES, EMPTY_GEAR_STATS } from "../type";

import { getGearLevelRow, getGearUpgradeRows } from "./helpers";

/**
 * Convert supported numeric values into numbers.
 *
 * Supports:
 * 100
 * "100"
 * "1,000"
 * "1.5K"
 * "2M"
 * "3B"
 */
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

/**
 * Calculate all resources required for the upgrade.
 *
 * IMPORTANT:
 *
 * We include every progression step between From
 * and To, including hidden refinement steps.
 *
 * Example:
 *
 * Red T6 ★★
 *      ↓
 * step 146
 * step 147
 * step 148
 * step 149
 * Red T6 ★★★
 *      ↓
 * step 150
 *
 * All five upgrade rows contribute resources.
 */
function calculateResources(rows: GearProgressionItem[]): GearResourceMap {
	return rows.reduce<GearResourceMap>(
		(total, item) => {
			total.Plans += parseNumber(item.scroll);

			total.Polish += parseNumber(item.potion);

			total.Alloy += parseNumber(item.ingot);

			total.Amber += parseNumber(item.amber);

			return total;
		},
		{ ...EMPTY_GEAR_RESOURCES },
	);
}

/**
 * Calculate total SvS Points.
 *
 * IMPORTANT:
 *
 * svsPoints inside the JSON already contains the
 * FINAL SvS value for that progression milestone.
 *
 * Therefore:
 *
 *     DO NOT ×36 here.
 *
 *     DO NOT calculate from power.
 *
 *     DO NOT use only toRow.svsPoints.
 *
 * Instead, sum all svsPoints from every progression
 * row crossed by the upgrade.
 *
 * Example:
 *
 * Red T6 ★★
 *      ↓
 * 146 = 0
 * 147 = 0
 * 148 = 0
 * 149 = 0
 * 150 = 554040
 *
 * Total:
 *
 * 554040
 *
 * For a larger upgrade:
 *
 * Red T4
 *      ↓
 * Red T4 ★★★
 *      ↓
 * Red T5
 *      ↓
 * Red T6
 *
 * Every milestone's svsPoints is accumulated.
 */
function calculateSvsPoints(rows: GearProgressionItem[]): number {
	return rows.reduce((total, item) => {
		return total + parseNumber(item.svsPoints);
	}, 0);
}

/**
 * Calculate stats using the selected MAIN rows.
 *
 * IMPORTANT:
 *
 * Do NOT use the intermediate refinement row
 * as the selected From or To stat.
 *
 * Example:
 *
 * Red T6 ★★
 * stat = 246.50
 *
 * Red T6 ★★★
 * stat = 255.00
 *
 * Increase:
 *
 * 255.00 - 246.50
 * = 8.50%
 */
function calculateStats(
	fromRow: GearProgressionItem,
	toRow: GearProgressionItem,
): GearStatResult {
	const attackFrom = parseNumber(fromRow.stat);

	const attackTo = parseNumber(toRow.stat);

	const defenseFrom = parseNumber(fromRow.stat);

	const defenseTo = parseNumber(toRow.stat);

	const deploymentFrom = parseNumber(fromRow.deploymentCapacity);

	const deploymentTo = parseNumber(toRow.deploymentCapacity);

	const powerFrom = parseNumber(fromRow.power);

	const powerTo = parseNumber(toRow.power);

	return {
		...EMPTY_GEAR_STATS,

		attackFrom,

		attackTo,

		attackIncrease: attackTo - attackFrom,

		defenseFrom,

		defenseTo,

		defenseIncrease: defenseTo - defenseFrom,

		deploymentFrom,

		deploymentTo,

		deploymentIncrease: deploymentTo - deploymentFrom,

		powerFrom,

		powerTo,

		powerIncrease: powerTo - powerFrom,
	};
}

function validateForm(
	values: GearFormValues,
): asserts values is GearFormValues & {
	gear: ChiefGearType;
} {
	if (!values.gear) {
		throw new Error("Pilih tipe Chief Gear terlebih dahulu.");
	}

	if (!values.fromLevel) {
		throw new Error("Pilih From level terlebih dahulu.");
	}

	if (!values.toLevel) {
		throw new Error("Pilih To level terlebih dahulu.");
	}
}

export function calculateGear(
	values: GearFormValues,
	data: GearData,
): GearCalculationResult {
	validateForm(values);

	/*
	 * --------------------------------------------------
	 * 1. Validate data
	 * --------------------------------------------------
	 */

	if (
		!data ||
		!Array.isArray(data.progression) ||
		data.progression.length === 0
	) {
		throw new Error("Data Chief Gear tidak tersedia.");
	}

	/*
	 * --------------------------------------------------
	 * 2. Validate selected gear
	 * --------------------------------------------------
	 */

	if (!data.gearTypes?.[values.gear]) {
		throw new Error(`Data untuk Chief Gear "${values.gear}" tidak ditemukan.`);
	}

	/*
	 * --------------------------------------------------
	 * 3. Resolve MAIN From row
	 * --------------------------------------------------
	 *
	 * getGearLevelRow() intentionally finds the exact
	 * named row.
	 *
	 * Therefore:
	 *
	 * Red T6 ★★
	 * -> step 145
	 *
	 * Red T6 ★★★
	 * -> step 150
	 *
	 * It does NOT select step 149 as the From row.
	 */

	const fromRow = getGearLevelRow(data, values.gear, values.fromLevel);

	const toRow = getGearLevelRow(data, values.gear, values.toLevel);

	if (!fromRow) {
		throw new Error(`From level "${values.fromLevel}" tidak ditemukan.`);
	}

	if (!toRow) {
		throw new Error(`To level "${values.toLevel}" tidak ditemukan.`);
	}

	/*
	 * --------------------------------------------------
	 * 4. Validate progression indexes
	 * --------------------------------------------------
	 */

	const fromIndex = data.progression.findIndex(
		(item) => item.step === fromRow.step,
	);

	const toIndex = data.progression.findIndex(
		(item) => item.step === toRow.step,
	);

	if (fromIndex === -1 || toIndex === -1) {
		throw new Error("Progression Chief Gear tidak valid.");
	}

	if (toIndex <= fromIndex) {
		throw new Error("To level harus lebih tinggi dari From level.");
	}

	/*
	 * --------------------------------------------------
	 * 5. Get ALL upgrade rows
	 * --------------------------------------------------
	 *
	 * This is very important.
	 *
	 * Example:
	 *
	 * From:
	 * Red T6 ★★
	 *
	 * To:
	 * Red T6 ★★★
	 *
	 * Rows:
	 *
	 * 146
	 * 147
	 * 148
	 * 149
	 * 150
	 *
	 * These rows are needed for resources AND
	 * SvS calculation.
	 */

	const upgradeRows = getGearUpgradeRows(data, values);

	if (upgradeRows.length === 0) {
		throw new Error("Tidak ada progression upgrade yang ditemukan.");
	}

	/*
	 * --------------------------------------------------
	 * 6. Calculate Resources
	 * --------------------------------------------------
	 */

	const resources = calculateResources(upgradeRows);

	/*
	 * --------------------------------------------------
	 * 7. Calculate SvS
	 * --------------------------------------------------
	 *
	 * Sum every progression row.
	 *
	 * Intermediate refinement rows normally have:
	 *
	 * svsPoints = 0
	 *
	 * Main milestone rows contain the actual SvS
	 * value.
	 *
	 * Therefore summing the rows automatically gives
	 * the correct cumulative SvS score.
	 */

	const svsPoints = calculateSvsPoints(upgradeRows);

	/*
	 * --------------------------------------------------
	 * 8. Calculate stats
	 * --------------------------------------------------
	 *
	 * Stats MUST come from the MAIN From and To rows.
	 *
	 * Example:
	 *
	 * 246.50%
	 * →
	 * 255.00%
	 *
	 * = +8.50%
	 */

	const stats = calculateStats(fromRow, toRow);

	/*
	 * --------------------------------------------------
	 * 9. Return result
	 * --------------------------------------------------
	 */

	return {
		gear: values.gear,

		fromLevel: values.fromLevel,

		toLevel: values.toLevel,

		form: {
			...values,
		},

		resources,

		svsPoints,

		stats,

		/*
		 * Existing API.
		 *
		 * Attack and Defense are currently using the
		 * same Chief Gear stat source.
		 *
		 * Example:
		 *
		 * Attack  +8.50%
		 * Defense +8.50%
		 *
		 * statAdd:
		 *
		 * 8.50 + 8.50
		 * = 17.00
		 */
		statAdd: stats.attackIncrease + stats.defenseIncrease,

		/*
		 * Deployment:
		 *
		 * 1780 - 1730
		 * = +50
		 */
		deploymentAdd: stats.deploymentIncrease,
	};
}

export default calculateGear;
