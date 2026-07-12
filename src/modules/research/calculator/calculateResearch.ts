import type {
	CalculateResearchParams,
	ResearchCalculationResult,
	ResearchResources,
	ResearchResultResources,
	SelectedResearchLevel,
} from "../type";
import {
	getResearchLevelsInRange,
	isValidResearchSelection,
	normalizeResearchResourceKey,
	parseResearchNumber,
} from "./helpers";

const VP_RESEARCH_SPEED_BONUS: Record<string, number> = {
	Off: 0,
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

type ParsedResearchBuff = {
	value: number;
	label: string;
	isPercent: boolean;
};

function getVpResearchBonus(value: string): number {
	if (!value || value === "Off") {
		return 0;
	}

	if (value in VP_RESEARCH_SPEED_BONUS) {
		return VP_RESEARCH_SPEED_BONUS[value] ?? 0;
	}

	return parseResearchNumber(value);
}

function getAgnesHours(value: string): number {
	if (!value || value === "Off") {
		return 0;
	}

	if (value in AGNES_RESEARCH_TIME_REDUCTION) {
		return AGNES_RESEARCH_TIME_REDUCTION[value] ?? 0;
	}

	return 0;
}

function parseResearchBuff(
	buff: string,
): ParsedResearchBuff | null {
	const normalized = buff.trim();

	if (!normalized) {
		return null;
	}

	const match = normalized.match(
		/^([+-]?\s*[\d,.]+)\s*(%)?\s*(.*)$/,
	);

	if (!match) {
		return null;
	}

	const rawValue = match[1]
		.replace(/\s/g, "")
		.replace(/,/g, "");

	const value = Number(rawValue);

	if (!Number.isFinite(value)) {
		return null;
	}

	return {
		value,
		isPercent: Boolean(match[2]),
		label: match[3]?.trim() ?? "",
	};
}

function formatResearchBuffValue(
	value: number,
	isPercent: boolean,
): string {
	const formattedValue = value.toLocaleString("en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});

	return `+${formattedValue}${isPercent ? "%" : ""}`;
}

function aggregateResearchBuffs(
	buffs: string[],
): string[] {
	const groupedBuffs = new Map<
		string,
		ParsedResearchBuff
	>();

	const unmatchedBuffs = new Set<string>();

	for (const rawBuff of buffs) {
		const buff = rawBuff.trim();

		if (!buff) {
			continue;
		}

		const parsed = parseResearchBuff(buff);

		if (!parsed) {
			unmatchedBuffs.add(buff);
			continue;
		}

		const groupKey = [
			parsed.isPercent ? "percent" : "flat",
			parsed.label.toLowerCase(),
		].join(":");

		const existingBuff = groupedBuffs.get(groupKey);

		if (existingBuff) {
			existingBuff.value += parsed.value;
			continue;
		}

		groupedBuffs.set(groupKey, {
			...parsed,
		});
	}

	const aggregatedBuffs = Array.from(
		groupedBuffs.values(),
	).map((buff) => {
		const value = formatResearchBuffValue(
			buff.value,
			buff.isPercent,
		);

		return buff.label
			? `${value} ${buff.label}`
			: value;
	});

	return [
		...aggregatedBuffs,
		...Array.from(unmatchedBuffs),
	];
}

function addResearchResources(
	target: ResearchResultResources,
	resources: ResearchResources,
): void {
	for (const [rawResourceKey, rawValue] of Object.entries(resources)) {
		const resourceValue = Number(rawValue ?? 0);

		if (!Number.isFinite(resourceValue) || resourceValue === 0) {
			continue;
		}

		const resourceKey =
			normalizeResearchResourceKey(rawResourceKey);

		switch (resourceKey) {
			case "Meat":
				target.Meat =
					Number(target.Meat ?? 0) + resourceValue;
				break;

			case "Wood":
				target.Wood =
					Number(target.Wood ?? 0) + resourceValue;
				break;

			case "Coal":
				target.Coal =
					Number(target.Coal ?? 0) + resourceValue;
				break;

			case "Iron":
				target.Iron =
					Number(target.Iron ?? 0) + resourceValue;
				break;

			case "Steel":
				target.Steel =
					Number(target.Steel ?? 0) + resourceValue;
				break;

			case "Crystal":
				target.Crystal =
					Number(target.Crystal ?? 0) + resourceValue;
				break;

			case "RFC":
				target.RFC =
					Number(target.RFC ?? 0) + resourceValue;
				break;

			default:
				break;
		}
	}
}

function createSelectedResearchLevel(params: {
	category: string;
	research: string;
	tier: string;
	level: number;
	prerequisites: string;
	power: number;
	buff: string;
	rawTimeSeconds: number;
	resources: ResearchResources;
}): SelectedResearchLevel {
	return {
		category: params.category,
		research: params.research,
		tier: params.tier,
		level: params.level,
		prerequisites: params.prerequisites,
		power: params.power,
		buff: params.buff,
		rawTimeSeconds: params.rawTimeSeconds,
		resources: params.resources,
	};
}

function calculateResearchTime(params: {
	totalSeconds: number;
	researchSpeed: number;
	vpBonus: number;
	presidentSkill: boolean;
	agnesHours: number;
}) {
	const {
		totalSeconds,
		researchSpeed,
		vpBonus,
		presidentSkill,
		agnesHours,
	} = params;

	const presidentBonus = presidentSkill
		? PRESIDENT_RESEARCH_SPEED_BONUS
		: 0;

	const totalSpeedBonus =
		researchSpeed +
		vpBonus +
		presidentBonus;

	const speedMultiplier =
		1 + totalSpeedBonus / 100;

	const speedAdjustedSeconds =
		speedMultiplier > 0
			? totalSeconds / speedMultiplier
			: totalSeconds;

	const agnesSeconds = agnesHours * 3600;

	const finalSeconds = Math.max(
		0,
		Math.ceil(
			speedAdjustedSeconds - agnesSeconds,
		),
	);

	const reducedSeconds = Math.max(
		0,
		totalSeconds - finalSeconds,
	);

	return {
		total: totalSeconds,
		reduced: reducedSeconds,
		final: finalSeconds,

		totalSpeedBonus,
		researchSpeed,
		vpBonus,
		presidentBonus,

		agnesHours,
		agnesSeconds,

		presidentSkill,
	};
}

export function calculateResearch({
	data,
	values,
}: CalculateResearchParams): ResearchCalculationResult {
	const {
		category,
		research,
		tier,
		fromLevel,
		toLevel,
		researchSpeed,
		vpLevel,
		agnesLevel,
		presidentSkill,
	} = values;

	const isSelectionValid =
		isValidResearchSelection({
			data,
			category,
			research,
			tier,
			fromLevel,
			toLevel,
		});

	if (!isSelectionValid) {
		throw new Error(
			"Please select a valid research, tier, from level, and to level.",
		);
	}

	const selectedEntries =
		getResearchLevelsInRange(
			data,
			category,
			research,
			tier,
			fromLevel,
			toLevel,
		);

	if (selectedEntries.length === 0) {
		throw new Error(
			"No research levels were found for the selected range.",
		);
	}

	const resources: ResearchResultResources = {};

	let totalPower = 0;
	let totalTimeSeconds = 0;

	const selectedLevels: SelectedResearchLevel[] =
		selectedEntries.map((entry) => {
			const power = Number(entry.power ?? 0);

			const rawTimeSeconds = Number(
				entry.raw_time_seconds ?? 0,
			);

			if (Number.isFinite(power)) {
				totalPower += power;
			}

			if (Number.isFinite(rawTimeSeconds)) {
				totalTimeSeconds += rawTimeSeconds;
			}

			addResearchResources(
				resources,
				entry.resources,
			);

			return createSelectedResearchLevel({
				category,
				research,
				tier,
				level: Number(entry.level),
				prerequisites:
					entry.prerequisites ?? "",
				power: Number.isFinite(power)
					? power
					: 0,
				buff: entry.buff ?? "",
				rawTimeSeconds:
					Number.isFinite(rawTimeSeconds)
						? rawTimeSeconds
						: 0,
				resources: entry.resources,
			});
		});

	const parsedResearchSpeed = Math.max(
		0,
		parseResearchNumber(researchSpeed),
	);

	const vpBonus = Math.max(
		0,
		getVpResearchBonus(vpLevel),
	);

	const agnesHours = Math.max(
		0,
		getAgnesHours(agnesLevel),
	);

	const time = calculateResearchTime({
		totalSeconds: totalTimeSeconds,
		researchSpeed: parsedResearchSpeed,
		vpBonus,
		presidentSkill,
		agnesHours,
	});

	const buffs = aggregateResearchBuffs(
		selectedEntries.map(
			(entry) => entry.buff ?? "",
		),
	);

	const lastSelectedEntry =
		selectedEntries[selectedEntries.length - 1];

	return {
		category,
		research,
		tier,
		fromLevel: Number(fromLevel),
		toLevel: Number(toLevel),

		resources,

		power: totalPower,

		buffs,

		prerequisites:
			lastSelectedEntry?.prerequisites ?? "",

		time,

		selectedLevels,
	};
}

export default calculateResearch;