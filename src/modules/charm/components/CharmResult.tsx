"use client";

import { ArrowRight, Plus } from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";

import type {
	CharmCalculationResult,
	CharmFormValues,
} from "../type";
import { CHARM_STAT_LABEL_MAP } from "../type";

type CharmHistoryItem = CalculationHistoryItem<
	CharmFormValues,
	CharmCalculationResult
>;

type CharmResultProps = {
	result: CharmCalculationResult;
	history?: CharmHistoryItem | null;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
};

function formatSvs(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "+0";
	}

	if (number >= 1_000_000_000) {
		return `+${(number / 1_000_000_000).toFixed(2)}B`;
	}

	if (number >= 1_000_000) {
		return `+${(number / 1_000_000).toFixed(2)}M`;
	}

	if (number >= 1_000) {
		return `+${(number / 1_000).toFixed(1)}K`;
	}

	return `+${formatNumber(number)}`;
}

function formatPower(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "+0";
	}

	return `+${formatNumber(number)}`;
}

function formatStat(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "+0%";
	}

	return `+${number.toLocaleString("en-US", {
		minimumFractionDigits: Number.isInteger(number) ? 0 : 1,
		maximumFractionDigits: 2,
	})}%`;
}

export default function CharmResult({
	result,
	history,
	title,
	showAddButton = false,
	onAddItem,
}: CharmResultProps) {
	const category = NAVIGATION.find(
		(item) => item.id === "charm",
	);

	const resources = result.resources ?? {
		Guide: 0,
		Design: 0,
		Jewel: 0,
	};

	const troopType =
		result.stats?.troopType ??
		CHARM_STAT_LABEL_MAP[result.type];

	const stats = result.stats ?? {
		troopType,

		powerFrom: 0,
		powerTo: 0,
		powerIncrease: 0,

		statFrom: 0,
		statTo: 0,
		statIncrease: 0,

		lethalityIncrease: 0,
		healthIncrease: 0,
	};

	const { createResourceItem } =
		useCompareResources(resources);

	return (
		<div className="space-y-3">
			<CalculatorResult
				title={title}
				categoryTitle={
					category?.title ?? "Chief Charm"
				}
				categoryIcon={
					category?.icon ??
					"/category/chief-charm.png"
				}
				name={result.type}
				subtitle={
					<span className="inline-flex flex-wrap items-center gap-2">
						<span>{troopType}</span>

						<span className="text-[var(--sl-text-muted)]">
							•
						</span>

						<span>Lv.{result.fromLevel}</span>

						<ArrowRight
							className="size-3.5 text-[var(--sl-text-muted)]"
							aria-hidden="true"
						/>

						<span>Lv.{result.toLevel}</span>
					</span>
				}
				highlightLabel="SvS Points"
				highlightValue={formatSvs(
					result.svsPoints,
				)}
				createdAt={history?.createdAt}
				updatedAt={history?.updatedAt}
				sections={[
					{
						id: "required-resources",
						title: "Required Resources",
						items: [
							createResourceItem("Guide"),
							createResourceItem("Design"),
							createResourceItem("Jewel"),
						],
					},
					{
						id: "troop-stats",
						title: `${troopType} Stats`,
						items: [
							{
								id: "lethality",
								label: "Lethality",
								icon: "/icons/lethality.png",
								value: formatStat(
									stats.lethalityIncrease,
								),
							},
							{
								id: "health",
								label: "Health",
								icon: "/icons/health.png",
								value: formatStat(
									stats.healthIncrease,
								),
							},
              {
								id: "power-increase",
								label: "Power",
								icon: "/icons/power.png",
								value: formatPower(
									stats.powerIncrease,
								),
							},
						],
					},
					{
						id: "valeria",
						title: "Valeria Bonus",
						items: [
							{
								id: "valeria-level",
								label: `Valeria Lv.${result.valeriaLevel}`,
								icon: "/icons/valeria.png",
								value: `+${result.valeriaBonus}%`,
							},
							{
								id: "valeria-svs",
								label: "Bonus SvS Points",
								icon: "/icons/svs.png",
								value: formatSvs(
									result.valeriaBonusPoints,
								),
							},
						],
					},
				]}
			/>

			{showAddButton && onAddItem && (
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
		</div>
	);
}