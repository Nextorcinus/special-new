"use client";

import { BriefcaseBusiness, Gem, ShieldCheck, Zap } from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { CalculationHistoryEntry } from "@/features/inventory/store/history/types";

import type { UnlockT12CalculationResult, UnlockT12FormValues } from "../type";

type UnlockT12HistoryEntry = CalculationHistoryEntry<
	UnlockT12FormValues,
	UnlockT12CalculationResult
>;

type UnlockT12TotalResultProps = {
	items: UnlockT12HistoryEntry[];
	title?: string;
};

type UnlockT12ResourceKey = keyof UnlockT12CalculationResult["resources"];

type UnlockT12ResourceTotals = Record<UnlockT12ResourceKey, number>;

type TotalAttribute = {
	name: string;
	value: number;
	unit: string;
};

const RESOURCE_KEYS: UnlockT12ResourceKey[] = ["Steel", "RFC", "Shard"];

function sumNumber(
	items: UnlockT12HistoryEntry[],
	getValue: (item: UnlockT12HistoryEntry) => unknown,
): number {
	return items.reduce((total, item) => {
		const value = Number(getValue(item) ?? 0);

		if (!Number.isFinite(value)) {
			return total;
		}

		return total + value;
	}, 0);
}

function normalizeAttributeName(value: unknown): string {
	return String(value ?? "")
		.trim()
		.replace(/\s+/g, " ");
}

function aggregateAttributes(items: UnlockT12HistoryEntry[]): TotalAttribute[] {
	const attributeMap = new Map<string, TotalAttribute>();

	for (const item of items) {
		const attributes = item.result?.attributes ?? [];

		for (const attribute of attributes) {
			const name = normalizeAttributeName(attribute.name);

			const unit = String(attribute.unit ?? "");

			if (!name) {
				continue;
			}

			const value = Number(attribute.value ?? 0);

			if (!Number.isFinite(value)) {
				continue;
			}

			/*
			 * Attribute persen dan flat dengan nama
			 * yang sama tidak boleh digabung.
			 */
			const key = [name.toLowerCase(), unit.toLowerCase()].join(":");

			const current = attributeMap.get(key);

			if (current) {
				current.value += value;
				continue;
			}

			attributeMap.set(key, {
				name,
				value,
				unit,
			});
		}
	}

	return Array.from(attributeMap.values()).sort((a, b) =>
		a.name.localeCompare(b.name),
	);
}

function getResearchNames(items: UnlockT12HistoryEntry[]): string[] {
	return Array.from(
		new Set(
			items
				.map((item) => item.result?.research?.trim())
				.filter((value): value is string => Boolean(value)),
		),
	);
}

function getCategories(items: UnlockT12HistoryEntry[]): string[] {
	return Array.from(
		new Set(
			items
				.map((item) => item.result?.category?.trim())
				.filter((value): value is string => Boolean(value)),
		),
	);
}

function formatAttributeValue(value: unknown, unit?: string): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return `+0${unit ?? ""}`;
	}

	return `+${formatNumber(number)}${unit ?? ""}`;
}

function sumResources(items: UnlockT12HistoryEntry[]): UnlockT12ResourceTotals {
	const totals: UnlockT12ResourceTotals = {
		Steel: 0,
		RFC: 0,
		Shard: 0,
	};

	for (const key of RESOURCE_KEYS) {
		totals[key] = sumNumber(items, (item) => item.result?.resources?.[key]);
	}

	return totals;
}

export default function UnlockT12TotalResult({
	items,
	title = "Total Result",
}: UnlockT12TotalResultProps) {
	const warAcademyNavigation = NAVIGATION.find(
		(item) => item.id === "war-academy",
	);

	const resources = sumResources(items);

	const totalPower = sumNumber(items, (item) => item.result?.power);

	const attributes = aggregateAttributes(items);

	const researchNames = getResearchNames(items);

	const categories = getCategories(items);

	const { createResourceItem } = useCompareResources(resources);

	const baseResourceItems = [
		...(resources.Steel > 0 ? [createResourceItem("Steel")] : []),
	];

	const fireCrystalItems = [
		...(resources.RFC > 0 ? [createResourceItem("RFC")] : []),

		...(resources.Shard > 0 ? [createResourceItem("Shard")] : []),
	];

	const powerItems = [
		{
			id: "total-power",
			label: "Power Increase",
			icon: "/icons/power.png",
			value: `+${formatNumber(totalPower)}`,
			valueClassName:
				totalPower > 0 ? "text-yellow-500" : "text-[var(--sl-text-muted)]",
		},
	];

	const attributeItems = attributes.map((attribute, index) => ({
		id: [
			"attribute",
			index,
			attribute.name.toLowerCase().replace(/\s+/g, "-"),
			attribute.unit || "flat",
		].join("-"),

		label: attribute.name,
		icon: "/icons/Buff.png",

		value: formatAttributeValue(attribute.value, attribute.unit),

		valueClassName: "text-white",
	}));

	const firstItem = items[0];

	const resultName =
		researchNames.length === 1
			? researchNames[0]
			: `${items.length} Unlock T12 Items`;

	const subtitle =
		researchNames.length > 1
			? researchNames.join(", ")
			: categories.length > 0
				? categories.join(", ")
				: "Combined Unlock T12 calculation";

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
						id: "resources",
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
		<CalculatorResult
			title={title}
			categoryTitle="Unlock T12"
			categoryIcon={warAcademyNavigation?.icon ?? "/category/war-academy.png"}
			name={resultName}
			subtitle={subtitle}
			highlightLabel="Total Power Increase"
			highlightValue={`+${formatNumber(totalPower)}`}
			createdAt={firstItem?.createdAt}
			sections={sections}
		/>
	);
}
