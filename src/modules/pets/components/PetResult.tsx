"use client";

import {
	ArrowRight,
	BriefcaseBusiness,
	Clock3,
	DoorOpen,
	TrendingUp,
	Trophy,
	Zap,
} from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";

import { createEmptyPetResources } from "../calculator/helpers";
import type {
	PetCalculationResult,
	PetFormValues,
	PetResources,
} from "../type";

type PetHistoryItem = CalculationHistoryItem<
	PetFormValues,
	PetCalculationResult
>;

type PetResultProps = {
	result: PetCalculationResult;
	history?: PetHistoryItem | null;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
};

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

function getSkillText(
	milestone:
		| PetCalculationResult["currentMilestone"]
		| PetCalculationResult["targetMilestone"],
): string {
	if (!milestone) {
		return "Not unlocked";
	}

	return `Skill Lv.${milestone.skillLevel} · ${milestone.skillValue}`;
}

function getLegacySafeBreakdown(result: PetCalculationResult): {
	levelResources: PetResources;
	advancementResources: PetResources;
	levelSvsPoints: number;
	advancementSvsPoints: number;
} {
	const levelResources: PetResources = result.levelResources ?? {
		...createEmptyPetResources(),
		PetFood: Number(result.resources?.PetFood ?? 0),
	};

	const advancementResources: PetResources = result.advancementResources ?? {
		...createEmptyPetResources(),
		TamingManual: Number(result.resources?.TamingManual ?? 0),
		EnergizingPotion: Number(result.resources?.EnergizingPotion ?? 0),
		StrengtheningSerum: Number(result.resources?.StrengtheningSerum ?? 0),
	};

	return {
		levelResources,
		advancementResources,
		levelSvsPoints: Number(result.levelSvsPoints ?? result.baseSvsPoints ?? 0),
		advancementSvsPoints: Number(result.advancementSvsPoints ?? 0),
	};
}

export default function PetResult({
	result,
	history,
	title = "Pet Result",
	showAddButton = false,
	onAddItem,
}: PetResultProps) {
	const category = NAVIGATION.find(
		(item) => item.id === "pet" || item.id === "pets",
	);

	const { createResourceItem } = useCompareResources(result.resources);
	const {
		levelResources,
		advancementResources,
		levelSvsPoints,
		advancementSvsPoints,
	} = getLegacySafeBreakdown(result);

	const reachedMilestones = formatReachedMilestones(
		result.milestonesReached.map((milestone) => milestone.level),
	);

	const itemIcon = result.image;

	const resourceItems = [
		createResourceItem("PetFood"),
		createResourceItem("TamingManual"),
		createResourceItem("EnergizingPotion"),
		createResourceItem("StrengtheningSerum"),
	];

	const advancementItems = [
		{
			id: "pet-level-food-cost",
			icon: itemIcon,
			label: "Leveling Pet Food",
			value: formatNumber(levelResources.PetFood),
		},
		{
			id: "pet-gate-manual-cost",
			icon: itemIcon,
			label: "Gate Taming Manual",
			value: formatNumber(advancementResources.TamingManual),
		},
		{
			id: "pet-gate-potion-cost",
			icon: itemIcon,
			label: "Gate Energizing Potion",
			value: formatNumber(advancementResources.EnergizingPotion),
		},
		{
			id: "pet-gate-serum-cost",
			icon: itemIcon,
			label: "Gate Strengthening Serum",
			value: formatNumber(advancementResources.StrengtheningSerum),
		},
		{
			id: "pet-open-gates",
			icon: itemIcon,
			label: "Open Gates",
			value: reachedMilestones,
		},
	];

	const powerItems = [
		{
			id: "pet-current-power",
			icon: itemIcon,
			label: "Current Power",
			value: formatNumber(result.powerBefore),
		},
		{
			id: "pet-target-power",
			icon: itemIcon,
			label: "Target Power",
			value: formatNumber(result.powerAfter),
		},
		{
			id: "pet-power-increase",
			icon: itemIcon,
			label: "Power Increase",
			value: `+${formatNumber(result.powerIncrease)}`,
			compareType:
				result.powerIncrease > 0 ? ("plus" as const) : ("muted" as const),
		},
	];

	const passiveItems = [
		{
			id: "pet-current-passive",
			icon: itemIcon,
			label: "Current Troop A/D",
			value: formatPercentage(result.passiveBeforePct),
		},
		{
			id: "pet-target-passive",
			icon: itemIcon,
			label: "Target Troop A/D",
			value: formatPercentage(result.passiveAfterPct),
		},
		{
			id: "pet-passive-increase",
			icon: itemIcon,
			label: "Passive Increase",
			value: formatPercentageIncrease(result.passiveIncreasePct),
			compareType:
				result.passiveIncreasePct > 0 ? ("plus" as const) : ("muted" as const),
		},
	];

	const skillItems = [
		{
			id: "pet-current-skill",
			icon: itemIcon,
			label: "Current Skill",
			value: getSkillText(result.currentMilestone),
		},
		{
			id: "pet-target-skill",
			icon: itemIcon,
			label: "Target Skill",
			value: getSkillText(result.targetMilestone),
		},
		{
			id: "pet-skill-cooldown",
			icon: itemIcon,
			label: "Cooldown",
			value: result.targetMilestone?.cooldown ?? "-",
		},
	];

	const svsItems = [
		{
			id: "pet-level-svs",
			icon: itemIcon,
			label: "Leveling SvS Points",
			value: formatNumber(levelSvsPoints),
		},
		{
			id: "pet-advancement-svs",
			icon: itemIcon,
			label: "Open Gate SvS Points",
			value: formatNumber(advancementSvsPoints),
		},
		{
			id: "pet-base-svs",
			icon: itemIcon,
			label: "Base SvS Points",
			value: formatNumber(result.baseSvsPoints),
		},
		{
			id: "pet-valeria-bonus",
			icon: itemIcon,
			label: "Valeria Bonus",
			value:
				result.valeriaLevel > 0
					? `Lv.${result.valeriaLevel} · +${result.valeriaBonusPct}%`
					: "Off",
		},
		{
			id: "pet-final-svs",
			icon: itemIcon,
			label: "Final SvS Points",
			value: formatNumber(result.finalSvsPoints),
			compareType:
				result.finalSvsPoints > 0 ? ("plus" as const) : ("muted" as const),
		},
	];

	const summaryItems = [
		{
			id: "pet-level-range",
			icon: itemIcon,
			label: "Level Range",
			value: `Lv.${result.fromLevel} → Lv.${result.toLevel}`,
		},
		{
			id: "pet-milestones-reached",
			icon: itemIcon,
			label: "Milestones Reached",
			value: reachedMilestones,
		},
		{
			id: "pet-max-level",
			icon: itemIcon,
			label: "Maximum Level",
			value: `Lv.${result.maxLevel}`,
		},
	];

	function formatReachedMilestones(levels: number[]): string {
		if (levels.length === 0) {
			return "None";
		}

		if (levels.length <= 6) {
			return levels.map((level) => `Lv.${level}`).join(", ");
		}

		const firstLevels = levels.slice(0, 3);
		const lastLevels = levels.slice(-3);

		return [
			...firstLevels.map((level) => `Lv.${level}`),
			"...",
			...lastLevels.map((level) => `Lv.${level}`),
		].join(", ");
	}
	return (
		<div className="space-y-4">
			<CalculatorResult
				title={title}
				categoryTitle={category?.title ?? "Pet Calculator"}
				categoryIcon={category?.icon ?? "/category/pets.png"}
				name={result.petName}
				subtitle={`GEN ${result.generation} · ${result.rarity} · Lv.${result.fromLevel} → Lv.${result.toLevel}`}
				highlightLabel="Final SvS Points"
				highlightValue={formatNumber(result.finalSvsPoints)}
				createdAt={history?.createdAt}
				updatedAt={history?.updatedAt}
				sections={[
					{
						id: "pet-required-resources",
						title: "Required Resources",
						icon: <BriefcaseBusiness size={18} />,
						items: resourceItems,
					},
					{
						id: "pet-open-gate-breakdown",
						title: "Leveling & Open Gate",
						icon: <DoorOpen size={18} />,
						items: advancementItems,
					},
					{
						id: "pet-power",
						title: "Power",
						icon: <Zap size={18} />,
						items: powerItems,
					},
					{
						id: "pet-passive-bonus",
						title: "Passive Bonus",
						icon: <TrendingUp size={18} />,
						items: passiveItems,
					},
					{
						id: "pet-skill-progression",
						title: "Skill Progression",
						icon: <Clock3 size={18} />,
						items: skillItems,
					},
					{
						id: "pet-svs-points",
						title: "SvS Points",
						icon: <Trophy size={18} />,
						items: svsItems,
					},
					{
						id: "pet-summary",
						title: "Summary",
						icon: <ArrowRight size={18} />,
						items: summaryItems,
					},
				]}
			/>

			{showAddButton && onAddItem && (
				<button
					type="button"
					onClick={onAddItem}
					className="w-full rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface-2)] px-4 py-3 text-sm font-bold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-hover)]"
				>
					Add Item
				</button>
			)}
		</div>
	);
}
