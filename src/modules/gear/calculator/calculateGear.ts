import type {
	ChiefGearType,
	GearCalculationResult,
	GearDataItem,
	GearFormValues,
	GearResourceMap,
	GearStatResult,
} from "../type";
import {
	EMPTY_GEAR_RESOURCES,
	EMPTY_GEAR_STATS,
} from "../type";

type GearNumericField =
	| "Plans"
	| "Polish"
	| "Alloy"
	| "Amber"
	| "SvS Points"
	| "Attack"
	| "Defense"
	| "troops deployment capacity";

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

function normalizeText(value: unknown): string {
	return String(value ?? "")
		.trim()
		.toLowerCase();
}

function getNumericValue(
	item: GearDataItem,
	field: GearNumericField,
): number {
	return parseNumber(item[field]);
}

function isSameGearType(
	itemType: GearDataItem["Type"],
	selectedType: ChiefGearType,
): boolean {
	return normalizeText(itemType) === normalizeText(selectedType);
}

function isSameLevel(
	itemLevel: GearDataItem["Level"],
	selectedLevel: string,
): boolean {
	return normalizeText(itemLevel) === normalizeText(selectedLevel);
}

function getGearRows(
	data: GearDataItem[],
	gear: ChiefGearType,
): GearDataItem[] {
	return data.filter((item) =>
		isSameGearType(item.Type, gear),
	);
}

function getLevelIndex(
	rows: GearDataItem[],
	level: string,
): number {
	return rows.findIndex((item) =>
		isSameLevel(item.Level, level),
	);
}

function getSelectedRows(
	rows: GearDataItem[],
	fromLevel: string,
	toLevel: string,
) {
	const fromIndex = getLevelIndex(rows, fromLevel);
	const toIndex = getLevelIndex(rows, toLevel);

	if (fromIndex === -1) {
		throw new Error(
			`From level "${fromLevel}" tidak ditemukan.`,
		);
	}

	if (toIndex === -1) {
		throw new Error(
			`To level "${toLevel}" tidak ditemukan.`,
		);
	}

	if (toIndex <= fromIndex) {
		throw new Error(
			"To level harus lebih tinggi dari From level.",
		);
	}

	return {
		fromRow: rows[fromIndex],
		toRow: rows[toIndex],

		/*
		 * Biaya upgrade dijumlahkan mulai dari level setelah From
		 * sampai level To.
		 *
		 * Contoh:
		 * From: Purple
		 * To: Purple 2 Star
		 *
		 * Yang dihitung:
		 * Purple 1 Star + Purple 2 Star
		 */
		upgradeRows: rows.slice(fromIndex + 1, toIndex + 1),
	};
}

function calculateResources(
	rows: GearDataItem[],
): GearResourceMap {
	return rows.reduce<GearResourceMap>(
		(total, item) => {
			total.Plans += getNumericValue(item, "Plans");
			total.Polish += getNumericValue(item, "Polish");
			total.Alloy += getNumericValue(item, "Alloy");
			total.Amber += getNumericValue(item, "Amber");

			return total;
		},
		{ ...EMPTY_GEAR_RESOURCES },
	);
}

function calculateSvsPoints(
	rows: GearDataItem[],
): number {
	return rows.reduce(
		(total, item) =>
			total + getNumericValue(item, "SvS Points"),
		0,
	);
}

function calculateStats(
	fromRow: GearDataItem,
	toRow: GearDataItem,
): GearStatResult {
	const attackFrom = getNumericValue(fromRow, "Attack");
	const attackTo = getNumericValue(toRow, "Attack");

	const defenseFrom = getNumericValue(
		fromRow,
		"Defense",
	);
	const defenseTo = getNumericValue(
		toRow,
		"Defense",
	);

	const deploymentFrom = getNumericValue(
		fromRow,
		"troops deployment capacity",
	);
	const deploymentTo = getNumericValue(
		toRow,
		"troops deployment capacity",
	);

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
	data: GearDataItem[],
): GearCalculationResult {
	validateForm(values);

	if (!Array.isArray(data) || data.length === 0) {
		throw new Error(
			"Data Chief Gear tidak tersedia.",
		);
	}

	const gearRows = getGearRows(
		data,
		values.gear,
	);

	if (gearRows.length === 0) {
		throw new Error(
			`Data untuk Chief Gear "${values.gear}" tidak ditemukan.`,
		);
	}

	const {
		fromRow,
		toRow,
		upgradeRows,
	} = getSelectedRows(
		gearRows,
		values.fromLevel,
		values.toLevel,
	);

	return {
	gear: values.gear,
	fromLevel: values.fromLevel,
	toLevel: values.toLevel,

	form: {
		...values,
	},

	resources: calculateResources(upgradeRows),

	svsPoints: calculateSvsPoints(upgradeRows),

	stats: calculateStats(
		fromRow,
		toRow,
	),
};
}

export default calculateGear;