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
	CharmCalculationResult,
	CharmFormValues,
	CharmResourceMap,
	CharmTroopType,
} from "../type";
import { CHARM_STAT_LABEL_MAP } from "../type";

type CharmHistoryEntry = CalculationHistoryEntry<
	CharmFormValues,
	CharmCalculationResult
>;

type CharmTotalResultProps = {
	items: CharmHistoryEntry[];
	title?: string;
};

type TroopStatTotal = {
	power: number;
	lethality: number;
	health: number;
};

type TroopStatMap = Record<
	CharmTroopType,
	TroopStatTotal
>;

const RESOURCE_KEYS: Array<keyof CharmResourceMap> = [
	"Guide",
	"Design",
	"Jewel",
];

const EMPTY_TROOP_STATS: TroopStatMap = {
	Infantry: {
		power: 0,
		lethality: 0,
		health: 0,
	},
	Lancer: {
		power: 0,
		lethality: 0,
		health: 0,
	},
	Marksman: {
		power: 0,
		lethality: 0,
		health: 0,
	},
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

function createUpgradeSubtitle(
	items: CharmHistoryEntry[],
): string {
	const validItems = items.filter(
		(item) =>
			Boolean(item.result?.fromLevel) &&
			Boolean(item.result?.toLevel),
	);

	if (validItems.length === 0) {
		return `${items.length} items`;
	}

	if (validItems.length === 1) {
		const result = validItems[0].result;

		return `Lv.${result.fromLevel} → Lv.${result.toLevel}`;
	}

	return `${validItems.length} upgrade items`;
}

function getTroopType(
	result?: CharmCalculationResult,
): CharmTroopType | null {
	if (!result) {
		return null;
	}

	if (result.stats?.troopType) {
		return result.stats.troopType;
	}

	if (result.type) {
		return CHARM_STAT_LABEL_MAP[result.type];
	}

	return null;
}

function calculateTroopStats(
	items: CharmHistoryEntry[],
): TroopStatMap {
	return items.reduce<TroopStatMap>(
		(total, item) => {
			const result = item.result;
			const troopType = getTroopType(result);

			if (!result || !troopType) {
				return total;
			}

			const power = Number(
				result.stats?.powerIncrease ?? 0,
			);

			const lethality = Number(
				result.stats?.lethalityIncrease ?? 0,
			);

			const health = Number(
				result.stats?.healthIncrease ?? 0,
			);

			total[troopType].power += Number.isFinite(power)
				? power
				: 0;

			total[troopType].lethality += Number.isFinite(
				lethality,
			)
				? lethality
				: 0;

			total[troopType].health += Number.isFinite(health)
				? health
				: 0;

			return total;
		},
		{
			Infantry: {
				...EMPTY_TROOP_STATS.Infantry,
			},
			Lancer: {
				...EMPTY_TROOP_STATS.Lancer,
			},
			Marksman: {
				...EMPTY_TROOP_STATS.Marksman,
			},
		},
	);
}

function createTroopStatSections(
	troopStats: TroopStatMap,
) {
	const troopTypes: CharmTroopType[] = [
		"Infantry",
		"Lancer",
		"Marksman",
	];

	return troopTypes
		.filter((troopType) => {
			const stats = troopStats[troopType];

			return (
				stats.power !== 0 ||
				stats.lethality !== 0 ||
				stats.health !== 0
			);
		})
		.map((troopType) => {
			const stats = troopStats[troopType];
			const troopId = troopType.toLowerCase();

			return {
				id: `${troopId}-stats`,
				title: `${troopType} Stats`,
				items: [
					{
						id: `${troopId}-lethality`,
						label: "Lethality",
						icon: "/icons/lethality.png",
						value: formatStat(stats.lethality),
					},
					{
						id: `${troopId}-health`,
						label: "Health",
						icon: "/icons/health.png",
						value: formatStat(stats.health),
					},
					{
						id: `${troopId}-power`,
						label: "Power",
						icon: "/icons/power.png",
						value: formatPower(stats.power),
					},
				],
			};
		});
}

export default function CharmTotalResult({
	items,
	title = "Total Result",
}: CharmTotalResultProps) {
	const category = NAVIGATION.find(
		(item) => item.id === "charm",
	);

	const resources = sumResourceMap(
		items,
		RESOURCE_KEYS,
		(item) => item.result?.resources,
	);

	const totalBaseSvsPoints = sumField(
		items,
		(item) => item.result?.baseSvsPoints,
	);

	const totalValeriaBonusPoints = sumField(
		items,
		(item) => item.result?.valeriaBonusPoints,
	);

	const totalSvsPoints = sumField(
		items,
		(item) => item.result?.svsPoints,
	);

	const troopStats = calculateTroopStats(items);
	const troopStatSections =
		createTroopStatSections(troopStats);

	const { createResourceItem } =
		useCompareResources(resources);

	const firstItem = items[0];
	const lastItem = items.at(-1);

	return (
		<CalculatorResult
			title={title}
			categoryTitle={
				category?.title ?? "Chief Charm"
			}
			categoryIcon={
				category?.icon ??
				"/category/chief-charm.png"
			}
			name={`${items.length} Chief Charm Upgrades`}
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
						createResourceItem("Guide"),
						createResourceItem("Design"),
						createResourceItem("Jewel"),
					],
				},
				...troopStatSections,
				{
					id: "valeria",
					title: "Valeria Bonus",
					items: [
						{
							id: "base-svs-points",
							label: "Base SvS Points",
							icon: "/icons/svs.png",
							value: formatSvs(
								totalBaseSvsPoints,
							),
						},
						{
							id: "valeria-bonus-points",
							label: "Bonus SvS Points",
							icon: "/icons/valeria.png",
							value: formatSvs(
								totalValeriaBonusPoints,
							),
						},
					],
				},
			]}
		/>
	);
}