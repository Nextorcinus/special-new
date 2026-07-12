"use client";

import {
	BriefcaseBusiness,
	Clock3,
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
	ResearchCalculationResult,
	ResearchFormValues,
} from "../type";

type ResearchHistoryEntry = CalculationHistoryEntry<
	ResearchFormValues,
	ResearchCalculationResult
>;

type ResearchTotalResultProps = {
	items: ResearchHistoryEntry[];
	title?: string;
};

type ParsedResearchBuff = {
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
	"Crystal",
	"RFC",
];

function sumNumber(
	items: ResearchHistoryEntry[],
	getValue: (item: ResearchHistoryEntry) => unknown,
): number {
	return items.reduce((total, item) => {
		const value = Number(getValue(item) ?? 0);

		if (!Number.isFinite(value)) {
			return total;
		}

		return total + value;
	}, 0);
}

function formatPower(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "+0";
	}

	if (number >= 1_000_000) {
		return `+${(number / 1_000_000).toFixed(2)}M`;
	}

	if (number >= 1_000) {
		return `+${(number / 1_000).toFixed(1)}K`;
	}

	return `+${formatNumber(number)}`;
}

function formatBonus(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number) || number <= 0) {
		return "Off";
	}

	return `+${formatNumber(number)}%`;
}

function formatHours(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number) || number <= 0) {
		return "Off";
	}

	return `-${formatNumber(number)}h`;
}

function parseResearchBuff(
	value: string,
): ParsedResearchBuff | null {
	const normalizedValue = value.trim();

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
	items: ResearchHistoryEntry[],
): string[] {
	const groupedBuffs = new Map<
		string,
		ParsedResearchBuff
	>();

	const unmatchedBuffs = new Set<string>();

	for (const item of items) {
		for (const rawBuff of item.result?.buffs ?? []) {
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

			const existingBuff =
				groupedBuffs.get(groupKey);

			if (existingBuff) {
				existingBuff.value += parsed.value;
				continue;
			}

			groupedBuffs.set(groupKey, {
				...parsed,
			});
		}
	}

	const calculatedBuffs = Array.from(
		groupedBuffs.values(),
	).map((buff) => {
		const formattedValue =
			formatResearchBuffValue(
				buff.value,
				buff.isPercent,
			);

		return buff.label
			? `${formattedValue} ${buff.label}`
			: formattedValue;
	});

	return [
		...calculatedBuffs,
		...Array.from(unmatchedBuffs),
	];
}

function getResearchNames(
	items: ResearchHistoryEntry[],
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

export default function ResearchTotalResult({
	items,
	title = "Total Result",
}: ResearchTotalResultProps) {
	const category = NAVIGATION.find(
		(item) => item.id === "research",
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



	const totalPower = sumNumber(
		items,
		(item) => item.result?.power,
	);

	const totalOriginalTime = sumNumber(
		items,
		(item) => item.result?.time?.total,
	);

	const totalFinalTime = sumNumber(
		items,
		(item) => item.result?.time?.final,
	);

	const totalResearchSpeed = sumNumber(
		items,
		(item) =>
			item.result?.time?.researchSpeed,
	);

	const totalVpBonus = sumNumber(
		items,
		(item) => item.result?.time?.vpBonus,
	);

	const totalPresidentBonus = sumNumber(
		items,
		(item) =>
			item.result?.time?.presidentBonus,
	);

	const totalAgnesHours = sumNumber(
		items,
		(item) => item.result?.time?.agnesHours,
	);


	const buffs = aggregateResearchBuffs(items);
	const researchNames = getResearchNames(items);

	const hasTimeReduction =
		totalOriginalTime !== totalFinalTime;

	const { createResourceItem } =
		useCompareResources(resources);

	const resourceItems = [
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

		...(resources.Crystal > 0
			? [createResourceItem("Crystal")]
			: []),

		...(resources.RFC > 0
			? [createResourceItem("RFC")]
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
			value: formatDuration(totalFinalTime),
			valueClassName: hasTimeReduction
				? "text-green-400"
				: "text-[var(--sl-text-muted)]",
		},
	];

const researchBonusItems = [
	{
		id: "power",
		label: "Power",
		icon: "/icons/power.png",
		value: formatPower(totalPower),
		valueClassName: "text-green-400",
	},
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
				? "whitespace-pre-line text-white"
				: "text-[var(--sl-text-muted)]",
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
			id: "vp-bonus",
			label: "Vice President",
			icon: "/icons/Vice-President.png",
			value: formatBonus(totalVpBonus),
		},
		
		{
			id: "president-bonus",
			label: "President Bonus",
			icon: "/icons/President-Skill.png",
			value: formatBonus(
				totalPresidentBonus,
			),
		},
		{
			id: "agnes-skill",
			label: "Agnes Skill",
			icon: "/icons/Agnes-Skill.png",
			value: formatHours(totalAgnesHours),
		},
	];

	const firstItem = items[0];

	return (
		<CalculatorResult
			title={title}
			categoryTitle={
				category?.title ?? "Research"
			}
			categoryIcon={
				category?.icon ??
				"/category/research.png"
			}
			name={
				researchNames.length === 1
					? researchNames[0]
					: `${items.length} Research Items`
			}
			subtitle={
				researchNames.length > 1
					? researchNames.join(", ")
					: "Combined research calculation"
			}
			highlightLabel="Total Power Increase"
			highlightValue={formatPower(totalPower)}
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
					items: resourceItems,
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