"use client";

import {
	ArrowRight,
	BriefcaseBusiness,
	Clock3,
	Gem,
	Plus,
	Sparkles,
	UsersRound,
} from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import { formatDuration } from "@/lib/time";

import type {
	SelectedSkillT12Level,
	SkillT12CalculationResult,
} from "../type";

type SkillT12ResultProps = {
	result: SkillT12CalculationResult;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
};

type SkillT12ResourceKey =
	keyof SkillT12CalculationResult["resources"];

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
	result: SkillT12CalculationResult,
): number {
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
	result: SkillT12CalculationResult,
): number {
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

function formatResearchTime(
	seconds: number,
): string {
	if (seconds <= 0) {
		return "-";
	}

	return formatDuration(seconds);
}

export default function SkillT12Result({
	result,
	title,
	showAddButton = false,
	onAddItem,
}: SkillT12ResultProps) {
	const category = NAVIGATION.find(
		(item) => item.id === "war-academy",
	);

	const resources = result.resources ?? {
		Meat: 0,
		Wood: 0,
		Coal: 0,
		Iron: 0,
		Steel: 0,
		RFC: 0,
		Shard: 0,
	};

	const { createResourceItem } =
		useCompareResources(resources);

	const totalPower = toFiniteNumber(
		result.power,
	);

	const originalTimeSeconds =
		getOriginalTimeSeconds(result);

	const reducedTimeSeconds =
		getReducedTimeSeconds(result);

	const hasTimeReduction =
		originalTimeSeconds > 0 &&
		reducedTimeSeconds <
			originalTimeSeconds;

	const stat = toFiniteNumber(
		result.stat,
	);

	const capacity = toFiniteNumber(
		result.capacity,
	);

	const resourceValue = (
		key: SkillT12ResourceKey,
	): number => {
		return toFiniteNumber(resources[key]);
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
		stat !== 0
			? [
					{
						id: "skill-stat",
						label:
							formatStatLabel(
								result.type,
							) ||
							"Stat Increase",
						icon: "/icons/Buff.png",
						value:
							formatSignedValue(
								stat,
								result.group ===
									"Special Skill"
									? ""
									: "%",
							),
						valueClassName:
							"text-white",
					},
				]
			: [];

	const capacityItems =
		capacity !== 0
			? [
					{
						id: "deployment-capacity",
						label:
							"Deployment Capacity",
						icon: "/icons/Buff.png",
						value:
							formatSignedValue(
								capacity,
							),
						valueClassName:
							"text-white",
					},
				]
			: [];

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
						id: "skill-stat",
						title: "Skill Stat",
						icon: (
							<Sparkles
								size={18}
							/>
						),
						items: statItems,
					},
				]
			: []),

		...(capacityItems.length > 0
			? [
					{
						id: "deployment",
						title: "Deployment",
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
		<>
<CalculatorResult
	title={title}
	categoryTitle={
		category?.title ??
		"War Academy"
	}
	categoryIcon={
		category?.icon ??
		"/category/war-academy.png"
	}
	name={
		result.research ||
		"T12 Skill"
	}
	subtitle={
		<>
			<span>{result.category}</span>

			<span>·</span>

			<span>
				Lv.{result.fromLevel}
			</span>

			<ArrowRight className="size-4" />

			<span className="text-yellow-500">
				Lv.{result.toLevel}
			</span>
		</>
	}
	highlightLabel="Power Increase"
	highlightValue={formatSignedValue(
		totalPower,
	)}
	sections={sections}
/>
			{showAddButton && (
				<button
					type="button"
					onClick={onAddItem}
					className="mt-5 flex h-28 w-full flex-col items-center justify-center gap-2 rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-active)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)]"
				>
					<Plus className="size-5" />

					<span className="text-base font-medium">
						Add more items
					</span>
				</button>
			)}
		</>
	);
}