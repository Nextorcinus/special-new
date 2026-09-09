"use client";

import { ArrowRight, BriefcaseBusiness, Clock3, Gem, Plus } from "lucide-react";
import { useEffect } from "react";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import CalculationComplete from "@/components/calculator/CalculationComplete";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";
import { NAVIGATION } from "@/config/navigation";
import { RESOURCES, type ResourceKey } from "@/config/resources";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";
import { useInventoryStore } from "@/features/inventory/store/inventory.store";

type BuildingResultProps = {
	result: any;
	history?: CalculationHistoryItem | null;
	entryId?: string;
	completed?: boolean;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
	onCompleted?: () => void;
};

function formatSvs(value: unknown) {
	const num = Number(value || 0);

	if (!Number.isFinite(num)) {
		return "+0";
	}

	if (num >= 1_000_000) {
		return `+${(num / 1_000_000).toFixed(2)}M`;
	}

	if (num >= 1_000) {
		return `+${(num / 1_000).toFixed(1)}K`;
	}

	return `+${formatNumber(num)}`;
}

function getCompletionResources(
	resources: Partial<Record<ResourceKey, number>>,
) {
	return Object.entries(resources)
		.filter(([, amount]) => Number(amount ?? 0) > 0)
		.map(([resourceKey, amount]) => {
			const resource = RESOURCES[resourceKey as ResourceKey];

			return {
				resourceId: resource.id,
				amount: Number(amount ?? 0),
			};
		});
}

export default function BuildingResult({
	result,
	history,
	entryId,
	completed = false,
	title,
	showAddButton = false,
	onAddItem,
	onCompleted,
}: BuildingResultProps) {
	const loadResources = useInventoryStore(
		(state) => state.loadResources,
	);

	useEffect(() => {
		loadResources();
	}, [loadResources]);

	if (!result) {
		return null;
	}

	const resources = (result.resources ?? {}) as Partial<
		Record<ResourceKey, number>
	>;

	const category = NAVIGATION.find(
		(item) => item.id === "buildings",
	);

	const { createResourceItem } =
		useCompareResources(resources);

	const hasTimeReduction =
		result.timeOriginal !== result.timeReduced;

	const calculationEntryId =
		entryId ??
		history?.items?.[0]?.id ??
		(history ? `${history.id}_item` : "");

	const completionResources =
		getCompletionResources(resources);

	const subtitle = `Lv.${result.fromLevel ?? "-"} → Lv.${result.toLevel ?? "-"}`;

	return (
		<div
			className={[
				"space-y-3 transition-opacity duration-300",
				completed ? "opacity-65" : "opacity-100",
			].join(" ")}
		>
			<CalculatorResult
				title={title}
				categoryTitle={category?.title ?? "Buildings"}
				categoryIcon={
					category?.icon ??
					"/category/building-upgrade.png"
				}
				name={result.building ?? "-"}
				subtitle={subtitle}
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
								value:
									result.timeOriginal ??
									"-",
							},
							{
								id: "reduced-time",
								label: "Reduced",
								icon: "/icons/reducedTime.png",
								value:
									result.timeReduced ??
									"-",
								valueClassName:
									hasTimeReduction
										? "text-green-400"
										: "text-[var(--sl-text-muted)]",
							},
						],
					},
					{
						id: "resources",
						title: "Base Resources",
						icon: (
							<BriefcaseBusiness size={18} />
						),
						items: [
							createResourceItem("Meat"),
							createResourceItem("Wood"),
							createResourceItem("Coal"),
							createResourceItem("Iron"),
							createResourceItem("Steel"),
						],
					},
					{
						id: "fire-crystals",
						title: "Fire Crystals",
						icon: <Gem size={18} />,
						items: [
							createResourceItem("Crystal"),
							createResourceItem("RFC"),
							createResourceItem("Shard"),
						],
					},
				]}
			/>

			{history &&
				calculationEntryId &&
				completionResources.length > 0 && (
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
					className="mt-5 flex h-28 w-full flex-col items-center justify-center gap-2 rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-input-hover)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)]"
				>
					<Plus className="size-5" />
					<span className="text-base font-medium">
						Add more items
					</span>
				</button>
			)}
		</div>
	);
}