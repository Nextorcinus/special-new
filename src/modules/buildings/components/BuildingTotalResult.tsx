"use client";

import { BriefcaseBusiness, Clock3, Gem } from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { ResourceKey } from "@/config/resources";
import type { CalculationHistoryEntry } from "@/features/inventory/store/history/types";
import { sumField, sumResourceMap } from "@/lib/resources";
import { formatDuration, parseDurationToSeconds } from "@/lib/time";

type BuildingTotalResultProps = {
	items: CalculationHistoryEntry[];
};

const RESOURCE_KEYS: ResourceKey[] = [
	"Meat",
	"Wood",
	"Coal",
	"Iron",
	"Crystal",
	"RFC",
];

export default function BuildingTotalResult({
	items,
}: BuildingTotalResultProps) {
	const category = NAVIGATION.find((item) => item.id === "buildings");

	const resources = sumResourceMap(
		items,
		RESOURCE_KEYS,
		(item) => item.result?.resources,
	);

	const { createResourceItem } = useCompareResources(resources);

	const totalSvs = sumField(items, (item) => item.result?.svsFinal);

	const totalOriginal = sumField(items, (item) =>
		parseDurationToSeconds(item.result?.timeOriginal ?? ""),
	);

	const totalReduced = sumField(items, (item) =>
		parseDurationToSeconds(item.result?.timeReduced ?? ""),
	);

	return (
		<CalculatorResult
			title="Total Result"
			categoryTitle={category?.title ?? "Buildings"}
			categoryIcon={category?.icon ?? "/category/building-upgrade.png"}
			name={`${items.length} Building${items.length > 1 ? "s" : ""}`}
			highlightLabel="Total SvS"
			highlightValue={`+${formatNumber(totalSvs)}`}
			sections={[
				{
					id: "resources",
					title: "Base Resources",
					icon: <BriefcaseBusiness size={18} />,
					items: [
						createResourceItem("Meat"),
						createResourceItem("Wood"),
						createResourceItem("Coal"),
						createResourceItem("Iron"),
					],
				},
				{
					id: "fire-crystal",
					title: "Fire Crystals",
					icon: <Gem size={18} />,
					items: [createResourceItem("Crystal"), createResourceItem("RFC")],
				},
				{
					id: "time",
					title: "Time",
					icon: <Clock3 size={18} />,
					items: [
						{
							id: "total",
							label: "Total",
							icon: "/icons/totalTime.png",
							value: formatDuration(totalOriginal),
						},
						{
							id: "reduced",
							label: "Reduced",
							icon: "/icons/reducedTime.png",
							value: formatDuration(totalReduced),
						},
					],
				},
			]}
		/>
	);
}
