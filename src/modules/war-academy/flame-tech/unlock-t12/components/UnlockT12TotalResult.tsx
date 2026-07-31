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

function toFiniteNumber(value: unknown): number {
	const number = Number(value ?? 0);

	return Number.isFinite(number) ? number : 0;
}

function sumNumber(
	items: UnlockT12HistoryEntry[],
	getValue: (item: UnlockT12HistoryEntry) => unknown,
): number {
	return items.reduce(
		(total, item) => total + toFiniteNumber(getValue(item)),
		0,
	);
}

function normalizeText(value: unknown): string {
	return String(value ?? "")
		.trim()
		.replace(/\s+/g, " ");
}

function normalizeId(value: unknown): string {
	return normalizeText(value)
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function formatSignedValue(value: unknown, unit = ""): string {
	const number = toFiniteNumber(value);

	const sign = number < 0 ? "-" : "+";

	return `${sign}${formatNumber(Math.abs(number))}${unit}`;
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

function aggregateAttributes(items: UnlockT12HistoryEntry[]): TotalAttribute[] {
	const groupedAttributes = new Map<string, TotalAttribute>();

	for (const item of items) {
		const attributes = item.result?.attributes ?? [];

		for (const attribute of attributes) {
			const name = normalizeText(attribute.name);
			const unit = normalizeText(attribute.unit);
			const value = toFiniteNumber(attribute.value);

			if (!name) {
				continue;
			}

			/*
			 * Attribute dengan nama sama tetapi unit berbeda
			 * tidak boleh digabung.
			 *
			 * Contoh:
			 * Infantry Health 5%
			 * Infantry Health 500
			 */
			const groupKey = [name.toLowerCase(), unit.toLowerCase()].join(":");

			const current = groupedAttributes.get(groupKey);

			if (current) {
				current.value += value;
				continue;
			}

			groupedAttributes.set(groupKey, {
				name,
				value,
				unit,
			});
		}
	}

	return Array.from(groupedAttributes.values())
		.filter((attribute) => attribute.value !== 0)
		.sort((first, second) => first.name.localeCompare(second.name));
}

function getUniqueResearchNames(items: UnlockT12HistoryEntry[]): string[] {
	return Array.from(
		new Set(
			items.map((item) => normalizeText(item.result?.research)).filter(Boolean),
		),
	);
}

function getUniqueCategories(items: UnlockT12HistoryEntry[]): string[] {
	return Array.from(
		new Set(
			items.map((item) => normalizeText(item.result?.category)).filter(Boolean),
		),
	);
}

export default function UnlockT12TotalResult({
	items,
	title = "Total Result",
}: UnlockT12TotalResultProps) {
	const warAcademyNavigation = NAVIGATION.find(
		(item) => item.id === "war-academy",
	);

	const validItems = items.filter((item) => Boolean(item.result));

	const resources = sumResources(validItems);

	const totalPower = sumNumber(validItems, (item) => item.result?.power);

	const attributes = aggregateAttributes(validItems);

	const researchNames = getUniqueResearchNames(validItems);

	const categories = getUniqueCategories(validItems);

	const { createResourceItem } = useCompareResources(resources);

	const powerItems = [
		{
			id: "total-power-increase",
			label: "Power Increase",
			icon: "/icons/power.png",
			value: formatSignedValue(totalPower),
			valueClassName:
				totalPower > 0 ? "text-yellow-500" : "text-[var(--sl-text-muted)]",
		},
		{
			id: "total-calculations",
			label: "Calculations",
			icon: "/icons/Buff.png",
			value: formatNumber(validItems.length),
		},
	];

	const attributeItems = attributes.map((attribute, index) => ({
		id: [
			"total-attribute",
			index,
			normalizeId(attribute.name),
			normalizeId(attribute.unit || "flat"),
		].join("-"),

		label: attribute.name,
		icon: "/icons/Buff.png",

		value: formatSignedValue(attribute.value, attribute.unit),

		valueClassName:
			attribute.value !== 0 ? "text-white" : "text-[var(--sl-text-muted)]",
	}));

	const baseResourceItems = [
		...(resources.Steel > 0 ? [createResourceItem("Steel")] : []),
	];

	const fireCrystalItems = [
		...(resources.RFC > 0 ? [createResourceItem("RFC")] : []),

		...(resources.Shard > 0 ? [createResourceItem("Shard")] : []),
	];

	const firstItem = validItems[0];

	const resultName =
		researchNames.length === 1
			? researchNames[0]
			: `${validItems.length} Unlock T12 Calculations`;

	const subtitle =
		categories.length === 1
			? categories[0]
			: categories.length > 1
				? categories.join(", ")
				: researchNames.length > 1
					? researchNames.join(", ")
					: "Combined Unlock T12 calculation";

	const sections = [
		{
			id: "total-power",
			title: "Power",
			icon: <Zap size={18} />,
			items: powerItems,
		},

		...(attributeItems.length > 0
			? [
					{
						id: "total-attributes",
						title: "Attributes",
						icon: <ShieldCheck size={18} />,
						items: attributeItems,
					},
				]
			: []),

		...(baseResourceItems.length > 0
			? [
					{
						id: "total-base-resources",
						title: "Base Resources",
						icon: <BriefcaseBusiness size={18} />,
						items: baseResourceItems,
					},
				]
			: []),

		...(fireCrystalItems.length > 0
			? [
					{
						id: "total-fire-crystals",
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
			categoryTitle="Flame Tech"
			categoryIcon={warAcademyNavigation?.icon ?? "/category/war-academy.png"}
			name={resultName}
			subtitle={subtitle}
			highlightLabel="Total Power Increase"
			highlightValue={formatSignedValue(totalPower)}
			createdAt={firstItem?.createdAt}
			sections={sections}
		/>
	);
}
