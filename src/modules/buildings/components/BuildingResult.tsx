"use client";

import { ArrowRight, BriefcaseBusiness, Clock3, Gem, Plus } from "lucide-react";
import { useEffect } from "react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import type { ResourceKey } from "@/config/resources";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";
import { useInventoryStore } from "@/features/inventory/store/inventory.store";

type BuildingResultProps = {
	result: any;
	history?: CalculationHistoryItem | null;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
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
	title,
	showAddButton = false,
	onAddItem,
}: BuildingResultProps) {
	const loadResources = useInventoryStore((state) => state.loadResources);

	useEffect(() => {
		loadResources();
	}, [loadResources]);

	const resources = (result?.resources ?? {}) as Partial<
		Record<ResourceKey, number>
	>;

	const category = NAVIGATION.find((item) => item.id === "buildings");
	const { createResourceItem } = useCompareResources(resources);

	if (!result) return null;

	const hasTimeReduction = result.timeOriginal !== result.timeReduced;

	return (
		<>
			<CalculatorResult
				title={title}
				categoryTitle={category?.title ?? "Buildings"}
				categoryIcon={category?.icon ?? "/category/building-upgrade.png"}
				name={result.building ?? "-"}
				subtitle={
					<>
						<span>Lv.{result.fromLevel ?? "-"}</span>
						<ArrowRight className="size-4" />
						<span className="text-yellow-500">Lv.{result.toLevel ?? "-"}</span>
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
									? "text-green-400"
									: "text-[var(--sl-text-muted)]",
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
						items: [createResourceItem("Crystal"), createResourceItem("RFC")],
					},
				]}
			/>

			{showAddButton && (
				<button
					type="button"
					onClick={onAddItem}
					className="mt-5 flex h-28 w-full flex-col items-center justify-center gap-2 rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-input-hover)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)]"
				>
					<Plus className="size-5" />
					<span className="text-base font-medium">Add more items</span>
				</button>
			)}
		</>
	);
}
