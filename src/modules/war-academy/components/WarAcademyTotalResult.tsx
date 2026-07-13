"use client";

import {
	BriefcaseBusiness,
	Clock3,
	Gem,
	Sparkles,
	Zap,
} from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { ResourceKey } from "@/config/resources";
import type { CalculationHistoryEntry } from "@/features/inventory/store/history/types";
import { formatDuration } from "@/lib/time";

import type {
	WarAcademyCalculationResult,
	WarAcademyFormValues,
} from "../type";

type WarAcademyHistoryEntry = CalculationHistoryEntry<
	WarAcademyFormValues,
	WarAcademyCalculationResult
>;

type WarAcademyTotalResultProps = {
	items: WarAcademyHistoryEntry[];
	title?: string;
};

type ParsedWarAcademyBuff = {
	value: number;
	label: string;
	isPercent: boolean;
};

const RESOURCE_KEYS: ResourceKey[] = [
	"Meat",
	"Wood",
	"Coal",
	"Iron",
	"Steel",
	"Shard",
];

function sumNumber(
	items: WarAcademyHistoryEntry[],
	getValue: (item: WarAcademyHistoryEntry) => unknown,
): number {
	return items.reduce((total, item) => {
		const value = Number(getValue(item) ?? 0);

		return Number.isFinite(value)
			? total + value
			: total;
	}, 0);
}

function formatBonus(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number) || number <= 0) {
		return "Off";
	}

	return `+${formatNumber(number)}%`;
}

function formatReduction(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number) || number <= 0) {
		return "Off";
	}

	return `-${formatNumber(number)}%`;
}

function normalizeBuffText(value: string): string {
	return value.trim().replace(/\s+/g, " ");
}

/**
 * Memisahkan beberapa buff dalam satu string tanpa memisahkan
 * koma yang menjadi pemisah ribuan.
 *
 * Contoh:
 * "+1.50% Infantry Health, +3.00% Infantry Health"
 *
 * Tidak memisahkan:
 * "+1,500 Rally Capacity"
 */
function splitWarAcademyBuffs(value: string): string[] {
	return value
		.split(/,\s*(?=[+-]\s*\d)/)
		.map(normalizeBuffText)
		.filter(Boolean);
}

function parseWarAcademyBuff(
	value: string,
): ParsedWarAcademyBuff | null {
	const normalizedValue = normalizeBuffText(value);

	if (!normalizedValue) {
		return null;
	}

	const match = normalizedValue.match(
		/^([+-]?\s*[\d,.]+)\s*(%)?\s*(.*)$/,
	);

	if (!match) {
		return null;
	}

	const numericValue = Number(
		match[1]
			.replace(/\s/g, "")
			.replace(/,/g, ""),
	);

	if (!Number.isFinite(numericValue)) {
		return null;
	}

	return {
		value: numericValue,
		isPercent: Boolean(match[2]),
		label: normalizeBuffText(match[3] ?? ""),
	};
}

function formatWarAcademyBuffValue(
	value: number,
	isPercent: boolean,
): string {
	const formattedValue = Math.abs(value).toLocaleString(
		"en-US",
		{
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		},
	);

	const sign = value < 0 ? "-" : "+";

	return `${sign}${formattedValue}${isPercent ? "%" : ""}`;
}

function getItemBuffs(
	item: WarAcademyHistoryEntry,
): string[] {
	const selectedLevels =
		item.result?.selectedLevels ?? [];

	if (selectedLevels.length > 0) {
		return selectedLevels.flatMap((level) =>
			splitWarAcademyBuffs(level.buff ?? ""),
		);
	}

	return (item.result?.buffs ?? []).flatMap(
		splitWarAcademyBuffs,
	);
}

function aggregateWarAcademyBuffs(
	items: WarAcademyHistoryEntry[],
): string[] {
	const groupedBuffs = new Map<
		string,
		ParsedWarAcademyBuff
	>();

	const unmatchedBuffs = new Map<string, string>();

	for (const item of items) {
		for (const rawBuff of getItemBuffs(item)) {
			const buff = normalizeBuffText(rawBuff);

			if (!buff) {
				continue;
			}

			const parsed = parseWarAcademyBuff(buff);

			if (!parsed) {
				const key = buff.toLowerCase();

				if (!unmatchedBuffs.has(key)) {
					unmatchedBuffs.set(key, buff);
				}

				continue;
			}

			const normalizedLabel = parsed.label
				.toLowerCase()
				.replace(/\s+/g, " ")
				.trim();

			const groupKey = [
				parsed.isPercent ? "percent" : "flat",
				normalizedLabel,
			].join(":");

			const existingBuff =
				groupedBuffs.get(groupKey);

			if (existingBuff) {
				existingBuff.value += parsed.value;
				continue;
			}

			groupedBuffs.set(groupKey, {
				...parsed,
				label: normalizeBuffText(
					parsed.label,
				),
			});
		}
	}

	const calculatedBuffs = Array.from(
		groupedBuffs.values(),
	).map((buff) => {
		const formattedValue =
			formatWarAcademyBuffValue(
				buff.value,
				buff.isPercent,
			);

		return buff.label
			? `${formattedValue} ${buff.label}`
			: formattedValue;
	});

	return [
		...calculatedBuffs,
		...Array.from(unmatchedBuffs.values()),
	];
}

function getResearchNames(
	items: WarAcademyHistoryEntry[],
): string[] {
	return Array.from(
		new Set(
			items
				.map((item) =>
					item.result?.research?.trim(),
				)
				.filter(
					(value): value is string =>
						Boolean(value),
				),
		),
	);
}

function getCategories(
	items: WarAcademyHistoryEntry[],
): string[] {
	return Array.from(
		new Set(
			items
				.map((item) =>
					item.result?.category?.trim(),
				)
				.filter(
					(value): value is string =>
						Boolean(value),
				),
		),
	);
}

export default function WarAcademyTotalResult({
	items,
	title = "Total Result",
}: WarAcademyTotalResultProps) {
	const category = NAVIGATION.find(
		(item) => item.id === "war-academy",
	);

	const resources = RESOURCE_KEYS.reduce(
		(total, key) => {
			total[key] = sumNumber(
				items,
				(item) =>
					item.result?.resources?.[key],
			);

			return total;
		},
		{} as Record<ResourceKey, number>,
	);

	const totalOriginalTime = sumNumber(
		items,
		(item) =>
			item.result?.time?.totalSeconds,
	);

	const totalReducedTime = sumNumber(
		items,
		(item) =>
			item.result?.time?.reducedSeconds,
	);

	const totalFinalTime = sumNumber(
		items,
		(item) =>
			item.result?.time?.finalSeconds,
	);

	const totalResearchSpeed = sumNumber(
		items,
		(item) =>
			item.result?.bonuses?.researchSpeed,
	);

	const totalVpBonus = sumNumber(
		items,
		(item) =>
			item.result?.bonuses
				?.vpResearchSpeed,
	);

	const totalDoubleTimeSpeed = sumNumber(
		items,
		(item) =>
			item.result?.bonuses
				?.doubleTimeSpeed,
	);

	const totalAgnesReduction = sumNumber(
		items,
		(item) =>
			item.result?.bonuses
				?.agnesTimeReduction,
	);

	const totalLevels = sumNumber(
		items,
		(item) =>
			item.result?.selectedLevels?.length,
	);

	const buffs = aggregateWarAcademyBuffs(items);
	const researchNames = getResearchNames(items);
	const categories = getCategories(items);

	const hasTimeReduction =
		totalOriginalTime !== totalFinalTime;

	const { createResourceItem } =
		useCompareResources(resources);

	const baseResourceItems = [
		...(resources.Meat > 0
			? [createResourceItem("Meat")]
			: []),

		...(resources.Wood > 0
			? [createResourceItem("Wood")]
			: []),

		...(resources.Coal > 0
			? [createResourceItem("Coal")]
			: []),

		...(resources.Iron > 0
			? [createResourceItem("Iron")]
			: []),

		...(resources.Steel > 0
			? [createResourceItem("Steel")]
			: []),
	];

	const fireCrystalItems = [
		...(resources.Shard > 0
			? [createResourceItem("Shard")]
			: []),
	];

	const timeItems = [
		{
			id: "total-time",
			label: "Total",
			icon: "/icons/totalTime.png",
			value: formatDuration(totalOriginalTime),
		},
		{
			id: "reduced-time",
			label: "Reduced",
			icon: "/icons/reducedTime.png",
			value: formatDuration(totalReducedTime),
			valueClassName:
				totalReducedTime > 0
					? "text-green-400"
					: "text-[var(--sl-text-muted)]",
		},
		{
			id: "final-time",
			label: "Final",
			icon: "/icons/finalTime.png",
			value: formatDuration(totalFinalTime),
			valueClassName: hasTimeReduction
				? "text-yellow-500"
				: "text-[var(--sl-text-muted)]",
		},
	];

	const researchBonusItems = [
		{
			id: "buff",
			label: "Buff",
			icon: "/icons/Buff.png",
			value:
				buffs.length > 0
					? buffs.join("\n")
					: "No Buff",
			valueClassName:
				buffs.length > 0
					? "text-white"
					: "text-[var(--sl-text-muted)]",
		},
		{
			id: "total-levels",
			label: "Levels Researched",
			icon: "/category/war-academy.png",
			value: formatNumber(totalLevels),
		},
		{
			id: "total-items",
			label: "Research Items",
			icon: "/category/war-academy.png",
			value: formatNumber(items.length),
		},
	];

	const configurationItems = [
		{
			id: "research-speed",
			label: "Research Speed",
			icon: "/category/research.png",
			value: formatBonus(
				totalResearchSpeed,
			),
		},
		{
			id: "vice-president",
			label: "Vice President",
			icon: "/icons/Vice-President.png",
			value: formatBonus(totalVpBonus),
		},
		{
			id: "double-time",
			label: "Double Time",
			icon: "/icons/President-Skill.png",
			value: formatBonus(
				totalDoubleTimeSpeed,
			),
		},
		{
			id: "agnes-skill",
			label: "Agnes Skill",
			icon: "/icons/Agnes-Skill.png",
			value: formatReduction(
				totalAgnesReduction,
			),
		},
	];

	const firstItem = items[0];

	const resultName =
		researchNames.length === 1
			? researchNames[0]
			: `${items.length} War Academy Items`;

	const subtitle =
		researchNames.length > 1
			? researchNames.join(", ")
			: categories.length > 0
				? categories.join(", ")
				: "Combined War Academy calculation";

	return (
		<CalculatorResult
			title={title}
			categoryTitle={
				category?.title ?? "War Academy"
			}
			categoryIcon={
				category?.icon ??
				"/category/war-academy.png"
			}
			name={resultName}
			subtitle={subtitle}
			highlightLabel="Total FC Shards Required"
			highlightValue={formatNumber(
				resources.Shard,
			)}
			createdAt={firstItem?.createdAt}
			sections={[
				{
					id: "time",
					title: "Time",
					icon: <Clock3 size={18} />,
					items: timeItems,
				},
				{
					id: "resources",
					title: "Base Resources",
					icon: (
						<BriefcaseBusiness
							size={18}
						/>
					),
					items: baseResourceItems,
				},
				{
					id: "fire-crystals",
					title: "Fire Crystals",
					icon: <Gem size={18} />,
					items: fireCrystalItems,
				},
				{
					id: "rewards",
					title: "Research Bonus",
					icon: <Zap size={18} />,
					items: researchBonusItems,
				},
				{
					id: "configuration",
					title: "Configuration",
					icon: <Sparkles size={18} />,
					items: configurationItems,
				},
			]}
		/>
	);
}