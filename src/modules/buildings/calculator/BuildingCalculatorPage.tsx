"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import CalculationGroupResult from "@/components/calculator/CalculationGroupResult";
import HistoryPanel from "@/features/inventory/components/HistoryPanel";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";
import type { BuildingType } from "@/modules/buildings/calculator/calculateUpgrade";
import BuildingForm from "@/modules/buildings/components/BuildingForm";
import BuildingResult from "@/modules/buildings/components/BuildingResult";
import BuildingTotalResult from "@/modules/buildings/components/BuildingTotalResult";
import type { BuildingFormValues } from "@/modules/buildings/types";

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
	const [formKey, setFormKey] = useState("new");
	const [isAddingItem, setIsAddingItem] = useState(false);
	const formRef = useRef<HTMLDivElement>(null);

	const items = useHistoryStore((state: HistoryStoreState) => state.items);
	const loadHistory = useHistoryStore(
		(state: HistoryStoreState) => state.loadHistory,
	);
	const saveCalculation = useHistoryStore(
		(state: HistoryStoreState) => state.saveCalculation,
	);
	const updateCalculation = useHistoryStore(
		(state: HistoryStoreState) => state.updateCalculation,
	);
	const addCalculationItem = useHistoryStore(
		(state: HistoryStoreState) => state.addCalculationItem,
	);
	const togglePinHistory = useHistoryStore(
		(state: HistoryStoreState) => state.togglePinHistory,
	);
	const deleteHistory = useHistoryStore(
		(state: HistoryStoreState) => state.deleteHistory,
	);
	const clearHistory = useHistoryStore(
		(state: HistoryStoreState) => state.clearHistory,
	);

	function scrollToForm() {
		requestAnimationFrame(() => {
			formRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		});
	}

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	useEffect(() => {
		if (!historyId || items.length === 0) return;

		const selected = items.find((item) => item.id === historyId);

		if (!selected) return;

		setActiveHistory(selected);
		setIsAddingItem(false);
		setFormKey(selected.id);
	}, [historyId, items]);

	const buildingHistories = useMemo(() => {
		return items.filter(
			(item) => item.module === "buildings" && item.category === type,
		);
	}, [items, type]);

	const historyItems =
		activeHistory?.items && activeHistory.items.length > 0
			? activeHistory.items
			: activeHistory
				? [
						{
							id: activeHistory.id,
							title: activeHistory.title,
							subtitle: activeHistory.subtitle,
							form: activeHistory.form,
							result: activeHistory.result,
							createdAt: activeHistory.createdAt,
						},
					]
				: [];

	const initialValues =
		activeHistory && !isAddingItem
			? (activeHistory.form as BuildingFormValues)
			: null;

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
		setIsAddingItem(false);
		setFormKey(item.id);
	}

	function handleCalculate(result: any) {
		const payload = buildHistoryPayload(result);

		if (activeHistory && isAddingItem) {
			const updated = addCalculationItem(activeHistory.id, payload);

			if (updated) {
				setActiveHistory(updated);
				setIsAddingItem(false);
				setFormKey(updated.id);
			}

			return;
		}

		if (activeHistory) {
			const updated = updateCalculation(activeHistory.id, payload);

			if (updated) {
				setActiveHistory(updated);
				setFormKey(updated.id);
			}

			return;
		}

		const saved = saveCalculation(payload);

		setActiveHistory(saved);
		setIsAddingItem(false);
		setFormKey(saved.id);
	}
	function handleAddItem() {
		if (!activeHistory) return;

		setIsAddingItem(true);
		setFormKey(`add-item-${Date.now()}`);
		scrollToForm();
	}
	function handleDeleteHistory(id: string) {
		deleteHistory(id);

		if (activeHistory?.id === id) {
			setActiveHistory(null);
			setIsAddingItem(false);
			setFormKey("new");
		}
	}

	function handleClearBuildingHistory() {
		clearHistory("buildings");
		setActiveHistory(null);
		setIsAddingItem(false);
		setFormKey("new");
	}

	function handleNewCalculation() {
		setActiveHistory(null);
		setIsAddingItem(false);
		setFormKey(`new-${Date.now()}`);
		scrollToForm();
	}

	return (
		<div className="grid gap-6">
			<div className="space-y-6">
				<div ref={formRef}>
					<BuildingForm
						key={formKey}
						type={type}
						data={data}
						onCalculate={handleCalculate}
						initialValues={initialValues}
					/>
				</div>

				{activeHistory && (
					<CalculationGroupResult
						items={historyItems}
						getKey={(item) => item.id}
						renderItem={(item, index) => (
							<BuildingResult
								result={item.result}
								history={activeHistory}
								title={index === 0 ? "Result" : undefined}
							/>
						)}
						renderTotal={(items) => <BuildingTotalResult items={items} />}
					/>
				)}

				{activeHistory && (
					<div className="flex flex-wrap gap-3">
						<button
							type="button"
							onClick={handleAddItem}
							className="rounded-full bg-teal-500/20 px-4 py-2 text-sm font-semibold text-teal-300"
						>
							+ Add Item
						</button>

						<button
							type="button"
							onClick={handleNewCalculation}
							className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white"
						>
							New Calculation
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
