"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import BuildingForm from "@/modules/buildings/components/BuildingForm";
import BuildingResult from "@/modules/buildings/components/BuildingResult";
import type { BuildingType } from "@/modules/buildings/calculator/calculateUpgrade";
import type { BuildingFormValues } from "@/modules/buildings/types";

import HistoryPanel from "@/features/inventory/components/HistoryPanel";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";

type BuildingCalculatorPageProps = {
	type: BuildingType;
	data: any[];
};

type HistoryStoreState = ReturnType<typeof useHistoryStore.getState>;

export default function BuildingCalculatorPage({
	type,
	data,
}: BuildingCalculatorPageProps) {
	const searchParams = useSearchParams();
	const historyId = searchParams.get("historyId");

	const [activeHistory, setActiveHistory] =
		useState<CalculationHistoryItem | null>(null);

	const items = useHistoryStore((state: HistoryStoreState) => state.items);
	const loadHistory = useHistoryStore(
		(state: HistoryStoreState) => state.loadHistory
	);
	const saveCalculation = useHistoryStore(
		(state: HistoryStoreState) => state.saveCalculation
	);
	const updateCalculation = useHistoryStore(
		(state: HistoryStoreState) => state.updateCalculation
	);
	const togglePinHistory = useHistoryStore(
		(state: HistoryStoreState) => state.togglePinHistory
	);
	const deleteHistory = useHistoryStore(
		(state: HistoryStoreState) => state.deleteHistory
	);
	const clearHistory = useHistoryStore(
		(state: HistoryStoreState) => state.clearHistory
	);

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	useEffect(() => {
		if (!historyId || items.length === 0) return;

		const selected = items.find((item) => item.id === historyId);

		if (!selected) return;

		setActiveHistory(selected);
	}, [historyId, items]);

	const buildingHistories = useMemo(() => {
		return items.filter(
			(item) =>
				item.module === "buildings" && item.category === type
		);
	}, [items, type]);

	function buildHistoryPayload(result: any) {
		return {
			module: "buildings" as const,
			category: type,
			title: result.building ?? result.form?.building ?? "Buildings",
			subtitle: `Lv.${result.fromLevel ?? result.form?.fromLevel} → Lv.${
				result.toLevel ?? result.form?.toLevel
			}`,
			form: result.form,
			result,
		};
	}

	function handleSelectHistory(item: CalculationHistoryItem) {
		setActiveHistory(item);
	}

	function handleCalculate(result: any) {
		const payload = buildHistoryPayload(result);

		if (activeHistory) {
			const updated = updateCalculation(activeHistory.id, payload);

			if (updated) {
				setActiveHistory(updated);
			}

			return;
		}

		const saved = saveCalculation(payload);
		setActiveHistory(saved);
	}

	function handleDeleteHistory(id: string) {
		deleteHistory(id);

		if (activeHistory?.id === id) {
			setActiveHistory(null);
		}
	}

	function handleClearBuildingHistory() {
		clearHistory("buildings");
		setActiveHistory(null);
	}

	function handleNewCalculation() {
		setActiveHistory(null);
	}

	return (
		<div className="grid gap-6 lg:grid-cols-[1fr_360px]">
			<div className="space-y-6">
				<BuildingForm
					key={activeHistory?.id ?? "new"}
					type={type}
					data={data}
					onCalculate={handleCalculate}
					initialValues={
						(activeHistory?.form as BuildingFormValues) ?? null
					}
				/>

				{activeHistory && (
					<BuildingResult
						result={activeHistory.result}
						history={activeHistory}
					/>
				)}

				{activeHistory && (
					<button
						type="button"
						onClick={handleNewCalculation}
						className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
					>
						Add new calculation
					</button>
				)}
			</div>

			<HistoryPanel
				title="Building History"
				module="buildings"
				items={buildingHistories}
				activeId={activeHistory?.id ?? null}
				onSelect={handleSelectHistory}
				onDelete={handleDeleteHistory}
				onPin={togglePinHistory}
				onClear={handleClearBuildingHistory}
			/>
		</div>
	);
}