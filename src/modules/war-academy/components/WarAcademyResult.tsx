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

function formatBuffs(values: string[]): string {
	if (!Array.isArray(values) || values.length === 0) {
		return "No Buff";
	}

	return values.join(", ");
}

function formatShard(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "0";
	}

	return formatNumber(number);
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
								value: result.time.reduced,
								valueClassName: hasTimeReduction
									? "text-green-400"
									: "text-[var(--sl-text-muted)]",
							},
							{
								id: "final-time",
								label: "Final",
								icon: "/icons/finalTime.png",
								value: result.time.final,
								valueClassName: hasTimeReduction
									? "text-yellow-500"
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
								value: formatBuffs(result.buffs),
							},
							{
								id: "selected-levels",
								label: "Levels Researched",
								icon: "/category/war-academy.png",
								value: formatNumber(result.selectedLevels?.length ?? 0),
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
