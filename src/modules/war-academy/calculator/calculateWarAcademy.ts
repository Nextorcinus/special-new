import { formatDuration } from "@/lib/time";

import type {
	CalculateWarAcademyParams,
	SelectedWarAcademyLevel,
	WarAcademyCalculationResult,
	WarAcademyDatabaseResources,
	WarAcademyResultResources,
} from "../type";

import {
	createEmptyWarAcademyDatabaseResources,
	getWarAcademyLevelsInRange,
	getWarAcademyRows,
	isValidWarAcademySelection,
	normalizeWarAcademyDatabaseResources,
	parseWarAcademyNumber,
} from "./helpers";

const VP_RESEARCH_SPEED_BONUS: Record<string, number> = {
	Off: 0,
	"0": 0,

	"10%": 10,
	"15%": 15,

	"+10%": 10,
	"+15%": 15,
};

const AGNES_RESEARCH_TIME_REDUCTION: Record<string, number> = {
	Off: 0,
	"0": 0,

	"1": 2,
	"2": 4,
	"3": 6,
	"4": 8,
	"5": 10,

	"Lv.1": 2,
	"Lv.2": 4,
	"Lv.3": 6,
	"Lv.4": 8,
	"Lv.5": 10,
};

const DOUBLE_TIME_RESEARCH_SPEED = 20;

function getVpResearchSpeed(value: string): number {
	return VP_RESEARCH_SPEED_BONUS[value] ?? 0;
}

function getAgnesTimeReduction(value: string): number {
	return AGNES_RESEARCH_TIME_REDUCTION[value] ?? 0;
}

function sumDatabaseResources(
	target: WarAcademyDatabaseResources,
	source: Partial<WarAcademyDatabaseResources>,
) {
	const normalized = normalizeWarAcademyDatabaseResources(source);

	target.meat += normalized.meat;
	target.wood += normalized.wood;
	target.coal += normalized.coal;
	target.iron += normalized.iron;
	target.steel += normalized.steel;
	target.shard += normalized.shard;
}

function convertResourcesForResult(
	resources: WarAcademyDatabaseResources,
): WarAcademyResultResources {
	return {
		Meat: resources.meat,
		Wood: resources.wood,
		Coal: resources.coal,
		Iron: resources.iron,
		Steel: resources.steel,
		Shard: resources.shard,
	};
}

function calculateTime(params: {
	totalSeconds: number;
	researchSpeed: number;
	agnesTimeReduction: number;
}) {
	const { totalSeconds, researchSpeed, agnesTimeReduction } = params;

	/*
	 * Research Speed mempercepat durasi dengan rumus:
	 *
	 * final = original / (1 + speed / 100)
	 */
	const afterResearchSpeed = totalSeconds / (1 + researchSpeed / 100);

	/*
	 * Agnes mengurangi waktu setelah Research Speed diterapkan.
	 */
	const afterAgnes = afterResearchSpeed * (1 - agnesTimeReduction / 100);

	const finalSeconds = Math.max(0, Math.round(afterAgnes));

	const reducedSeconds = Math.max(0, totalSeconds - finalSeconds);

	return {
		totalSeconds,
		reducedSeconds,
		finalSeconds,

		total: formatDuration(totalSeconds),
		reduced: formatDuration(reducedSeconds),
		final: formatDuration(finalSeconds),
	};
}

export default function calculateWarAcademy({
	category,
	data,
	values,
}: CalculateWarAcademyParams): WarAcademyCalculationResult {
	if (!values.research) {
		throw new Error("Pilih War Academy research terlebih dahulu.");
	}

	const rows = getWarAcademyRows(data, category, values.research);

	const fromLevel = parseWarAcademyNumber(values.fromLevel, Number.NaN);

	const toLevel = parseWarAcademyNumber(values.toLevel, Number.NaN);

	const isValidSelection = isValidWarAcademySelection({
		rows,
		fromLevel,
		toLevel,
	});

	if (!isValidSelection) {
		throw new Error("Pilih level From dan To yang valid.");
	}

	const selectedRows = getWarAcademyLevelsInRange(rows, fromLevel, toLevel);

	if (selectedRows.length === 0) {
		throw new Error("Tidak ada level War Academy dalam rentang tersebut.");
	}

	const databaseResources = createEmptyWarAcademyDatabaseResources();

	let totalTimeSeconds = 0;

	const selectedLevels: SelectedWarAcademyLevel[] = selectedRows.map((row) => {
		const resources = normalizeWarAcademyDatabaseResources(row.resources);

		const rawTimeSeconds = Math.max(
			0,
			parseWarAcademyNumber(row.raw_time_seconds),
		);

		sumDatabaseResources(databaseResources, resources);

		totalTimeSeconds += rawTimeSeconds;

		return {
			level: row.level,
			resources,
			rawTimeSeconds,
			buff: row.buff ?? "",
		};
	});

	const vpResearchSpeed = getVpResearchSpeed(values.vpLevel);

	const agnesTimeReduction = getAgnesTimeReduction(values.agnesLevel);

	const researchSpeed = Math.max(
		0,
		parseWarAcademyNumber(values.researchSpeed),
	);

	const doubleTimeSpeed = values.doubleTime ? DOUBLE_TIME_RESEARCH_SPEED : 0;

	const totalResearchSpeed = researchSpeed + vpResearchSpeed + doubleTimeSpeed;

	const time = calculateTime({
		totalSeconds: totalTimeSeconds,
		researchSpeed: totalResearchSpeed,
		agnesTimeReduction,
	});

	const buffs = selectedLevels
		.map((item) => item.buff.trim())
		.filter(
			(buff, index, items) => buff.length > 0 && items.indexOf(buff) === index,
		);

	const finalSelectedLevel = selectedLevels[selectedLevels.length - 1];

	return {
		category,
		research: values.research,
		fromLevel,
		toLevel,

		resources: convertResourcesForResult(databaseResources),

		time,

		buff: finalSelectedLevel?.buff ?? "",
		buffs,

		selectedLevels,

		bonuses: {
			vpResearchSpeed,
			agnesTimeReduction,
			researchSpeed,
			doubleTimeSpeed,
			totalResearchSpeed,
		},
	};
}
