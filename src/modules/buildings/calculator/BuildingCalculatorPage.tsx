"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import CalculationGroupResult from "@/components/calculator/CalculationGroupResult";
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
	const [isEditingHistory, setIsEditingHistory] = useState(false);

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
		setIsEditingHistory(true);
		setIsAddingItem(false);
		setFormKey(selected.id);
	}, [historyId, items]);

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

	const isUpdateMode = isEditingHistory && !isAddingItem;

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

	function handleCalculate(result: any) {
		const payload = buildHistoryPayload(result);

		if (activeHistory && isAddingItem) {
			const updated = addCalculationItem(activeHistory.id, payload);

			if (updated) {
				setActiveHistory(updated);
				setIsAddingItem(false);
				setIsEditingHistory(false);
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
		setIsEditingHistory(false);
		setIsAddingItem(false);
		setFormKey(saved.id);
	}

	function handleAddItem() {
		if (!activeHistory) return;

		setIsAddingItem(true);
		setIsEditingHistory(false);
		setFormKey(`add-item-${Date.now()}`);
		scrollToForm();
	}

	function handleNewCalculation() {
		setActiveHistory(null);
		setIsEditingHistory(false);
		setIsAddingItem(false);
		setFormKey(`new-${Date.now()}`);
		scrollToForm();
	}

	return (
		<div className="grid gap-6">
			<div className="space-y-6">
				<div ref={formRef} className="p-4">
					<BuildingForm
						key={formKey}
						type={type}
						data={data}
						onCalculate={handleCalculate}
						initialValues={initialValues}
						mode={isUpdateMode ? "update" : "create"}
						lockMainFields={isUpdateMode}
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
								showAddButton={index === historyItems.length - 1}
								onAddItem={handleAddItem}
							/>
						)}
						renderTotal={(items) => <BuildingTotalResult items={items} />}
					/>
				)}

				{activeHistory && (
					<button
						type="button"
						onClick={handleNewCalculation}
						className="rounded-full bg-[var(--sl-input)] px-4 py-2 text-sm font-semibold text-[var(--sl-text)] hover:bg-[var(--sl-input-hover)]"
					>
						New Calculation
					</button>
				)}
			</div>
		</div>
	);
}
