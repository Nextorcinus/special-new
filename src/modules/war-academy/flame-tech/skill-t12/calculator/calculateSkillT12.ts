import type {
	CalculateSkillT12Params,
	SkillT12CalculationResult,
	SkillT12TimeResult,
} from "../type";

import {
	calculateSkillT12CapacityIncrease,
	calculateSkillT12StatIncrease,
	getSkillT12Levels,
	getSkillT12LevelsInRange,
	getSkillT12ResearchOption,
	mapSelectedSkillT12Level,
	parseSkillT12Number,
	sumSkillT12Power,
	sumSkillT12Resources,
	sumSkillT12Time,
} from "./helpers";

const VP_RESEARCH_SPEED_BONUS: Record<string, number> = {
	Off: 0,

	"0": 0,
	"0%": 0,

	"10": 10,
	"10%": 10,
	"+10%": 10,

	"15": 15,
	"15%": 15,
	"+15%": 15,

	"20": 20,
	"20%": 20,
	"+20%": 20,

	"25": 25,
	"25%": 25,
	"+25%": 25,
};

const AGNES_REDUCTION_HOURS: Record<string, number> = {
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

	"Level 1": 2,
	"Level 2": 4,
	"Level 3": 6,
	"Level 4": 8,
	"Level 5": 10,

	"Level 1 (-2h)": 2,
	"Level 2 (-4h)": 4,
	"Level 3 (-6h)": 6,
	"Level 4 (-8h)": 8,
	"Level 5 (-10h)": 10,
};

const PRESIDENT_RESEARCH_SPEED_BONUS = 10;

function normalizeText(value: unknown): string {
	return String(value ?? "").trim();
}

function getVpBonus(value: unknown): number {
	const normalizedValue = normalizeText(value);

	if (!normalizedValue) {
		return 0;
	}

	if (
		normalizedValue in
		VP_RESEARCH_SPEED_BONUS
	) {
		return (
			VP_RESEARCH_SPEED_BONUS[
				normalizedValue
			] ?? 0
		);
	}

	return Math.max(
		0,
		parseSkillT12Number(
			normalizedValue,
		),
	);
}

function getAgnesReductionHours(
	value: unknown,
): number {
	const normalizedValue =
		normalizeText(value);

	if (!normalizedValue) {
		return 0;
	}

	return (
		AGNES_REDUCTION_HOURS[
			normalizedValue
		] ?? 0
	);
}

function calculateTime(params: {
	baseSeconds: number;
	researchSpeed: number;
	vpBonus: number;
	presidentSkill: boolean;
	agnesHours: number;
}): SkillT12TimeResult {
	const presidentBonus =
		params.presidentSkill
			? PRESIDENT_RESEARCH_SPEED_BONUS
			: 0;

	const totalSpeedBonus =
		params.researchSpeed +
		params.vpBonus +
		presidentBonus;

	const speedMultiplier =
		1 + totalSpeedBonus / 100;

	const speedAdjustedSeconds =
		Math.max(
			0,
			Math.ceil(
				params.baseSeconds /
					(
						speedMultiplier > 0
							? speedMultiplier
							: 1
					),
			),
		);

	const agnesReductionSeconds =
		Math.max(
			0,
			params.agnesHours * 3_600,
		);

	const finalSeconds =
		Math.max(
			0,
			speedAdjustedSeconds -
				agnesReductionSeconds,
		);

	return {
		baseSeconds:
			params.baseSeconds,

		speedAdjustedSeconds,

		agnesReductionSeconds,

		finalSeconds,

		researchSpeed:
			params.researchSpeed,

		vpBonus:
			params.vpBonus,

		presidentBonus,

		totalSpeedBonus,
	};
}

export function calculateSkillT12({
	data,
	values,
}: CalculateSkillT12Params): SkillT12CalculationResult {
	const option =
		getSkillT12ResearchOption(
			data,
			values.category,
			values.research,
		);

	if (!option) {
		throw new Error(
			"The selected T12 skill could not be found.",
		);
	}

	const allLevels =
		getSkillT12Levels(
			data,
			option.template,
		);

	const selectedRawLevels =
		getSkillT12LevelsInRange(
			allLevels,
			values.fromLevel,
			values.toLevel,
		);

	if (
		selectedRawLevels.length === 0
	) {
		throw new Error(
			"No T12 skill levels were found for the selected range.",
		);
	}

	const selectedLevels =
		selectedRawLevels.map(
			mapSelectedSkillT12Level,
		);

	const fromLevel =
		parseSkillT12Number(
			values.fromLevel,
		);

	const toLevel =
		parseSkillT12Number(
			values.toLevel,
		);

	const baseSeconds =
		sumSkillT12Time(
			selectedLevels,
		);

	const researchSpeed =
		Math.max(
			0,
			parseSkillT12Number(
				values.researchSpeed,
			),
		);

	const vpBonus =
		Math.max(
			0,
			getVpBonus(
				values.vpLevel,
			),
		);

	const agnesHours =
		Math.max(
			0,
			getAgnesReductionHours(
				values.agnesLevel,
			),
		);

	const time =
		calculateTime({
			baseSeconds,

			researchSpeed,

			vpBonus,

			presidentSkill:
				Boolean(
					values.presidentSkill,
				),

			agnesHours,
		});

	return {
		category:
			values.category,

		research:
			option.name,

		group:
			option.group,

		type:
			option.type,

		fromLevel,

		toLevel,

		resources:
			sumSkillT12Resources(
				selectedLevels,
			),

		power:
			sumSkillT12Power(
				selectedLevels,
			),

		stat:
			calculateSkillT12StatIncrease(
				allLevels,
				fromLevel,
				toLevel,
			),

		capacity:
			calculateSkillT12CapacityIncrease(
				allLevels,
				fromLevel,
				toLevel,
			),

		time,

		selectedLevels,
	};
}

export default calculateSkillT12;