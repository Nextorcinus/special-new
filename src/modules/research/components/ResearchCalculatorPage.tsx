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

/*
 * ================================================================
 * Main Page
 * ================================================================
 */

export default function ResearchCalculatorPage(
	props: ResearchCalculatorPageProps,
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
			<ResearchCalculatorPageContent
				{...props}
			/>
		</Suspense>
	);
}

/*
 * ================================================================
 * Page Content
 *
 * useSearchParams() MUST be inside this component because this
 * component is rendered inside Suspense.
 * ================================================================
 */

function ResearchCalculatorPageContent({
	category,
	data,
}: ResearchCalculatorPageProps) {
	const searchParams = useSearchParams();

	const historyId =
		searchParams.get("historyId");

	const [activeHistory, setActiveHistory] =
		useState<ResearchHistoryItem | null>(
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

	const saveCalculation = useHistoryStore(
		(state: HistoryStoreState) =>
			state.saveCalculation,
	);

	const updateCalculation = useHistoryStore(
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
				String(item.id) ===
				historyId,
		);

		if (
			!selected ||
			selected.module !==
				"research" ||
			selected.category !==
				category
		) {
			return;
		}

		const researchHistory =
			selected as ResearchHistoryItem;

		setActiveHistory(
			researchHistory,
		);

		setIsEditingHistory(true);
		setIsAddingItem(false);

		setFormKey(
			String(researchHistory.id),
		);
	}, [
		category,
		historyId,
		items,
	]);

	/*
	 * ================================================================
	 * History items
	 * ================================================================
	 */

	const historyItems: ResearchHistoryEntry[] =
		activeHistory?.items &&
		activeHistory.items.length > 0
			? (activeHistory.items as ResearchHistoryEntry[])
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

	const initialValues:
		| Partial<ResearchFormValues>
		| undefined =
		activeHistory &&
		!isAddingItem
			? {
					...activeHistory.form,
					category,
				}
			: {
					category,
				};

	const isUpdateMode =
		isEditingHistory &&
		!isAddingItem;

	/*
	 * ================================================================
	 * Build history payload
	 * ================================================================
	 */

	function buildHistoryPayload(
		form: ResearchFormValues,
		result: ResearchCalculationResult,
	) {
		return {
			module: "research" as const,
			category,
			title:
				result.research ||
				"Research",
			subtitle: `Tier ${result.tier} · Lv.${result.fromLevel} → Lv.${result.toLevel}`,
			form,
			result,
		};
	}

	/*
	 * ================================================================
	 * Calculate
	 * ================================================================
	 */

	function handleCalculate(
		values: ResearchFormValues,
	) {
		const formValues: ResearchFormValues =
			{
				...values,
				category,
			};

		const result =
			calculateResearch({
				data,
				values: formValues,
			});

		const payload =
			buildHistoryPayload(
				formValues,
				result,
			);

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
				) as
					| ResearchHistoryItem
					| undefined;

			if (updated) {
				setActiveHistory(
					updated,
				);

				setIsAddingItem(false);
				setIsEditingHistory(false);

				setFormKey(
					String(updated.id),
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
				) as
					| ResearchHistoryItem
					| undefined;

			if (updated) {
				setActiveHistory(
					updated,
				);

				setIsAddingItem(false);
				setIsEditingHistory(true);

				setFormKey(
					String(updated.id),
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
			) as ResearchHistoryItem;

		setActiveHistory(saved);

		setIsEditingHistory(false);
		setIsAddingItem(false);

		setFormKey(
			String(saved.id),
		);
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
					<ResearchForm
						key={formKey}
						category={category}
						data={data}
						onSubmit={
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
							<ResearchResult
								result={
									item.result
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
							groupItems,
						) => (
							<ResearchTotalResult
								items={
									groupItems
								}
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