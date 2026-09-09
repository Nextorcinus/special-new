"use client";

import { Plus } from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import CalculationComplete from "@/components/calculator/CalculationComplete";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";

import { NAVIGATION } from "@/config/navigation";
import { RESOURCES } from "@/config/resources";

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
	entryId?: string;
	completed?: boolean;
	onCompleted?: () => void;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
};

type CharmResourceType = "Guide" | "Design" | "Jewel";

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

function toNumber(value: unknown): number {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value === "string") {
		const normalized = value.trim().replace(/,/g, "");

		const match = normalized.match(
			/^([0-9]+(?:\.[0-9]+)?)([KMB])?$/i,
		);

		if (!match) {
			const parsed = Number(normalized);

			return Number.isFinite(parsed) ? parsed : 0;
		}

		const base = Number(match[1]);

		if (!Number.isFinite(base)) {
			return 0;
		}

		const suffix = match[2]?.toUpperCase();

		if (suffix === "K") {
			return base * 1_000;
		}

		if (suffix === "M") {
			return base * 1_000_000;
		}

		if (suffix === "B") {
			return base * 1_000_000_000;
		}

		return base;
	}

	const parsed = Number(value ?? 0);

	return Number.isFinite(parsed) ? parsed : 0;
}

function formatResourceAmount(value: unknown): string {
	return formatNumber(toNumber(value));
}

function createCompletedResourceItem(
	key: CharmResourceType,
	value: unknown,
) {
	const resource = RESOURCES[key];

	return {
		id: resource.id,
		label: resource.label,
		icon: resource.icon,
		value: formatResourceAmount(value),
	};
}

export default function CharmResult({
	result,
	history,
	entryId,
	completed = false,
	onCompleted,
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

	const resourceItems = completed
		? [
				createCompletedResourceItem(
					"Guide",
					resources.Guide,
				),
				createCompletedResourceItem(
					"Design",
					resources.Design,
				),
				createCompletedResourceItem(
					"Jewel",
					resources.Jewel,
				),
			]
		: [
				createResourceItem("Guide"),
				createResourceItem("Design"),
				createResourceItem("Jewel"),
			];

	const resultSections = [
		{
			id: "required-resources",
			title: "Required Resources",
			tutorialTarget: completed
				? undefined
				: "bag-compare-result",
			items: resourceItems,
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
	];

	const completionResources = [
		{
			resourceId: RESOURCES.Guide.id,
			amount: toNumber(resources.Guide),
		},
		{
			resourceId: RESOURCES.Design.id,
			amount: toNumber(resources.Design),
		},
		{
			resourceId: RESOURCES.Jewel.id,
			amount: toNumber(resources.Jewel),
		},
	].filter((resource) => resource.amount > 0);

	function handleCompleted() {
		onCompleted?.();
	}

	return (
		<div className="space-y-3">
			<div
				className={[
					"transition-all duration-300",
					completed
						? "opacity-65"
						: "opacity-100",
				].join(" ")}
			>
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
					subtitle={`${troopType} • Lv.${result.fromLevel} → Lv.${result.toLevel}`}
					highlightLabel="SvS Points"
					highlightValue={formatSvs(
						result.svsPoints,
					)}
					createdAt={history?.createdAt}
					updatedAt={history?.updatedAt}
					sections={resultSections}
					completed={completed}
				/>
			</div>

			{history && entryId && (
				<div className="flex justify-end">
					<CalculationComplete
						historyId={history.id}
						entryId={entryId}
						resources={completionResources}
						from={`Lv.${result.fromLevel}`}
						target={`Lv.${result.toLevel}`}
						completed={completed}
						onCompleted={handleCompleted}
					/>
				</div>
			)}

			{showAddButton && onAddItem && (
				<button
					type="button"
					onClick={onAddItem}
					className="mt-5 flex h-28 w-full flex-col items-center justify-center gap-2 rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-input-hover)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)]"
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