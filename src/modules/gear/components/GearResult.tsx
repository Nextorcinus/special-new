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
	GearCalculationResult,
	GearFormValues,
} from "../type";

type GearHistoryItem = CalculationHistoryItem<
	GearFormValues,
	GearCalculationResult
>;

type GearResultProps = {
	result: GearCalculationResult;
	history?: GearHistoryItem | null;
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

function formatStat(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "+0%";
	}

	return `+${number.toLocaleString("en-US", {
		minimumFractionDigits: Number.isInteger(number) ? 0 : 2,
		maximumFractionDigits: 2,
	})}%`;
}

function formatDeployment(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "+0";
	}

	return `+${formatNumber(number)}`;
}

export default function GearResult({
	result,
	history,
	title,
	showAddButton = false,
	onAddItem,
}: GearResultProps) {
	const category = NAVIGATION.find(
		(item) => item.id === "gear",
	);

	const resources = result.resources ?? {
		Plans: 0,
		Alloy: 0,
		Polish: 0,
		Amber: 0,
	};

	const stats = result.stats ?? {
		attackFrom: 0,
		attackTo: 0,
		attackIncrease: 0,

		defenseFrom: 0,
		defenseTo: 0,
		defenseIncrease: 0,

		deploymentFrom: 0,
		deploymentTo: 0,
		deploymentIncrease: 0,
	};

	const { createResourceItem } =
		useCompareResources(resources);

	return (
		<div className="space-y-3">
			<CalculatorResult
				title={title}
				categoryTitle={category?.title ?? "Chief Gear"}
				categoryIcon={
					category?.icon ?? "/category/chief-gear.png"
				}
				name={result.gear}
				subtitle={
					<span className="inline-flex flex-wrap items-center gap-2">
						<span>{result.fromLevel}</span>

						<ArrowRight
							className="size-3.5 text-[var(--sl-text-muted)]"
							aria-hidden="true"
						/>

						<span>{result.toLevel}</span>
					</span>
				}
				highlightLabel="SvS Points"
				highlightValue={formatSvs(result.svsPoints)}
				createdAt={history?.createdAt}
				updatedAt={history?.updatedAt}
				sections={[
					{
						id: "required-resources",
						title: "Required Resources",
						items: [
							createResourceItem("Plans"),
							createResourceItem("Alloy"),
							createResourceItem("Polish"),
							createResourceItem("Amber"),
						],
					},
					{
						id: "stats",
						title: "Stats Increase",
						items: [
							{
								id: "attack",
								label: "Attack",
								icon: "/icons/attack.png",
								value: formatStat(
									stats.attackIncrease,
								),
							},
							{
								id: "defense",
								label: "Defense",
								icon: "/icons/defense.png",
								value: formatStat(
									stats.defenseIncrease,
								),
							},
							{
								id: "deployment-capacity",
								label: "Deployment Capacity",
								icon: "/icons/deployment.png",
								value: formatDeployment(
									stats.deploymentIncrease,
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
					<span className="text-base font-medium">Add more items</span>
				</button>
			)}
		</div>
	);
}