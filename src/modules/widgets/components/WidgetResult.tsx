"use client";

import { Plus } from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import { formatNumber } from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";

import type { WidgetCalculationResult, WidgetFormValues } from "../type";

type WidgetHistoryItem = CalculationHistoryItem<
	WidgetFormValues,
	WidgetCalculationResult
>;

type WidgetResultProps = {
	result: WidgetCalculationResult;
	history?: WidgetHistoryItem | null;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
};

function formatPercent(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "0%";
	}

	return `${number.toLocaleString("en-US", {
		maximumFractionDigits: 2,
	})}%`;
}

function formatLevel(level: unknown): string {
	const number = Number(level ?? 0);

	return `Lv.${Number.isFinite(number) ? number : 0}`;
}

function formatStatus(
	status?: WidgetCalculationResult["status"],
): string | undefined {
	if (status === "next-update") {
		return "Next Update";
	}

	if (status === "new") {
		return "New";
	}

	return undefined;
}

export default function WidgetResult({
	result,
	history,
	title = "Widget Result",
	showAddButton = false,
	onAddItem,
}: WidgetResultProps) {
	const category = NAVIGATION.find(
		(item) => item.id === "widget" || item.id === "widgets",
	);

	const widgetStone = Number(result.resources?.WidgetStone ?? 0);

	const status = formatStatus(result.status);

	const skillType =
		result.type === "exploration" ? "Exploration" : "Expedition";

	const sections = [
		{
			id: "required-resources",
			title: "Required Resources",
			items: [
				{
					id: "widget-stone",
					label: "Widget Stone",
					icon: "/icons/widget-stone.png",
					value: formatNumber(widgetStone),
				},
			],
		},
		{
			id: "widget-upgrade",
			title: "Widget Upgrade",
			items: [
				{
					id: "level-range",
					label: "Level",
					icon: "/icons/level.png",
					value: `${formatLevel(
						result.fromLevel,
					)} → ${formatLevel(result.toLevel)}`,
				},
				{
					id: "skill-type",
					label: "Skill Type",
					icon:
						result.type === "exploration"
							? "/icons/exploration.png"
							: "/icons/expedition.png",
					value: skillType,
				},
				{
					id: "widget-value",
					label: "Widget Bonus",
					icon: "/icons/widget.png",
					value: formatPercent(result.value),
				},
			],
		},
		{
			id: "widget-skill",
			title: "Unlocked Skill",
			items: [
				{
					id: "skill",
					label: result.skill,
					icon:
						result.type === "exploration"
							? "/icons/exploration.png"
							: "/icons/expedition.png",
					value: formatPercent(result.value),
				},
			],
		},
	];

	return (
		<div className="space-y-4">
			<CalculatorResult
				title={title}
				categoryTitle={category?.title ?? "Widget"}
				categoryIcon={category?.icon ?? "/category/widget.png"}
				name={result.heroName}
				subtitle={[`GEN ${result.generation}`, status]
					.filter(Boolean)
					.join(" · ")}
				highlightLabel="Widget Stone"
				highlightValue={formatNumber(widgetStone)}
				createdAt={history?.createdAt}
				updatedAt={history?.updatedAt}
				sections={sections}
			/>

			{showAddButton && onAddItem && (
				<button
					type="button"
					onClick={onAddItem}
					className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--sl-primary)] px-4 text-sm font-semibold text-[var(--sl-primary-foreground)] transition hover:opacity-90"
				>
					<Plus className="size-4" />
					Add Widget
				</button>
			)}
		</div>
	);
}
