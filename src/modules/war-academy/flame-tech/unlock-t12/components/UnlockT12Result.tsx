"use client";

import { BriefcaseBusiness, Gem, Plus, ShieldCheck, Zap } from "lucide-react";

import CalculationComplete from "@/components/calculator/CalculationComplete";
import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import { RESOURCES, type ResourceKey } from "@/config/resources";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";

import type { UnlockT12CalculationResult, UnlockT12FormValues } from "../type";

type UnlockT12HistoryItem = CalculationHistoryItem<
	UnlockT12FormValues,
	UnlockT12CalculationResult
>;

type UnlockT12ResultProps = {
	result: UnlockT12CalculationResult;
	history?: UnlockT12HistoryItem | null;
	entryId?: string;
	completed?: boolean;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
	onCompleted?: () => void;
};

type UnlockT12CompletionResource = {
	resourceId: (typeof RESOURCES)[keyof typeof RESOURCES]["id"];
	amount: number;
};

function toFiniteNumber(value: unknown): number {
	const number = Number(value ?? 0);

	return Number.isFinite(number) ? number : 0;
}

function formatPower(value: unknown): string {
	const number = toFiniteNumber(value);

	if (number <= 0) {
		return "+0";
	}

	return `+${formatNumber(number)}`;
}

function formatAttributeValue(value: unknown, unit?: string): string {
	const number = toFiniteNumber(value);

	if (number < 0) {
		return `-${formatNumber(Math.abs(number))}${unit ?? ""}`;
	}

	return `+${formatNumber(number)}${unit ?? ""}`;
}

function normalizeId(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function getCompletionResources(
	resources: Partial<Record<ResourceKey, number>>,
): UnlockT12CompletionResource[] {
	const completionResources: UnlockT12CompletionResource[] = [];

	for (const [resourceKey, amount] of Object.entries(resources)) {
		const numericAmount = toFiniteNumber(amount);

		if (numericAmount <= 0) {
			continue;
		}

		const resource = RESOURCES[resourceKey as ResourceKey];

		if (!resource) {
			continue;
		}

		completionResources.push({
			resourceId: resource.id,
			amount: numericAmount,
		});
	}

	return completionResources;
}

export default function UnlockT12Result({
	result,
	history,
	entryId,
	completed = false,
	title,
	showAddButton = false,
	onAddItem,
	onCompleted,
}: UnlockT12ResultProps) {
	const warAcademyNavigation = NAVIGATION.find(
		(item) => item.id === "war-academy",
	);

	const resources = (result?.resources ?? {}) as Partial<
		Record<ResourceKey, number>
	>;

	const { createResourceItem } = useCompareResources(resources);

	if (!result) {
		return null;
	}

	const powerItems = [
		{
			id: "power-increase",
			label: "Power Increase",
			icon: "/icons/power.png",
			value: formatPower(result.power),
			valueClassName:
				toFiniteNumber(result.power) > 0
					? "text-yellow-500"
					: "text-[var(--sl-text-muted)]",
		},
		{
			id: "levels-upgraded",
			label: "Levels Upgraded",
			icon: "/icons/Buff.png",
			value: formatNumber(result.selectedLevels?.length ?? 0),
		},
	];

	const attributeItems = (result.attributes ?? []).map((attribute, index) => ({
		id: [
			"attribute",
			index,
			normalizeId(attribute.name),
			normalizeId(attribute.unit ?? "flat"),
		].join("-"),
		label: attribute.name,
		icon: "/icons/Buff.png",
		value: formatAttributeValue(attribute.value, attribute.unit),
		valueClassName:
			toFiniteNumber(attribute.value) > 0
				? "text-white"
				: "text-[var(--sl-text-muted)]",
	}));

	const baseResourceItems = [
		...(toFiniteNumber(resources.Steel) > 0
			? [createResourceItem("Steel")]
			: []),
	];

	const fireCrystalItems = [
		...(toFiniteNumber(resources.RFC) > 0 ? [createResourceItem("RFC")] : []),
		...(toFiniteNumber(resources.Shard) > 0
			? [createResourceItem("Shard")]
			: []),
	];

	const sections = [
		{
			id: "power",
			title: "Power",
			icon: <Zap size={18} />,
			items: powerItems,
		},

		...(attributeItems.length > 0
			? [
					{
						id: "attributes",
						title: "Attributes",
						icon: <ShieldCheck size={18} />,
						items: attributeItems,
					},
				]
			: []),

		...(baseResourceItems.length > 0
			? [
					{
						id: "base-resources",
						title: "Base Resources",
						icon: <BriefcaseBusiness size={18} />,
						items: baseResourceItems,
					},
				]
			: []),

		...(fireCrystalItems.length > 0
			? [
					{
						id: "fire-crystals",
						title: "Fire Crystals",
						icon: <Gem size={18} />,
						items: fireCrystalItems,
					},
				]
			: []),
	];

	const calculationEntryId =
		entryId ?? history?.items?.[0]?.id ?? (history ? `${history.id}_item` : "");

	const completionResources = getCompletionResources(resources);

	const subtitle = `${result.category} • Lv.${result.fromLevel ?? "-"} → Lv.${result.toLevel ?? "-"}`;

	return (
		<div
			className={[
				"space-y-4 transition-opacity duration-300",
				completed ? "opacity-65" : "opacity-100",
			].join(" ")}
		>
			<CalculatorResult
				title={title}
				categoryTitle="Flame Tech"
				categoryIcon={warAcademyNavigation?.icon ?? "/category/war-academy.png"}
				name={result.research || "Unlock T12"}
				subtitle={subtitle}
				highlightLabel="Power Increase"
				highlightValue={formatPower(result.power)}
				sections={sections}
			/>

			{history && calculationEntryId && (
				<div className="flex justify-end">
					<CalculationComplete
						historyId={history.id}
						entryId={calculationEntryId}
						completed={completed}
						resources={completionResources}
						from={`Lv.${result.fromLevel ?? "-"}`}
						target={`Lv.${result.toLevel ?? "-"}`}
						onCompleted={onCompleted}
					/>
				</div>
			)}

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
