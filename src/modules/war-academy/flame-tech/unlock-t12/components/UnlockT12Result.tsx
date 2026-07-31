"use client";

import {
	ArrowRight,
	BriefcaseBusiness,
	Gem,
	Plus,
	ShieldCheck,
	Zap,
} from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";

import type { UnlockT12CalculationResult } from "../type";

type UnlockT12ResultProps = {
	result: UnlockT12CalculationResult;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
};

function formatPower(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "+0";
	}

	return `+${formatNumber(number)}`;
}

function formatAttributeValue(value: unknown, unit?: string): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return `+0${unit ?? ""}`;
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

export default function UnlockT12Result({
	result,
	title,
	showAddButton = false,
	onAddItem,
}: UnlockT12ResultProps) {
	const warAcademyNavigation = NAVIGATION.find(
		(item) => item.id === "war-academy",
	);

	const resources = {
		Steel: Number(result.resources?.Steel ?? 0),
		RFC: Number(result.resources?.RFC ?? 0),
		Shard: Number(result.resources?.Shard ?? 0),
	};

	const { createResourceItem } = useCompareResources(resources);

	const powerItems = [
		{
			id: "power-increase",
			label: "Power Increase",
			icon: "/icons/power.png",
			value: formatPower(result.power),
			valueClassName:
				Number(result.power ?? 0) > 0
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
			Number(attribute.value ?? 0) > 0
				? "text-white"
				: "text-[var(--sl-text-muted)]",
	}));

	const baseResourceItems = [
		...(resources.Steel > 0 ? [createResourceItem("Steel")] : []),
	];

	const fireCrystalItems = [
		...(resources.RFC > 0 ? [createResourceItem("RFC")] : []),

		...(resources.Shard > 0 ? [createResourceItem("Shard")] : []),
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

	return (
		<>
			<CalculatorResult
				title={title}
				categoryTitle="Flame Tech"
				categoryIcon={warAcademyNavigation?.icon ?? "/category/war-academy.png"}
				name={result.research || "Unlock T12"}
				subtitle={
					<>
						<span>{result.category}</span>

						<span className="text-[var(--sl-text-muted)]">•</span>

						<span>Lv.{result.fromLevel ?? "-"}</span>

						<ArrowRight className="size-4" />

						<span className="text-yellow-500">Lv.{result.toLevel ?? "-"}</span>
					</>
				}
				highlightLabel="Power Increase"
				highlightValue={formatPower(result.power)}
				sections={sections}
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
		</>
	);
}
