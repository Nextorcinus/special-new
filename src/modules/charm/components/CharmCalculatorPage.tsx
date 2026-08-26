"use client";

import { ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
	Suspense,
	useEffect,
	useRef,
	useState,
} from "react";

import CalculationGroupResult from "@/components/calculator/CalculationGroupResult";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";

import type {
	CharmCalculationResult,
	CharmDataItem,
	CharmFormValues,
} from "../type";

import CharmForm from "./CharmForm";
import CharmResult from "./CharmResult";
import CharmTotalResult from "./CharmTotalResult";

type CharmCalculatorPageProps = {
	data: CharmDataItem[];
};

type HistoryStoreState = ReturnType<
	typeof useHistoryStore.getState
>;

/*
 * ================================================================
 * Main Page
 * ================================================================
 */

export default function CharmCalculatorPage(
	props: CharmCalculatorPageProps,
) {
	return (
		<Suspense
			fallback={
				<div className="grid gap-6">
					<div className="space-y-6 p-4">
						<div className="flex min-h-[200px] items-center justify-center">
							<div className="text-sm text-[var(--sl-text-muted)]">
								Loading...
							</div>
						</div>
					</div>
				</div>
			}
		>
			<CharmCalculatorPageContent
				{...props}
			/>
		</Suspense>
	);
}

/*
 * ================================================================
 * Page Content
 *
 * useSearchParams() is inside this component because this
 * component is rendered inside Suspense.
 * ================================================================
 */

function CharmCalculatorPageContent({
	data,
}: CharmCalculatorPageProps) {
	const searchParams =
		useSearchParams();

	const historyId =
		searchParams.get("historyId");

	const [activeHistory, setActiveHistory] =
		useState<CalculationHistoryItem | null>(
			null,
		);

	const [formKey, setFormKey] =
		useState("new");

	const [isAddingItem, setIsAddingItem] =
		useState(false);

	const [isEditingHistory, setIsEditingHistory] =
		useState(false);

	const formRef =
		useRef<HTMLDivElement>(null);

	const items = useHistoryStore(
		(state: HistoryStoreState) =>
			state.items,
	);

	const loadHistory = useHistoryStore(
		(state: HistoryStoreState) =>
			state.loadHistory,
	);

	const saveCalculation =
		useHistoryStore(
			(state: HistoryStoreState) =>
				state.saveCalculation,
		);

	const updateCalculation =
		useHistoryStore(
			(state: HistoryStoreState) =>
				state.updateCalculation,
		);

	const addCalculationItem =
		useHistoryStore(
			(state: HistoryStoreState) =>
				state.addCalculationItem,
		);

	/*
	 * ================================================================
	 * Scroll to form
	 * ================================================================
	 */

	function scrollToForm() {
		requestAnimationFrame(() => {
			formRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		});
	}

	/*
	 * ================================================================
	 * Load history
	 * ================================================================
	 */

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	/*
	 * ================================================================
	 * Load selected history from URL
	 * ================================================================
	 */

	useEffect(() => {
		if (
			!historyId ||
			items.length === 0
		) {
			return;
		}

		const selected = items.find(
			(item) =>
				item.id === historyId &&
				item.module === "charm",
		);

		if (!selected) {
			return;
		}

		setActiveHistory(selected);
		setIsEditingHistory(true);
		setIsAddingItem(false);
		setFormKey(selected.id);
	}, [historyId, items]);

	/*
	 * ================================================================
	 * History items
	 * ================================================================
	 */

	const historyItems =
		activeHistory?.items &&
		activeHistory.items.length > 0
			? activeHistory.items
			: activeHistory
				? [
						{
							id: activeHistory.id,
							title:
								activeHistory.title,
							subtitle:
								activeHistory.subtitle,
							form:
								activeHistory.form,
							result:
								activeHistory.result,
							createdAt:
								activeHistory.createdAt,
						},
					]
				: [];

	/*
	 * ================================================================
	 * Initial form values
	 * ================================================================
	 */

	const initialValues =
		activeHistory &&
		!isAddingItem
			? (activeHistory.form as CharmFormValues)
			: null;

	const isUpdateMode =
		isEditingHistory &&
		!isAddingItem;

	/*
	 * ================================================================
	 * Build history payload
	 * ================================================================
	 */

	function buildHistoryPayload(
		result: CharmCalculationResult,
	) {
		return {
			module: "charm" as const,
			title: `${result.type} Charm`,
			subtitle: `Lv.${result.fromLevel} → Lv.${result.toLevel}`,
			form: result.form,
			result,
		};
	}

	/*
	 * ================================================================
	 * Calculate
	 * ================================================================
	 */

	function handleCalculate(
		result: CharmCalculationResult,
	) {
		const payload =
			buildHistoryPayload(result);

		/*
		 * Add item to existing history
		 */

		if (
			activeHistory &&
			isAddingItem
		) {
			const updated =
				addCalculationItem(
					activeHistory.id,
					payload,
				);

			if (updated) {
				setActiveHistory(
					updated,
				);

				setIsAddingItem(false);
				setIsEditingHistory(false);

				setFormKey(
					updated.id,
				);
			}

			return;
		}

		/*
		 * Update existing history
		 */

		if (activeHistory) {
			const updated =
				updateCalculation(
					activeHistory.id,
					payload,
				);

			if (updated) {
				setActiveHistory(
					updated,
				);

				setFormKey(
					updated.id,
				);
			}

			return;
		}

		/*
		 * Create new history
		 */

		const saved =
			saveCalculation(
				payload,
			);

		setActiveHistory(saved);
		setIsEditingHistory(false);
		setIsAddingItem(false);

		setFormKey(saved.id);
	}

	/*
	 * ================================================================
	 * Add calculation item
	 * ================================================================
	 */

	function handleAddItem() {
		if (!activeHistory) {
			return;
		}

		setIsAddingItem(true);
		setIsEditingHistory(false);

		setFormKey(
			`add-item-${Date.now()}`,
		);

		scrollToForm();
	}

	/*
	 * ================================================================
	 * New calculation
	 * ================================================================
	 */

	function handleNewCalculation() {
		setActiveHistory(null);
		setIsEditingHistory(false);
		setIsAddingItem(false);

		setFormKey(
			`new-${Date.now()}`,
		);

		scrollToForm();
	}

	/*
	 * ================================================================
	 * Render
	 * ================================================================
	 */

	return (
		<div className="grid gap-6">
			<div className="space-y-6 p-4">
				<div ref={formRef}>
					<CharmForm
						key={formKey}
						data={data}
						onCalculate={
							handleCalculate
						}
						initialValues={
							initialValues
						}
						mode={
							isUpdateMode
								? "update"
								: "create"
						}
						lockMainFields={
							isUpdateMode
						}
					/>
				</div>

				{activeHistory && (
					<CalculationGroupResult
						items={historyItems}
						getKey={(item) =>
							item.id
						}
						renderItem={(
							item,
							index,
						) => (
							<CharmResult
								result={
									item.result as CharmCalculationResult
								}
								history={
									activeHistory
								}
								title={
									index === 0
										? "Result"
										: undefined
								}
								showAddButton={
									index ===
									historyItems.length -
										1
								}
								onAddItem={
									handleAddItem
								}
							/>
						)}
						renderTotal={(
							items,
						) => (
							<CharmTotalResult
								items={items}
							/>
						)}
					/>
				)}

				{activeHistory && (
					<div className="px-4 py-2">
						<button
							type="button"
							onClick={
								handleNewCalculation
							}
							className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--sl-input)] px-4 py-3 text-sm font-semibold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-input-hover)]"
						>
							<span>
								New Calculation
							</span>

							<ArrowRight className="size-4" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
}