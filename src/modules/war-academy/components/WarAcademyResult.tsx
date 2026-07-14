"use client";

import {
	ArrowRight,
	BriefcaseBusiness,
	Clock3,
	Gem,
	Plus,
	Sparkles,
	Zap,
} from "lucide-react";
import { useEffect } from "react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { ResourceKey } from "@/config/resources";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";
import { useInventoryStore } from "@/features/inventory/store/inventory.store";

import type {
	WarAcademyCalculationResult,
	WarAcademyFormValues,
} from "../type";

type WarAcademyHistoryItem = CalculationHistoryItem<
	WarAcademyFormValues,
	WarAcademyCalculationResult
>;

type WarAcademyResultProps = {
	result: WarAcademyCalculationResult;
	history?: WarAcademyHistoryItem | null;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
};

type ParsedWarAcademyBuff = {
	value: number;
	label: string;
	isPercent: boolean;
};

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

function formatShard(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "0";
	}

	return formatNumber(number);
}

function normalizeBuffText(value: string): string {
	return value.trim().replace(/\s+/g, " ");
}

function splitWarAcademyBuffs(value: string): string[] {
	return value
		.split(/,\s*(?=[+-]\s*\d)/)
		.map((buff) => normalizeBuffText(buff))
		.filter(Boolean);
}

function parseWarAcademyBuff(value: string): ParsedWarAcademyBuff | null {
	const normalizedValue = normalizeBuffText(value);

	if (!normalizedValue) {
		return null;
	}

	const match = normalizedValue.match(/^([+-]?\s*[\d,.]+)\s*(%)?\s*(.*)$/);

	if (!match) {
		return null;
	}

	const numericValue = Number(match[1].replace(/\s/g, "").replace(/,/g, ""));

	if (!Number.isFinite(numericValue)) {
		return null;
	}

	return {
		value: numericValue,
		isPercent: Boolean(match[2]),
		label: normalizeBuffText(match[3] ?? ""),
	};
}

function formatWarAcademyBuffValue(value: number, isPercent: boolean): string {
	const formattedValue = Math.abs(value).toLocaleString("en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});

	const sign = value < 0 ? "-" : "+";

	return `${sign}${formattedValue}${isPercent ? "%" : ""}`;
}

function getResultBuffs(result: WarAcademyCalculationResult): string[] {
	const selectedLevels = result.selectedLevels ?? [];

	if (selectedLevels.length > 0) {
		return selectedLevels.flatMap((level) =>
			splitWarAcademyBuffs(level.buff ?? ""),
		);
	}

	return (result.buffs ?? []).flatMap((buff) => splitWarAcademyBuffs(buff));
}

function aggregateResultBuffs(result: WarAcademyCalculationResult): string[] {
	const groupedBuffs = new Map<string, ParsedWarAcademyBuff>();

	const unmatchedBuffs = new Map<string, string>();

	for (const rawBuff of getResultBuffs(result)) {
		const buff = normalizeBuffText(rawBuff);

		if (!buff) {
			continue;
		}

		const parsed = parseWarAcademyBuff(buff);

		if (!parsed) {
			const unmatchedKey = buff.toLowerCase();

			if (!unmatchedBuffs.has(unmatchedKey)) {
				unmatchedBuffs.set(unmatchedKey, buff);
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

		const existingBuff = groupedBuffs.get(groupKey);

		if (existingBuff) {
			existingBuff.value += parsed.value;
			continue;
		}

		groupedBuffs.set(groupKey, {
			...parsed,
			label: normalizeBuffText(parsed.label),
		});
	}

	const calculatedBuffs = Array.from(groupedBuffs.values()).map((buff) => {
		const formattedValue = formatWarAcademyBuffValue(
			buff.value,
			buff.isPercent,
		);

		return buff.label ? `${formattedValue} ${buff.label}` : formattedValue;
	});

	return [...calculatedBuffs, ...Array.from(unmatchedBuffs.values())];
}

function formatBuffs(result: WarAcademyCalculationResult): string {
	const buffs = aggregateResultBuffs(result);

	if (buffs.length === 0) {
		return "No Buff";
	}

	return buffs.join("\n");
}

export default function WarAcademyResult({
	result,
	history,
	title,
	showAddButton = false,
	onAddItem,
}: WarAcademyResultProps) {
	const loadResources = useInventoryStore((state) => state.loadResources);

	useEffect(() => {
		loadResources();
	}, [loadResources]);

	const category = NAVIGATION.find((item) => item.id === "war-academy");

	const resources = (result.resources ?? {}) as Partial<
		Record<ResourceKey, number>
	>;

	const { createResourceItem } = useCompareResources(resources);

	const hasTimeReduction =
		result.time.totalSeconds !== result.time.finalSeconds;

	const shardRequired = Number(result.resources?.Shard ?? 0);

	const aggregatedBuffs = aggregateResultBuffs(result);

	return (
		<>
			<CalculatorResult
				title={title}
				categoryTitle={category?.title ?? "War Academy"}
				categoryIcon={category?.icon ?? "/category/war-academy.png"}
				name={result.research ?? "-"}
				subtitle={
					<>
						<span>{result.category}</span>

						<span className="text-[var(--sl-text-muted)]">•</span>

						<span>Lv.{result.fromLevel ?? "-"}</span>

						<ArrowRight className="size-4" />

						<span className="text-yellow-500">Lv.{result.toLevel ?? "-"}</span>
					</>
				}
				highlightValue={formatShard(shardRequired)}
				highlightLabel="FC Shards Required"
				createdAt={history?.createdAt}
				updatedAt={history?.updatedAt}
				sections={[
					{
						id: "time",
						title: "Time",
						icon: <Clock3 size={18} />,
						items: [
							{
								id: "total-time",
								label: "Total",
								icon: "/icons/totalTime.png",
								value: result.time.total,
							},
							{
								id: "reduced-time",
								label: "Reduced",
								icon: "/icons/reducedTime.png",
								value: result.time.final,
								valueClassName: hasTimeReduction
									? "text-green-400"
									: "text-[var(--sl-text-muted)]",
							},
						],
					},
					{
						id: "resources",
						title: "Base Resources",
						icon: <BriefcaseBusiness size={18} />,
						items: [
							createResourceItem("Meat"),
							createResourceItem("Wood"),
							createResourceItem("Coal"),
							createResourceItem("Iron"),
							createResourceItem("Steel"),
						],
					},
					{
						id: "fire-crystals",
						title: "Fire Crystals",
						icon: <Gem size={18} />,
						items: [createResourceItem("Shard")],
					},
					{
						id: "rewards",
						title: "Research Bonus",
						icon: <Zap size={18} />,
						items: [
							{
								id: "buff",
								label: "Buff",
								icon: "/icons/Buff.png",
								value: formatBuffs(result),
								valueClassName:
									aggregatedBuffs.length > 0
										? "text-white"
										: "text-[var(--sl-text-muted)]",
							},
						],
					},
					{
						id: "configuration",
						title: "Configuration",
						icon: <Sparkles size={18} />,
						items: [
							{
								id: "research-speed",
								label: "Research Speed",
								icon: "/category/research.png",
								value: formatBonus(result.bonuses.researchSpeed),
							},
							{
								id: "vice-president",
								label: "Vice President",
								icon: "/icons/Vice-President.png",
								value: formatBonus(result.bonuses.vpResearchSpeed),
							},
							{
								id: "double-time",
								label: "Double Time",
								icon: "/icons/President-Skill.png",
								value: formatBonus(result.bonuses.doubleTimeSpeed),
							},
							{
								id: "agnes-skill",
								label: "Agnes Skill",
								icon: "/icons/Agnes-Skill.png",
								value: formatReduction(result.bonuses.agnesTimeReduction),
							},
							{
								id: "total-research-speed",
								label: "Total Research Speed",
								icon: "/category/war-academy.png",
								value: formatBonus(result.bonuses.totalResearchSpeed),
							},
						],
					},
				]}
			/>

			{showAddButton && (
				<button
					type="button"
					onClick={onAddItem}
					className="mt-5 flex h-28 w-full flex-col items-center justify-center gap-2 rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-active)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)]"
				>
					<Plus className="size-5" />

					<span className="text-base font-medium">Add more items</span>
				</button>
			)}
		</>
	);
}
