"use client";

import {
	BriefcaseBusiness,
	Clock3,
	Gem,
	Sparkles,
	UsersRound,
} from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { CalculationHistoryEntry } from "@/features/inventory/store/history/types";
import { formatDuration } from "@/lib/time";

import type {
	SelectedSkillT12Level,
	SkillT12CalculationResult,
	SkillT12FormValues,
	SkillT12ResultResources,
} from "../type";

type SkillT12HistoryEntry = CalculationHistoryEntry<
	SkillT12FormValues,
	SkillT12CalculationResult
>;

type SkillT12TotalResultProps = {
	items: SkillT12HistoryEntry[];
	title?: string;
};

type SkillT12ResourceKey =
	keyof SkillT12ResultResources;

type AggregatedStatItem = {
	id: string;
	research: string;
	type: string;
	group: string;
	stat: number;
	capacity: number;
};

const EMPTY_RESOURCES: SkillT12ResultResources = {
	Meat: 0,
	Wood: 0,
	Coal: 0,
	Iron: 0,
	Steel: 0,
	RFC: 0,
	Shard: 0,
};

function toFiniteNumber(value: unknown): number {
	const number = Number(value ?? 0);

	return Number.isFinite(number) ? number : 0;
}

function formatSignedValue(
	value: unknown,
	unit = "",
): string {
	const number = toFiniteNumber(value);
	const sign = number < 0 ? "-" : "+";

	return `${sign}${formatNumber(
		Math.abs(number),
	)}${unit}`;
}

function formatStatLabel(value: unknown): string {
	return String(value ?? "")
		.trim()
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.replace(/\b\w/g, (character) =>
			character.toUpperCase(),
		);
}

function formatResearchTime(
	seconds: number,
): string {
	if (seconds <= 0) {
		return "-";
	}

	return formatDuration(seconds);
}

function sumSelectedLevelTime(
	levels: SelectedSkillT12Level[] | undefined,
): number {
	if (!Array.isArray(levels)) {
		return 0;
	}

	return levels.reduce((total, level) => {
		return (
			total +
			toFiniteNumber(
				level.rawTimeSeconds,
			)
		);
	}, 0);
}

function getOriginalTimeSeconds(
	result: SkillT12CalculationResult | undefined,
): number {
	if (!result) {
		return 0;
	}

	const baseSeconds = toFiniteNumber(
		result.time?.baseSeconds,
	);

	if (baseSeconds > 0) {
		return baseSeconds;
	}

	return sumSelectedLevelTime(
		result.selectedLevels,
	);
}

function getReducedTimeSeconds(
	result: SkillT12CalculationResult | undefined,
): number {
	if (!result) {
		return 0;
	}

	const finalSeconds = toFiniteNumber(
		result.time?.finalSeconds,
	);

	if (finalSeconds > 0) {
		return finalSeconds;
	}

	const speedAdjustedSeconds =
		toFiniteNumber(
			result.time?.speedAdjustedSeconds,
		);

	if (speedAdjustedSeconds > 0) {
		return speedAdjustedSeconds;
	}

	return getOriginalTimeSeconds(result);
}

function sumResources(
	items: SkillT12HistoryEntry[],
): SkillT12ResultResources {
	return items.reduce<SkillT12ResultResources>(
		(total, item) => {
			const resources =
				item.result?.resources;

			total.Meat += toFiniteNumber(
				resources?.Meat,
			);

			total.Wood += toFiniteNumber(
				resources?.Wood,
			);

			total.Coal += toFiniteNumber(
				resources?.Coal,
			);

			total.Iron += toFiniteNumber(
				resources?.Iron,
			);

			total.Steel += toFiniteNumber(
				resources?.Steel,
			);

			total.RFC += toFiniteNumber(
				resources?.RFC,
			);

			total.Shard += toFiniteNumber(
				resources?.Shard,
			);

			return total;
		},
		{
			...EMPTY_RESOURCES,
		},
	);
}

function sumPower(
	items: SkillT12HistoryEntry[],
): number {
	return items.reduce((total, item) => {
		return (
			total +
			toFiniteNumber(
				item.result?.power,
			)
		);
	}, 0);
}

function sumOriginalTime(
	items: SkillT12HistoryEntry[],
): number {
	return items.reduce((total, item) => {
		return (
			total +
			getOriginalTimeSeconds(
				item.result,
			)
		);
	}, 0);
}

function sumReducedTime(
	items: SkillT12HistoryEntry[],
): number {
	return items.reduce((total, item) => {
		return (
			total +
			getReducedTimeSeconds(
				item.result,
			)
		);
	}, 0);
}

function aggregateStats(
	items: SkillT12HistoryEntry[],
): AggregatedStatItem[] {
	const statMap = new Map<
		string,
		AggregatedStatItem
	>();

	for (const item of items) {
		const result = item.result;

		if (!result) {
			continue;
		}

		const research =
			result.research ||
			"T12 Skill";

		const type =
			result.type ||
			"Stat Increase";

		const group =
			result.group ||
			"Skill";

		const key = [
			research,
			type,
			group,
		]
			.map((value) =>
				String(value)
					.trim()
					.toLowerCase(),
			)
			.join("::");

		const current =
			statMap.get(key);

		if (current) {
			current.stat +=
				toFiniteNumber(
					result.stat,
				);

			current.capacity +=
				toFiniteNumber(
					result.capacity,
				);

			continue;
		}

		statMap.set(key, {
			id: key,
			research,
			type,
			group,
			stat: toFiniteNumber(
				result.stat,
			),
			capacity:
				toFiniteNumber(
					result.capacity,
				),
		});
	}

	return Array.from(
		statMap.values(),
	);
}

export default function SkillT12TotalResult({
	items,
	title = "Total Calculation",
}: SkillT12TotalResultProps) {
	const warAcademyNavigation =
		NAVIGATION.find(
			(item) =>
				item.id ===
				"war-academy",
		);

	const resources =
		sumResources(items);

	const totalPower =
		sumPower(items);

	const originalTimeSeconds =
		sumOriginalTime(items);

	const reducedTimeSeconds =
		sumReducedTime(items);

	const hasTimeReduction =
		originalTimeSeconds > 0 &&
		reducedTimeSeconds <
			originalTimeSeconds;

	const aggregatedStats =
		aggregateStats(items);

	const { createResourceItem } =
		useCompareResources(resources);

	const resourceValue = (
		key: SkillT12ResourceKey,
	): number => {
		return toFiniteNumber(
			resources[key],
		);
	};

	const timeItems = [
		{
			id: "total-time",
			label: "Total",
			icon: "/icons/totalTime.png",
			value: formatResearchTime(
				originalTimeSeconds,
			),
		},
		{
			id: "reduced-time",
			label: "Reduced",
			icon: "/icons/reducedTime.png",
			value: formatResearchTime(
				reducedTimeSeconds,
			),
			valueClassName: hasTimeReduction
				? "text-green-400"
				: "text-[var(--sl-text-muted)]",
		},
	];

	const statItems =
		aggregatedStats
			.filter(
				(item) =>
					item.stat !== 0,
			)
			.map((item) => ({
				id: `stat-${item.id}`,
				label: `${item.research} · ${formatStatLabel(
					item.type,
				)}`,
				icon: "/icons/Buff.png",
				value:
					formatSignedValue(
						item.stat,
						item.group ===
							"Special Skill"
							? ""
							: "%",
					),
				valueClassName:
					"text-white",
			}));

	const capacityItems =
		aggregatedStats
			.filter(
				(item) =>
					item.capacity !== 0,
			)
			.map((item) => ({
				id: `capacity-${item.id}`,
				label: `${item.research} · Deployment Capacity`,
				icon: "/icons/Buff.png",
				value:
					formatSignedValue(
						item.capacity,
					),
				valueClassName:
					"text-white",
			}));

	const baseResourceItems = [
		...(resourceValue("Meat") > 0
			? [
					createResourceItem(
						"Meat",
					),
				]
			: []),

		...(resourceValue("Wood") > 0
			? [
					createResourceItem(
						"Wood",
					),
				]
			: []),

		...(resourceValue("Coal") > 0
			? [
					createResourceItem(
						"Coal",
					),
				]
			: []),

		...(resourceValue("Iron") > 0
			? [
					createResourceItem(
						"Iron",
					),
				]
			: []),

		...(resourceValue("Steel") > 0
			? [
					createResourceItem(
						"Steel",
					),
				]
			: []),
	];

	const fireCrystalItems = [
		...(resourceValue("RFC") > 0
			? [
					createResourceItem(
						"RFC",
					),
				]
			: []),

		...(resourceValue("Shard") > 0
			? [
					createResourceItem(
						"Shard",
					),
				]
			: []),
	];

	const sections = [
		{
			id: "time",
			title: "Time",
			icon: <Clock3 size={18} />,
			items: timeItems,
		},

		...(statItems.length > 0
			? [
					{
						id: "skill-stats",
						title:
							"Skill Stats",
						icon: (
							<Sparkles
								size={18}
							/>
						),
						items:
							statItems,
					},
				]
			: []),

		...(capacityItems.length > 0
			? [
					{
						id: "deployment",
						title:
							"Deployment",
						icon: (
							<UsersRound
								size={18}
							/>
						),
						items:
							capacityItems,
					},
				]
			: []),

		...(baseResourceItems.length > 0
			? [
					{
						id: "base-resources",
						title:
							"Base Resources",
						icon: (
							<BriefcaseBusiness
								size={18}
							/>
						),
						items:
							baseResourceItems,
					},
				]
			: []),

		...(fireCrystalItems.length > 0
			? [
					{
						id: "fire-crystals",
						title:
							"Fire Crystals",
						icon: (
							<Gem size={18} />
						),
						items:
							fireCrystalItems,
					},
				]
			: []),
	];

	return (
		<CalculatorResult
			title={title}
			categoryTitle="Flame Tech"
			categoryIcon={
				warAcademyNavigation?.icon ??
				"/category/war-academy.png"
			}
			name="T12 Skill Total"
			subtitle={`${items.length} calculation${
				items.length === 1
					? ""
					: "s"
			}`}
			highlightLabel="Total Power Increase"
			highlightValue={formatSignedValue(
				totalPower,
			)}
			sections={sections}
		/>
	);
}