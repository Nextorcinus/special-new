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
	entryId?: string;
	completed?: boolean;
	onCompleted?: () => void;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
};

type GearResourceType =
	| "Plans"
	| "Alloy"
	| "Polish"
	| "Amber";

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

function formatDeployment(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "+0";
	}

	return `+${formatNumber(number)}`;
}

function formatStatResult(
	finalValue: unknown,
	increaseValue: unknown,
): string {
	const finalStat = Number(finalValue ?? 0);
	const increase = Number(increaseValue ?? 0);

	if (
		!Number.isFinite(finalStat) ||
		!Number.isFinite(increase)
	) {
		return "+0%";
	}

	const formattedFinal = `+${finalStat.toLocaleString(
		"en-US",
		{
			minimumFractionDigits:
				Number.isInteger(finalStat) ? 0 : 2,
			maximumFractionDigits: 2,
		},
	)}%`;

	const formattedIncrease = `+${increase.toLocaleString(
		"en-US",
		{
			minimumFractionDigits:
				Number.isInteger(increase) ? 0 : 2,
			maximumFractionDigits: 2,
		},
	)}%`;

	return `${formattedFinal}  ${formattedIncrease}`;
}

function formatDeploymentResult(
	finalValue: unknown,
	increaseValue: unknown,
): string {
	const finalDeployment = Number(finalValue ?? 0);
	const increase = Number(increaseValue ?? 0);

	if (
		!Number.isFinite(finalDeployment) ||
		!Number.isFinite(increase)
	) {
		return "+0";
	}

	return `${formatDeployment(
		finalDeployment,
	)}  ${formatDeployment(increase)}`;
}

function toNumber(value: unknown): number {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value === "string") {
		const normalized = value
			.trim()
			.replace(/,/g, "");

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
	key: GearResourceType,
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

export default function GearResult({
	result,
	history,
	entryId,
	completed = false,
	onCompleted,
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
		powerFrom: 0,
		powerTo: 0,
		powerIncrease: 0,
	};

	const { createResourceItem } =
		useCompareResources(resources);

	const resourceItems = completed
		? [
				createCompletedResourceItem(
					"Plans",
					resources.Plans,
				),
				createCompletedResourceItem(
					"Alloy",
					resources.Alloy,
				),
				createCompletedResourceItem(
					"Polish",
					resources.Polish,
				),
				createCompletedResourceItem(
					"Amber",
					resources.Amber,
				),
			]
		: [
				createResourceItem("Plans"),
				createResourceItem("Alloy"),
				createResourceItem("Polish"),
				createResourceItem("Amber"),
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
			id: "stats",
			title: "Stats Increase",
			items: [
				{
					id: "attack",
					label: "Attack",
					icon: "/icons/attack.png",
					value: formatStatResult(
						stats.attackTo,
						stats.attackIncrease,
					),
				},
				{
					id: "defense",
					label: "Defense",
					icon: "/icons/defense.png",
					value: formatStatResult(
						stats.defenseTo,
						stats.defenseIncrease,
					),
				},
				{
					id: "deployment-capacity",
					label: "Deployment Capacity",
					icon: "/icons/deployment.png",
					value: formatDeploymentResult(
						stats.deploymentTo,
						stats.deploymentIncrease,
					),
				},
			],
		},
	];

	const completionResources = [
		{
			resourceId: RESOURCES.Plans.id,
			amount: toNumber(resources.Plans),
		},
		{
			resourceId: RESOURCES.Alloy.id,
			amount: toNumber(resources.Alloy),
		},
		{
			resourceId: RESOURCES.Polish.id,
			amount: toNumber(resources.Polish),
		},
		{
			resourceId: RESOURCES.Amber.id,
			amount: toNumber(resources.Amber),
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
						category?.title ?? "Chief Gear"
					}
					categoryIcon={
						category?.icon ??
						"/category/chief-gear.png"
					}
					name={result.gear}
					subtitle={`${result.fromLevel} → ${result.toLevel}`}
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
						from={String(result.fromLevel)}
						target={String(result.toLevel)}
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