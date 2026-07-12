"use client";

import {
	ArrowRight,
	BriefcaseBusiness,
	Clock3,
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
import { formatDuration } from "@/lib/time";

import type {
	ResearchCalculationResult,
	ResearchFormValues,
} from "../type";

type ResearchHistoryItem = CalculationHistoryItem<
	ResearchFormValues,
	ResearchCalculationResult
>;

type ResearchResultProps = {
	result: ResearchCalculationResult;
	history?: ResearchHistoryItem | null;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
};

function formatPower(value: unknown): string {
	const num = Number(value ?? 0);

	if (!Number.isFinite(num)) {
		return "+0";
	}

	if (num >= 1_000_000) {
		return `+${(num / 1_000_000).toFixed(2)}M`;
	}

	if (num >= 1_000) {
		return `+${(num / 1_000).toFixed(1)}K`;
	}

	return `+${formatNumber(num)}`;
}

function formatBonus(value: unknown): string {
	const num = Number(value ?? 0);

	if (!Number.isFinite(num) || num <= 0) {
		return "Off";
	}

	return `+${formatNumber(num)}%`;
}

function formatAgnes(value: unknown): string {
	const hours = Number(value ?? 0);

	if (!Number.isFinite(hours) || hours <= 0) {
		return "Off";
	}

	return `-${formatNumber(hours)}h`;
}

function formatBuffs(values: string[]): string {
	if (!values.length) {
		return "No Buff";
	}

	return values.join(", ");
}

export default function ResearchResult({
	result,
	history,
	title,
	showAddButton = false,
	onAddItem,
}: ResearchResultProps) {
	const loadResources = useInventoryStore(
		(state) => state.loadResources,
	);

	useEffect(() => {
		loadResources();
	}, [loadResources]);

	const category = NAVIGATION.find(
		(item) => item.id === "research",
	);

const resources = (result?.resources ?? {}) as Partial<
	Record<ResourceKey, number>
>;

	const { createResourceItem } =
		useCompareResources(resources);

	if (!result) {
		return null;
	}

	const hasTimeReduction =
		result.time.total !== result.time.final;

	return (
		<>
			<CalculatorResult
				title={title}
				categoryTitle={
					category?.title ?? "Research"
				}
				categoryIcon={
					category?.icon ??
					"/category/research.png"
				}
				name={result.research ?? "-"}
				subtitle={
					<>
						<span>Tier {result.tier}</span>

						<span className="text-[var(--sl-text-muted)]">
							•
						</span>

						<span>
							Lv.{result.fromLevel ?? "-"}
						</span>

						<ArrowRight className="size-4" />

						<span className="text-yellow-500">
							Lv.{result.toLevel ?? "-"}
						</span>
					</>
				}
				highlightValue={formatPower(result.power)}
				highlightLabel="Power Increase"
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
								value: formatDuration(
									result.time.total,
								),
							},
							{
								id: "reduced-time",
								label: "Reduced",
								icon: "/icons/reducedTime.png",
								value: formatDuration(
									result.time.final,
								),
								valueClassName:
									hasTimeReduction
										? "text-green-400"
										: "text-[var(--sl-text-muted)]",
							},
						],
					},
					{
						id: "resources",
						title: "Base Resources",
						icon: (
							<BriefcaseBusiness
								size={18}
							/>
						),
						items: [
	createResourceItem("Meat"),
	createResourceItem("Wood"),
	createResourceItem("Coal"),
	createResourceItem("Iron"),
	createResourceItem("Steel"),
							
						],
					},
					{
						id: "rewards",
						title: "Research Bonus",
						icon: <Zap size={18} />,
						items: [
							{
								id: "power",
								label: "Power",
								icon: "/icons/power.png",
								value: formatPower(
									result.power,
								),
								valueClassName:
									"text-green-400",
							},
							{
								id: "buff",
								label: "Buff",
								icon: "/icons/Buff.png",
								value: formatBuffs(
									result.buffs,
								),
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
								value: formatBonus(
									result.time
										.researchSpeed,
								),
							},
							{
								id: "vice-president",
								label: "Vice President",
								icon: "/icons/Vice-President.png",
								value: formatBonus(
									result.time.vpBonus,
								),
							},
							{
								id: "president-skill",
								label: "President Skill",
								icon: "/icons/President-Skill.png",
								value: result.time
									.presidentSkill
									? formatBonus(
											result.time
												.presidentBonus,
										)
									: "Off",
							},
							{
								id: "agnes-skill",
								label: "Agnes Skill",
								icon: "/icons/Agnes-Skill.png",
								value: formatAgnes(
									result.time.agnesHours,
								),
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

					<span className="text-base font-medium">
						Add more items
					</span>
				</button>
			)}
		</>
	);
}