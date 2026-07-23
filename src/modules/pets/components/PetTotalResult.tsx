"use client";

import {
	BriefcaseBusiness,
	DoorOpen,
	Sparkles,
	TrendingUp,
	Zap,
} from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { RESOURCES } from "@/config/resources";
import type { CalculationHistoryEntry } from "@/features/inventory/store/history/types";
import { createEmptyPetResources } from "../calculator/helpers";
import type {
	PetCalculationResult,
	PetFormValues,
	PetResources,
} from "../type";

type PetHistoryEntry = CalculationHistoryEntry<
	PetFormValues,
	PetCalculationResult
>;

type PetTotalResultProps = {
	items: PetHistoryEntry[];
};

const PET_ICON = "/category/pets.png";

function formatPercentage(value: number): string {
	if (!Number.isFinite(value)) {
		return "0%";
	}

	return `${value
		.toFixed(2)
		.replace(/\.00$/, "")
		.replace(/(\.\d)0$/, "$1")}%`;
}

function formatPercentageIncrease(value: number): string {
	const formatted = formatPercentage(value);
	return value > 0 ? `+${formatted}` : formatted;
}

function addResources(
	total: PetResources,
	resources?: Partial<PetResources>,
): PetResources {
	if (!resources) {
		return total;
	}

	total.PetFood += Number(resources.PetFood ?? 0);
	total.TamingManual += Number(resources.TamingManual ?? 0);
	total.EnergizingPotion += Number(resources.EnergizingPotion ?? 0);
	total.StrengtheningSerum += Number(resources.StrengtheningSerum ?? 0);

	return total;
}

function sumResources(
	items: PetHistoryEntry[],
	getResources: (
		result: PetCalculationResult,
	) => Partial<PetResources> | undefined,
): PetResources {
	return items.reduce<PetResources>((total, item) => {
		if (!item.result) {
			return total;
		}

		return addResources(total, getResources(item.result));
	}, createEmptyPetResources());
}

function sumResultField(
	items: PetHistoryEntry[],
	getValue: (result: PetCalculationResult) => number,
): number {
	return items.reduce((total, item) => {
		if (!item.result) {
			return total;
		}

		const value = Number(getValue(item.result));
		return Number.isFinite(value) ? total + value : total;
	}, 0);
}

function getLevelResources(result: PetCalculationResult): PetResources {
	if (result.levelResources) {
		return result.levelResources;
	}

	return {
		...createEmptyPetResources(),
		PetFood: Number(result.resources?.PetFood ?? 0),
	};
}

function getAdvancementResources(result: PetCalculationResult): PetResources {
	if (result.advancementResources) {
		return result.advancementResources;
	}

	return {
		...createEmptyPetResources(),
		TamingManual: Number(result.resources?.TamingManual ?? 0),
		EnergizingPotion: Number(result.resources?.EnergizingPotion ?? 0),
		StrengtheningSerum: Number(result.resources?.StrengtheningSerum ?? 0),
	};
}

export default function PetTotalResult({ items }: PetTotalResultProps) {
	const resources = sumResources(items, (result) => result.resources);
	const levelResources = sumResources(items, getLevelResources);
	const advancementResources = sumResources(items, getAdvancementResources);

	const totalPowerIncrease = sumResultField(
		items,
		(result) => result.powerIncrease,
	);
	const totalPassiveIncrease = sumResultField(
		items,
		(result) => result.passiveIncreasePct,
	);
	const totalLevelSvsPoints = sumResultField(
		items,
		(result) => result.levelSvsPoints ?? result.baseSvsPoints ?? 0,
	);
	const totalAdvancementSvsPoints = sumResultField(
		items,
		(result) => result.advancementSvsPoints ?? 0,
	);
	const totalBaseSvsPoints = sumResultField(
		items,
		(result) => result.baseSvsPoints,
	);
	const totalFinalSvsPoints = sumResultField(
		items,
		(result) => result.finalSvsPoints,
	);

	const totalMilestones = items.reduce(
		(total, item) => total + (item.result?.milestonesReached.length ?? 0),
		0,
	);

	const uniquePets = new Set(
		items
			.map((item) => item.result?.petId)
			.filter((petId): petId is string => typeof petId === "string"),
	).size;

	const { createResourceItem } = useCompareResources(resources);

	const resourceItems = [
		createResourceItem("PetFood"),
		createResourceItem("TamingManual"),
		createResourceItem("EnergizingPotion"),
		createResourceItem("StrengtheningSerum"),
	];

	const breakdownItems = [
		{
			id: "pet-total-level-food",
			icon: RESOURCES.PetFood.icon,
			label: "Leveling Pet Food",
			value: formatNumber(levelResources.PetFood),
		},
		{
			id: "pet-total-gate-manual",
			icon: RESOURCES.TamingManual.icon,
			label: "Gate Taming Manual",
			value: formatNumber(advancementResources.TamingManual),
		},
		{
			id: "pet-total-gate-potion",
			icon: RESOURCES.EnergizingPotion.icon,
			label: "Gate Energizing Potion",
			value: formatNumber(advancementResources.EnergizingPotion),
		},
		{
			id: "pet-total-gate-serum",
			icon: RESOURCES.StrengtheningSerum.icon,
			label: "Gate Strengthening Serum",
			value: formatNumber(advancementResources.StrengtheningSerum),
		},
	];

	const powerItems = [
		{
			id: "pet-total-power-increase",
			icon: PET_ICON,
			label: "Total Power Increase",
			value: `+${formatNumber(totalPowerIncrease)}`,
			compareType:
				totalPowerIncrease > 0 ? ("plus" as const) : ("muted" as const),
		},
	];

	const passiveItems = [
		{
			id: "pet-total-passive-increase",
			icon: PET_ICON,
			label: "Total Troop A/D Increase",
			value: formatPercentageIncrease(totalPassiveIncrease),
			compareType:
				totalPassiveIncrease > 0 ? ("plus" as const) : ("muted" as const),
		},
	];

	const rewardItems = [
		{
			id: "pet-total-level-svs",
			icon: PET_ICON,
			label: "Leveling SvS Points",
			value: formatNumber(totalLevelSvsPoints),
		},
		{
			id: "pet-total-gate-svs",
			icon: PET_ICON,
			label: "Open Gate SvS Points",
			value: formatNumber(totalAdvancementSvsPoints),
		},
		{
			id: "pet-total-base-svs",
			icon: PET_ICON,
			label: "Base SvS Points",
			value: formatNumber(totalBaseSvsPoints),
		},
		{
			id: "pet-total-final-svs",
			icon: PET_ICON,
			label: "Final SvS Points",
			value: formatNumber(totalFinalSvsPoints),
			compareType:
				totalFinalSvsPoints > 0 ? ("plus" as const) : ("muted" as const),
		},
	];

	const summaryItems = [
		{
			id: "pet-total-calculations",
			icon: PET_ICON,
			label: "Total Calculations",
			value: formatNumber(items.length),
		},
		{
			id: "pet-total-unique-pets",
			icon: PET_ICON,
			label: "Unique Pets",
			value: formatNumber(uniquePets),
		},
		{
			id: "pet-total-milestones",
			icon: PET_ICON,
			label: "Open Gates",
			value: formatNumber(totalMilestones),
		},
	];

	return (
		<CalculatorResult
			title="Total Result"
			categoryTitle="Pet Calculator"
			categoryIcon={PET_ICON}
			name="Pet Calculation Total"
			subtitle={`${items.length} calculation${
				items.length === 1 ? "" : "s"
			} · ${uniquePets} unique pet${uniquePets === 1 ? "" : "s"}`}
			highlightLabel="Final SvS Points"
			highlightValue={formatNumber(totalFinalSvsPoints)}
			sections={[
				{
					id: "pet-total-required-resources",
					title: "Required Resources",
					icon: <BriefcaseBusiness size={18} />,
					items: resourceItems,
				},
				{
					id: "pet-total-open-gate-breakdown",
					title: "Leveling & Open Gate",
					icon: <DoorOpen size={18} />,
					items: breakdownItems,
				},
				{
					id: "pet-total-power",
					title: "Power",
					icon: <Zap size={18} />,
					items: powerItems,
				},
				{
					id: "pet-total-passive",
					title: "Passive Bonus",
					icon: <TrendingUp size={18} />,
					items: passiveItems,
				},
				{
					id: "pet-total-rewards",
					title: "SvS Points",
					icon: <Sparkles size={18} />,
					items: rewardItems,
				},
				{
					id: "pet-total-summary",
					title: "Summary",
					icon: <Sparkles size={18} />,
					items: summaryItems,
				},
			]}
		/>
	);
}
