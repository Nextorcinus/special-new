import {
	formatDuration,
	parseDurationToSeconds,
} from "@/lib/time";

import type {
	SelectedSkillT12Level,
	SkillT12Category,
	SkillT12Database,
	SkillT12FormValues,
	SkillT12Level,
	SkillT12ResearchOption,
	SkillT12ResultResources,
	SkillT12TemplateKey,
	SkillT12Unit,
} from "../type";

const CATEGORY_UNIT_MAP: Record<
	SkillT12Category,
	SkillT12Unit
> = {
	"Exalted Infantry": "Infantry",
	"Exalted Lancer": "Lancer",
	"Exalted Marksman": "Marksman",
};

export function parseSkillT12Number(
	value: unknown,
): number {
	const number = Number(value ?? 0);

	return Number.isFinite(number) ? number : 0;
}

function normalizeValue(value: unknown): string {
	return String(value ?? "")
		.trim()
		.toLowerCase();
}

export function getSkillT12Unit(
	category: SkillT12Category,
): SkillT12Unit {
	return CATEGORY_UNIT_MAP[category];
}

export function getSkillT12ResearchOptions(
	data: SkillT12Database | undefined,
	category: SkillT12Category,
): SkillT12ResearchOption[] {
	if (!data?.skills || !data?.tables) {
		return [];
	}

	const unit = getSkillT12Unit(category);

	const options: SkillT12ResearchOption[] = [];

	const regularGroups = [
		"Skill 1",
		"Skill 2",
		"Skill 3",
	] as const;

	for (const group of regularGroups) {
		const definition = data.skills[group];

		if (!definition) {
			continue;
		}

		const unitSkills =
			definition.units?.[unit] ?? [];

		for (const skill of unitSkills) {
			options.push({
				name: skill.name,
				group,
				template: definition.template,
				type: skill.type,
				maxLevel: definition.maxLevel,
			});
		}
	}

	const specialDefinition =
		data.skills["Special Skill"]?.units?.[unit];

	if (specialDefinition) {
		const specialLevels =
			data.tables[
				specialDefinition.template
			] ?? [];

		options.push({
			name: specialDefinition.name,
			group: "Special Skill",
			template:
				specialDefinition.template,
			type: specialDefinition.type,
			maxLevel: specialLevels.length,
		});
	}

	const solarDefinition =
		data.skills["Solar Supremacy"];

	if (solarDefinition) {
		options.push({
			name: "Solar Supremacy",
			group: "Solar Supremacy",
			template:
				solarDefinition.template,
			type: solarDefinition.type,
			maxLevel:
				solarDefinition.maxLevel,
		});
	}

	return options;
}

export function getSkillT12ResearchOption(
	data: SkillT12Database,
	category: SkillT12Category,
	research: string,
): SkillT12ResearchOption | null {
	const normalizedResearch =
		normalizeValue(research);

	if (!normalizedResearch) {
		return null;
	}

	return (
		getSkillT12ResearchOptions(
			data,
			category,
		).find(
			(option) =>
				normalizeValue(option.name) ===
				normalizedResearch,
		) ?? null
	);
}

export function getSkillT12Levels(
	data: SkillT12Database,
	template: SkillT12TemplateKey,
): SkillT12Level[] {
	return data.tables[template] ?? [];
}

export function getSkillT12LevelsInRange(
	levels: SkillT12Level[],
	fromLevel: string | number,
	toLevel: string | number,
): SkillT12Level[] {
	const from =
		parseSkillT12Number(fromLevel);

	const to =
		parseSkillT12Number(toLevel);

	if (to <= from) {
		return [];
	}

	return levels.filter((level) => {
		const currentLevel =
			parseSkillT12Number(
				level.level,
			);

		return (
			currentLevel > from &&
			currentLevel <= to
		);
	});
}

export function isValidSkillT12Selection(
	data: SkillT12Database,
	values: SkillT12FormValues,
): boolean {
	const fromLevel =
		parseSkillT12Number(
			values.fromLevel,
		);

	const toLevel =
		parseSkillT12Number(
			values.toLevel,
		);

	if (
		!values.category ||
		!values.research
	) {
		return false;
	}

	if (
		fromLevel < 0 ||
		toLevel <= fromLevel
	) {
		return false;
	}

	const option =
		getSkillT12ResearchOption(
			data,
			values.category,
			values.research,
		);

	if (!option) {
		return false;
	}

	return toLevel <= option.maxLevel;
}

function mapSkillT12Resources(
	level: SkillT12Level,
): SkillT12ResultResources {
	return {
		Meat:
			parseSkillT12Number(
				level.Meat,
			),

		Wood:
			parseSkillT12Number(
				level.Wood,
			),

		Coal:
			parseSkillT12Number(
				level.Coal,
			),

		Iron:
			parseSkillT12Number(
				level.Iron,
			),

		Steel:
			parseSkillT12Number(
				level.Steel,
			),

		RFC:
			parseSkillT12Number(
				level.RFC,
			),

		Shard:
			parseSkillT12Number(
				level["FC Shards"],
			),
	};
}

function parseSkillT12Duration(value: unknown): number {
	if (typeof value === "number") {
		return Number.isFinite(value)
			? Math.max(0, value)
			: 0;
	}

	const text = String(value ?? "").trim();

	if (!text) {
		return 0;
	}

	/**
	 * Mendukung format:
	 * HH:MM:SS
	 * MM:SS
	 *
	 * Contoh:
	 * 11:00:00 = 11 jam
	 * 01:30:00 = 1 jam 30 menit
	 */
	if (text.includes(":")) {
		const parts = text
			.split(":")
			.map((part) => Number(part));

		if (
			parts.some(
				(part) => !Number.isFinite(part),
			)
		) {
			return 0;
		}

		if (parts.length === 3) {
			const [hours, minutes, seconds] =
				parts;

			return Math.max(
				0,
				hours * 3_600 +
					minutes * 60 +
					seconds,
			);
		}

		if (parts.length === 2) {
			const [minutes, seconds] =
				parts;

			return Math.max(
				0,
				minutes * 60 + seconds,
			);
		}
	}

	return parseDurationToSeconds(text);
}

export function mapSelectedSkillT12Level(
	level: SkillT12Level,
): SelectedSkillT12Level {
	const rawTimeSeconds =
		parseSkillT12Duration(level.time);

	return {
		level: parseSkillT12Number(
			level.level,
		),

		resources:
			mapSkillT12Resources(level),

		rawTimeSeconds,

		time: formatDuration(
			rawTimeSeconds,
		),

		power: parseSkillT12Number(
			level.power,
		),

		stat: parseSkillT12Number(
			level.stat,
		),

		capacity:
			parseSkillT12Number(
				level.capacity,
			),
	};
}

export function sumSkillT12Resources(
	levels: SelectedSkillT12Level[],
): SkillT12ResultResources {
	return levels.reduce<SkillT12ResultResources>(
		(total, level) => {
			total.Meat +=
				level.resources.Meat;

			total.Wood +=
				level.resources.Wood;

			total.Coal +=
				level.resources.Coal;

			total.Iron +=
				level.resources.Iron;

			total.Steel +=
				level.resources.Steel;

			total.RFC +=
				level.resources.RFC;

			total.Shard +=
				level.resources.Shard;

			return total;
		},
		{
			Meat: 0,
			Wood: 0,
			Coal: 0,
			Iron: 0,
			Steel: 0,
			RFC: 0,
			Shard: 0,
		},
	);
}

export function sumSkillT12Time(
	levels: SelectedSkillT12Level[],
): number {
	return levels.reduce(
		(total, level) =>
			total +
			level.rawTimeSeconds,
		0,
	);
}

export function sumSkillT12Power(
	levels: SelectedSkillT12Level[],
): number {
	return levels.reduce(
		(total, level) =>
			total + level.power,
		0,
	);
}

export function calculateSkillT12StatIncrease(
	levels: SkillT12Level[],
	fromLevel: number,
	toLevel: number,
): number {
	const fromLevelData =
		levels.find(
			(level) =>
				parseSkillT12Number(
					level.level,
				) === fromLevel,
		);

	const toLevelData =
		levels.find(
			(level) =>
				parseSkillT12Number(
					level.level,
				) === toLevel,
		);

	const fromStat =
		parseSkillT12Number(
			fromLevelData?.stat,
		);

	const toStat =
		parseSkillT12Number(
			toLevelData?.stat,
		);

	return Math.max(
		0,
		toStat - fromStat,
	);
}

export function calculateSkillT12CapacityIncrease(
	levels: SkillT12Level[],
	fromLevel: number,
	toLevel: number,
): number {
	const fromLevelData =
		levels.find(
			(level) =>
				parseSkillT12Number(
					level.level,
				) === fromLevel,
		);

	const toLevelData =
		levels.find(
			(level) =>
				parseSkillT12Number(
					level.level,
				) === toLevel,
		);

	const fromCapacity =
		parseSkillT12Number(
			fromLevelData?.capacity,
		);

	const toCapacity =
		parseSkillT12Number(
			toLevelData?.capacity,
		);

	return Math.max(
		0,
		toCapacity - fromCapacity,
	);
}