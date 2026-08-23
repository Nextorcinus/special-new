import type {
	ChiefGearType,
	GearCalculationResult,
	GearData,
	GearFormValues,
	GearProgressionItem,
	GearResourceMap,
	GearStatResult,
} from "../type";
import {
	EMPTY_GEAR_RESOURCES,
	EMPTY_GEAR_STATS,
} from "../type";
import {
	getGearUpgradeRows,
	getGearLevelRow,
} from "./helpers";

function parseNumber(value: unknown): number {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value !== "string") {
		return 0;
	}

	const normalizedValue = value
		.trim()
		.replaceAll(",", "")
		.replace(/\s+/g, "");

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

function calculateResources(
	rows: GearProgressionItem[],
): GearResourceMap {
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

function calculateSvsPoints(
	rows: GearProgressionItem[],
): number {
	return rows.reduce(
		(total, item) => total + parseNumber(item.svsPoints),
		0,
	);
}

function calculateStats(
	fromRow: GearProgressionItem,
	toRow: GearProgressionItem,
): GearStatResult {
	const attackFrom = parseNumber(fromRow.stat);
	const attackTo = parseNumber(toRow.stat);

	const defenseFrom = parseNumber(fromRow.stat);
	const defenseTo = parseNumber(toRow.stat);

	const deploymentFrom = parseNumber(
		fromRow.deploymentCapacity,
	);

	const deploymentTo = parseNumber(
		toRow.deploymentCapacity,
	);

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
		deploymentIncrease:
			deploymentTo - deploymentFrom,

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
		throw new Error(
			"Pilih tipe Chief Gear terlebih dahulu.",
		);
	}

	if (!values.fromLevel) {
		throw new Error(
			"Pilih From level terlebih dahulu.",
		);
	}

	if (!values.toLevel) {
		throw new Error(
			"Pilih To level terlebih dahulu.",
		);
	}
}

export function calculateGear(
	values: GearFormValues,
	data: GearData,
): GearCalculationResult {
	validateForm(values);

	if (
		!data ||
		!Array.isArray(data.progression) ||
		data.progression.length === 0
	) {
		throw new Error(
			"Data Chief Gear tidak tersedia.",
		);
	}

	if (!data.gearTypes?.[values.gear]) {
		throw new Error(
			`Data untuk Chief Gear "${values.gear}" tidak ditemukan.`,
		);
	}

	const fromRow = getGearLevelRow(
		data,
		values.gear,
		values.fromLevel,
	);

	const toRow = getGearLevelRow(
		data,
		values.gear,
		values.toLevel,
	);

	if (!fromRow) {
		throw new Error(
			`From level "${values.fromLevel}" tidak ditemukan.`,
		);
	}

	if (!toRow) {
		throw new Error(
			`To level "${values.toLevel}" tidak ditemukan.`,
		);
	}

	const fromIndex = data.progression.findIndex(
		(item) => item.step === fromRow.step,
	);

	const toIndex = data.progression.findIndex(
		(item) => item.step === toRow.step,
	);

	if (fromIndex === -1 || toIndex === -1) {
		throw new Error(
			"Progression Chief Gear tidak valid.",
		);
	}

	if (toIndex <= fromIndex) {
		throw new Error(
			"To level harus lebih tinggi dari From level.",
		);
	}

	const upgradeRows = getGearUpgradeRows(
		data,
		values,
	);

	if (upgradeRows.length === 0) {
		throw new Error(
			"Tidak ada progression upgrade yang ditemukan.",
		);
	}

	return {
		gear: values.gear,

		fromLevel: values.fromLevel,

		toLevel: values.toLevel,

		form: {
			...values,
		},

		resources: calculateResources(
			upgradeRows,
		),

		svsPoints: calculateSvsPoints(
			upgradeRows,
		),

		stats: calculateStats(
			fromRow,
			toRow,
		),
	};
}

export default calculateGear;