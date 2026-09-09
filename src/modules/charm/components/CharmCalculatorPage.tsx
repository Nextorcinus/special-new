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

import CharmForm from "./CharmForm";
import CharmResult from "./CharmResult";
import CharmTotalResult from "./CharmTotalResult";

import type {
	CharmCalculationResult,
	CharmDataItem,
	CharmFormValues,
} from "../type";

type CharmCalculatorPageProps = {
	data: CharmDataItem[];
};

type CharmHistoryItem = CalculationHistoryItem<
	CharmFormValues,
	CharmCalculationResult
>;

type CharmHistoryEntry = CalculationHistoryEntry<
	CharmFormValues,
	CharmCalculationResult
>;

type HistoryStoreState = ReturnType<
	typeof useHistoryStore.getState
>;

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

function CharmCalculatorPageContent({
	data,
}: CharmCalculatorPageProps) {
	const searchParams = useSearchParams();

	const historyId = searchParams.get("historyId");

	const [activeHistory, setActiveHistory] =
		useState<CharmHistoryItem | null>(null);

	const [formKey, setFormKey] =
		useState("charm-new");

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

	const addCalculationItem = useHistoryStore(
		(state: HistoryStoreState) =>
			state.addCalculationItem,
	);

	const completeCalculationItem = useHistoryStore(
		(state: HistoryStoreState) =>
			state.completeCalculationItem,
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
		if (
			!historyId ||
			items.length === 0
		) {
			return;
		}

		const selected = items.find(
			(item) =>
				String(item.id) === historyId &&
				item.module === "charm",
		);

		if (!selected) {
			return;
		}

		setActiveHistory(
			selected as CharmHistoryItem,
		);

		setIsEditingHistory(true);
		setIsAddingItem(false);

		setFormKey(
			`charm-history-${selected.id}`,
		);
	}, [historyId, items]);

	const historyItems: CharmHistoryEntry[] =
		activeHistory?.items &&
		activeHistory.items.length > 0
			? (
					activeHistory.items as CharmHistoryEntry[]
				).map((item) => ({
					...item,
					completed:
						item.completed ?? false,
				}))
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
							completed: false,
						},
					]
				: [];

	const completedCount =
		historyItems.filter(
			(item) => item.completed === true,
		).length;

	const totalCount =
		historyItems.length;

	const completedPercentage =
		totalCount > 0
			? Math.round(
					(completedCount /
						totalCount) *
						100,
				)
			: 0;

	const initialValues =
		activeHistory &&
		!isAddingItem
			? (activeHistory.form as CharmFormValues)
			: null;

	const isUpdateMode =
		isEditingHistory &&
		!isAddingItem;

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

	function handleCalculate(
		result: CharmCalculationResult,
	) {
		const payload =
			buildHistoryPayload(result);

		if (
			activeHistory &&
			isAddingItem
		) {
			const updated =
				addCalculationItem(
					activeHistory.id,
					payload,
				);

			if (!updated) {
				return;
			}

			setActiveHistory(
				updated as CharmHistoryItem,
			);

			setIsAddingItem(false);
			setIsEditingHistory(false);

			setFormKey(
				`charm-result-${updated.id}-${Date.now()}`,
			);

			return;
		}

		if (
			activeHistory &&
			isEditingHistory
		) {
			const updated =
				updateCalculation(
					activeHistory.id,
					payload,
				);

			if (!updated) {
				return;
			}

			setActiveHistory(
				updated as CharmHistoryItem,
			);

			setIsAddingItem(false);
			setIsEditingHistory(true);

			setFormKey(
				`charm-history-${updated.id}`,
			);

			return;
		}

		const saved =
			saveCalculation(payload);

		setActiveHistory(
			saved as CharmHistoryItem,
		);

		setIsEditingHistory(false);
		setIsAddingItem(false);

		setFormKey(
			`charm-new-${Date.now()}`,
		);
	}

	function handleCompleteItem(
		entryId: string,
	) {
		if (!activeHistory) {
			return;
		}

		const updated =
			completeCalculationItem(
				activeHistory.id,
				entryId,
			);

		if (!updated.history) {
			return;
		}

		setActiveHistory(
			updated.history as CharmHistoryItem,
		);
	}

	function handleAddItem() {
		if (!activeHistory) {
			return;
		}

		setIsAddingItem(true);
		setIsEditingHistory(false);

		setFormKey(
			`charm-add-item-${Date.now()}`,
		);

		scrollToForm();
	}

	function handleNewCalculation() {
		setActiveHistory(null);
		setIsEditingHistory(false);
		setIsAddingItem(false);

		setFormKey(
			`charm-new-${Date.now()}`,
		);

		scrollToForm();
	}

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

				{activeHistory &&
					historyItems.length > 0 && (
						<div className="space-y-5">
							{totalCount > 1 && (
								<div className="rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-input)] p-4">
									<div className="flex items-center justify-between gap-4">
										<div className="min-w-0">
											<p className="text-sm font-semibold text-[var(--sl-text)]">
												Charm Progress
											</p>

											<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
												{completedCount}{" "}
												of{" "}
												{totalCount}{" "}
												charms completed
											</p>
										</div>

										<div className="shrink-0 text-sm font-bold text-[var(--sl-text)]">
											{completedPercentage}
											%
										</div>
									</div>

									<div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/20">
										<div
											className="h-full rounded-full bg-[var(--sl-text)] transition-[width] duration-300"
											style={{
												width: `${completedPercentage}%`,
											}}
										/>
									</div>
								</div>
							)}

							<CalculationGroupResult
								items={
									historyItems
								}
								getKey={(
									item,
								) =>
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
										entryId={
											item.id
										}
										completed={
											item.completed ??
											false
										}
										onCompleted={() =>
											handleCompleteItem(
												item.id,
											)
										}
										title={
											index ===
											0
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
									<CharmTotalResult
										items={
											groupItems
										}
									/>
								)}
							/>
						</div>
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