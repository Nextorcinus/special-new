"use client";

import { useEffect } from "react";
import { ArrowRight, BriefcaseBusiness, Clock3, Gem } from "lucide-react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { ResourceKey } from "@/config/resources";
import { useInventoryStore } from "@/features/inventory/store/inventory.store";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";

type BuildingResultProps = {
	result: any;
	history?: CalculationHistoryItem | null;
};

function formatSvs(value: unknown) {
	const num = Number(value || 0);

	if (num >= 1_000_000) return `+${(num / 1_000_000).toFixed(2)}M`;
	if (num >= 1_000) return `+${(num / 1_000).toFixed(1)}K`;

	return `+${formatNumber(num)}`;
}

export default function BuildingResult({
	result,
	history,
}: BuildingResultProps) {
	const loadResources = useInventoryStore((state) => state.loadResources);

	useEffect(() => {
		loadResources();
	}, [loadResources]);

	if (!result) return null;

	const resources = (result.resources ?? {}) as Partial<
		Record<ResourceKey, number>
	>;

	const category = NAVIGATION.find((item) => item.id === "buildings");
	const { createResourceItem } = useCompareResources(resources);

	const hasTimeReduction = result.timeOriginal !== result.timeReduced;

	return (
		<CalculatorResult
			categoryTitle={category?.title ?? "Buildings"}
			categoryIcon={category?.icon ?? "/category/building-upgrade.png"}
			name={result.building ?? "-"}
			subtitle={
				<>
					<span>Lv.{result.fromLevel ?? "-"}</span>
					<ArrowRight className="size-4" />
					<span className="text-yellow-500">
						Lv.{result.toLevel ?? "-"}
					</span>
				</>
			}
			highlightValue={formatSvs(result.svsFinal)}
			highlightLabel="SvS Points"
			createdAt={history?.createdAt}
			updatedAt={history?.updatedAt}
			sections={[
				{
					id: "time",
					title: "Time",
					icon: <Clock3 size={18} />,
					items: [
						{
							id: "total-time",
							label: "Total",
							icon: "/icons/totalTime.png",
							value: result.timeOriginal ?? "-",
						},
						{
							id: "reduced-time",
							label: "Reduced",
							icon: "/icons/reducedTime.png",
							value: result.timeReduced ?? "-",
							valueClassName: hasTimeReduction
								? "text-white"
								: "text-white/35",
						},
					],
				},
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
					id: "fire-crystals",
					title: "Fire Crystals",
					icon: <Gem size={18} />,
					items: [
						createResourceItem("Crystal"),
						createResourceItem("RFC"),
					],
				},
			]}
		/>
	);
}