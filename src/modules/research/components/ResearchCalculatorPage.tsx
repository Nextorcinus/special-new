"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import CalculationGroupResult from "@/components/calculator/CalculationGroupResult";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import type {
	CalculationHistoryEntry,
	CalculationHistoryItem,
} from "@/features/inventory/store/history/types";

import { calculateResearch } from "../calculator";
import type {
	ResearchCalculationResult,
	ResearchCategory,
	ResearchDatabase,
	ResearchFormValues,
} from "../type";
import ResearchForm from "./ResearchForm";
import ResearchResult from "./ResearchResult";
import ResearchTotalResult from "./ResearchTotalResult";

type ResearchCalculatorPageProps = {
	category: ResearchCategory;
	data: ResearchDatabase;
};

type ResearchHistoryItem = CalculationHistoryItem<
	ResearchFormValues,
	ResearchCalculationResult
>;

type ResearchHistoryEntry = CalculationHistoryEntry<
	ResearchFormValues,
	ResearchCalculationResult
>;

type HistoryStoreState = ReturnType<
	typeof useHistoryStore.getState
>;

export default function ResearchCalculatorPage({
	category,
	data,
}: ResearchCalculatorPageProps) {
	const searchParams = useSearchParams();
	const historyId = searchParams.get("historyId");

	const [activeHistory, setActiveHistory] =
		useState<ResearchHistoryItem | null>(null);

	const [formKey, setFormKey] = useState("new");
	const [isAddingItem, setIsAddingItem] = useState(false);
	const [isEditingHistory, setIsEditingHistory] =
		useState(false);

	const formRef = useRef<HTMLDivElement>(null);

	const items = useHistoryStore(
		(state: HistoryStoreState) => state.items,
	);

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
		if (!historyId || items.length === 0) {
			return;
		}

		const selected = items.find(
			(item) => String(item.id) === historyId,
		);

		if (
			!selected ||
			selected.module !== "research" ||
			selected.category !== category
		) {
			return;
		}

		const researchHistory =
			selected as ResearchHistoryItem;

		setActiveHistory(researchHistory);
		setIsEditingHistory(true);
		setIsAddingItem(false);
		setFormKey(String(researchHistory.id));
	}, [category, historyId, items]);

	const historyItems: ResearchHistoryEntry[] =
		activeHistory?.items &&
		activeHistory.items.length > 0
			? (activeHistory.items as ResearchHistoryEntry[])
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

	const initialValues: Partial<ResearchFormValues> | undefined =
		activeHistory && !isAddingItem
			? {
					...activeHistory.form,
					category,
				}
			: {
					category,
				};

	const isUpdateMode =
		isEditingHistory && !isAddingItem;

	function buildHistoryPayload(
		form: ResearchFormValues,
		result: ResearchCalculationResult,
	) {
		return {
			module: "research" as const,
			category,
			title: result.research || "Research",
			subtitle: `Tier ${result.tier} · Lv.${result.fromLevel} → Lv.${result.toLevel}`,
			form,
			result,
		};
	}

	function handleCalculate(
		values: ResearchFormValues,
	) {
		const formValues: ResearchFormValues = {
			...values,
			category,
		};

		const result = calculateResearch({
			data,
			values: formValues,
		});

		const payload = buildHistoryPayload(
			formValues,
			result,
		);

		if (activeHistory && isAddingItem) {
			const updated = addCalculationItem(
				activeHistory.id,
				payload,
			) as ResearchHistoryItem | undefined;

			if (updated) {
				setActiveHistory(updated);
				setIsAddingItem(false);
				setIsEditingHistory(false);
				setFormKey(String(updated.id));
			}

			return;
		}

		if (activeHistory) {
			const updated = updateCalculation(
				activeHistory.id,
				payload,
			) as ResearchHistoryItem | undefined;

			if (updated) {
				setActiveHistory(updated);
				setIsAddingItem(false);
				setIsEditingHistory(true);
				setFormKey(String(updated.id));
			}

			return;
		}

		const saved = saveCalculation(
			payload,
		) as ResearchHistoryItem;

		setActiveHistory(saved);
		setIsEditingHistory(false);
		setIsAddingItem(false);
		setFormKey(String(saved.id));
	}

	function handleAddItem() {
		if (!activeHistory) {
			return;
		}

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
				<div
					ref={formRef}
					className="p-4"
				>
				<ResearchForm
	key={formKey}
	category={category}
	data={data}
	onSubmit={handleCalculate}
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
							<ResearchResult
								result={item.result}
								history={activeHistory}
								title={
									index === 0
										? "Result"
										: undefined
								}
								showAddButton={
									index ===
									historyItems.length - 1
								}
								onAddItem={handleAddItem}
							/>
						)}
						renderTotal={(groupItems) => (
							<ResearchTotalResult
								items={groupItems}
							/>
						)}
					/>
				)}

				{activeHistory && (
					<button
						type="button"
						onClick={handleNewCalculation}
						className="rounded-full bg-[var(--sl-input)] px-4 py-2 text-sm font-semibold text-[var(--sl-text)] transition hover:bg-[var(--sl-input-hover)]"
					>
						New Calculation
					</button>
				)}
			</div>
		</div>
	);
}