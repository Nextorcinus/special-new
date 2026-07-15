"use client";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import { formatNumber } from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { CalculationHistoryEntry } from "@/features/inventory/store/history/types";

import type { WidgetCalculationResult, WidgetFormValues } from "../type";

type WidgetHistoryEntry = CalculationHistoryEntry<
	WidgetFormValues,
	WidgetCalculationResult
>;

type WidgetTotalResultProps = {
	items: WidgetHistoryEntry[];
	title?: string;
};

function toNumber(value: unknown): number {
	const number = Number(value ?? 0);

	return Number.isFinite(number) ? number : 0;
}

export default function WidgetTotalResult({
	items,
	title = "Total Result",
}: WidgetTotalResultProps) {
	const category = NAVIGATION.find((item) => item.id === "widget");

	const totalWidgetStone = items.reduce((total, item) => {
		return total + toNumber(item.result?.resources?.WidgetStone);
	}, 0);

	const totalLevels = items.reduce((total, item) => {
		const fromLevel = toNumber(item.result?.fromLevel);

		const toLevel = toNumber(item.result?.toLevel);

		return total + Math.max(0, toLevel - fromLevel);
	}, 0);

	const heroNames = Array.from(
		new Set(
			items
				.map((item) => item.result?.heroName)
				.filter(
					(name): name is string => typeof name === "string" && name.length > 0,
				),
		),
	);

	const firstItem = items[0];

	return (
		<CalculatorResult
			title={title}
			categoryTitle={category?.title ?? "Widget"}
			categoryIcon={category?.icon ?? "/category/widget.png"}
			name={
				heroNames.length === 1
					? heroNames[0]
					: `${items.length} Widget Upgrades`
			}
			subtitle={
				heroNames.length > 1
					? heroNames.join(", ")
					: "Combined widget calculation"
			}
			highlightLabel="Total Widget Stone"
			highlightValue={formatNumber(totalWidgetStone)}
			createdAt={firstItem?.createdAt}
			sections={[
				{
					id: "required-resources",
					title: "Required Resources",
					items: [
						{
							id: "widget-stone",
							label: "Widget Stone",
							icon: "/category/widget.png",
							value: formatNumber(totalWidgetStone),
						},
					],
				},
				{
					id: "upgrade-summary",
					title: "Upgrade Summary",
					items: [
						{
							id: "widget-count",
							label: "Widget Upgrades",
							icon: "/category/widget.png",
							value: formatNumber(items.length),
						},
						{
							id: "total-levels",
							label: "Total Levels",
							icon: "/icons/levelup.png",
							value: formatNumber(totalLevels),
						},
					],
				},
			]}
		/>
	);
}
