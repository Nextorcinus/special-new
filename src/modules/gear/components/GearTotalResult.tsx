"use client";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { CalculationHistoryEntry } from "@/features/inventory/store/history/types";
import { sumField, sumResourceMap } from "@/lib/resources";

import type {
	ChiefGearType,
	GearCalculationResult,
	GearFormValues,
	GearResourceMap,
} from "../type";

type GearHistoryEntry = CalculationHistoryEntry<
	GearFormValues,
	GearCalculationResult
>;

type GearTotalResultProps = {
	items: GearHistoryEntry[];
	title?: string;
};

const RESOURCE_KEYS: Array<keyof GearResourceMap> = [
	"Plans",
	"Alloy",
	"Polish",
	"Amber",
];

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

function createGearSummary(items: GearHistoryEntry[]): string {
	if (items.length === 0) {
		return "Chief Gear";
	}

	if (items.length === 1) {
		return items[0].result?.gear ?? "Chief Gear";
	}

	const uniqueGear = Array.from(
		new Set<ChiefGearType>(
			items
				.map((item) => item.result?.gear)
				.filter(
					(gear): gear is ChiefGearType => gear !== undefined && gear !== null,
				),
		),
	);

	if (uniqueGear.length === 0) {
		return `${items.length} Chief Gear Upgrades`;
	}

	if (uniqueGear.length <= 3) {
		return uniqueGear.join(", ");
	}

	return `${uniqueGear.slice(0, 3).join(", ")} +${uniqueGear.length - 3}`;
}

function createUpgradeSubtitle(items: GearHistoryEntry[]): string {
	const validItems = items.filter(
		(item) => Boolean(item.result?.fromLevel) && Boolean(item.result?.toLevel),
	);

	if (validItems.length === 0) {
		return `${items.length} items`;
	}

	if (validItems.length === 1) {
		const result = validItems[0].result;

		return `${result?.fromLevel} → ${result?.toLevel}`;
	}

	return `${validItems.length} upgrade items`;
}

export default function GearTotalResult({
	items,
	title = "Total Result",
}: GearTotalResultProps) {
	const category = NAVIGATION.find((item) => item.id === "gear");

	const resources = sumResourceMap(
		items,
		RESOURCE_KEYS,
		(item) => item.result?.resources,
	);

	const totalSvsPoints = sumField(items, (item) => item.result?.svsPoints);

	const totalAttackIncrease = sumField(
		items,
		(item) => item.result?.stats?.attackIncrease,
	);

	const totalDefenseIncrease = sumField(
		items,
		(item) => item.result?.stats?.defenseIncrease,
	);

	const totalDeploymentIncrease = sumField(
		items,
		(item) => item.result?.stats?.deploymentIncrease,
	);

	const { createResourceItem } = useCompareResources(resources);

	const firstItem = items[0];

	const lastItem = items.at(-1);

	return (
		<CalculatorResult
			title={title}
			categoryTitle={category?.title ?? "Chief Gear"}
			categoryIcon={category?.icon ?? "/category/chief-gear.png"}
			name={createGearSummary(items)}
			subtitle={createUpgradeSubtitle(items)}
			highlightLabel="Total SvS Points"
			highlightValue={formatSvs(totalSvsPoints)}
			createdAt={firstItem?.createdAt}
			updatedAt={lastItem?.createdAt}
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
							value: formatStat(totalAttackIncrease),
						},
						{
							id: "defense",
							label: "Defense",
							icon: "/icons/defense.png",
							value: formatStat(totalDefenseIncrease),
						},
						{
							id: "deployment-capacity",
							label: "Deployment Capacity",
							icon: "/icons/deployment.png",
							value: formatDeployment(totalDeploymentIncrease),
						},
					],
				},
			]}
		/>
	);
}
