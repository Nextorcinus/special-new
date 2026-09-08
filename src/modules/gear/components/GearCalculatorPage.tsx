"use client";

import { ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import CalculationGroupResult from "@/components/calculator/CalculationGroupResult";

import { useHistoryStore } from "@/features/inventory/store/history/history.store";

import type {
	CalculationHistoryEntry,
	CalculationHistoryItem,
} from "@/features/inventory/store/history/types";

import { useTutorial } from "@/features/tutorial";

import GearForm from "@/modules/gear/components/GearForm";
import GearResult from "@/modules/gear/components/GearResult";
import GearTotalResult from "@/modules/gear/components/GearTotalResult";

import type {
	GearCalculationResult,
	GearData,
	GearFormValues,
} from "@/modules/gear/type";

type GearCalculatorPageProps = {
	data: GearData;
};

type GearHistoryItem = CalculationHistoryItem<
	GearFormValues,
	GearCalculationResult
>;

type GearHistoryEntry = CalculationHistoryEntry<
	GearFormValues,
	GearCalculationResult
>;

type HistoryStoreState = ReturnType<typeof useHistoryStore.getState>;

export default function GearCalculatorPage(props: GearCalculatorPageProps) {
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
			<GearCalculatorPageContent {...props} />
		</Suspense>
	);
}

function GearCalculatorPageContent({ data }: GearCalculatorPageProps) {
	const searchParams = useSearchParams();

	const historyId = searchParams.get("historyId");

	const tutorial = useTutorial();

	/*
	 * ============================================================
	 * LOCAL STATE
	 * ============================================================
	 */

	const [activeHistory, setActiveHistory] = useState<GearHistoryItem | null>(
		null,
	);

	const [formKey, setFormKey] = useState("gear-new");

	const [isAddingItem, setIsAddingItem] = useState(false);

	const [isEditingHistory, setIsEditingHistory] = useState(false);

	/*
	 * ============================================================
	 * REFS
	 * ============================================================
	 */

	const formRef = useRef<HTMLDivElement>(null);

	const resultRef = useRef<HTMLDivElement>(null);

	const loadedHistoryIdRef = useRef<string | null>(null);

	/*
	 * ============================================================
	 * HISTORY STORE
	 * ============================================================
	 */

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

	/*
	 * IMPORTANT:
	 *
	 * This action must exist in history.store.ts.
	 *
	 * It changes only one entry inside the History.
	 *
	 * It does NOT complete the entire History.
	 */
	const completeCalculationItem = useHistoryStore(
		(state: HistoryStoreState) => state.completeCalculationItem,
	);

	/*
	 * ============================================================
	 * SCROLL TO FORM
	 * ============================================================
	 */

	const scrollToForm = useCallback(() => {
		requestAnimationFrame(() => {
			formRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		});
	}, []);

	/*
	 * ============================================================
	 * SCROLL TO RESULT
	 * ============================================================
	 */

	const scrollToResult = useCallback(() => {
		const result = resultRef.current;

		if (!result) {
			return;
		}

		const rect = result.getBoundingClientRect();

		const currentScroll = window.scrollY || document.documentElement.scrollTop;

		const headerOffset = 24;

		const targetTop = currentScroll + rect.top - headerOffset;

		window.scrollTo({
			top: Math.max(0, targetTop),
			behavior: "smooth",
		});
	}, []);

	/*
	 * ============================================================
	 * TUTORIAL RESULT SCROLL
	 * ============================================================
	 */

	useEffect(() => {
		if (!tutorial.active || tutorial.step !== "result") {
			return;
		}

		let cancelled = false;
		let frame = 0;
		let retryCount = 0;

		const waitForResult = () => {
			if (cancelled) {
				return;
			}

			const result = resultRef.current;

			if (!result) {
				retryCount += 1;

				if (retryCount > 120) {
					return;
				}

				frame = requestAnimationFrame(waitForResult);

				return;
			}

			frame = requestAnimationFrame(() => {
				if (cancelled) {
					return;
				}

				scrollToResult();
			});
		};

		frame = requestAnimationFrame(() => {
			frame = requestAnimationFrame(waitForResult);
		});

		return () => {
			cancelled = true;

			if (frame) {
				cancelAnimationFrame(frame);
			}
		};
	}, [scrollToResult, tutorial.active, tutorial.step]);

	/*
	 * ============================================================
	 * LOAD HISTORY
	 * ============================================================
	 */

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	/*
	 * ============================================================
	 * RESOLVE HISTORY FROM URL
	 * ============================================================
	 */

	useEffect(() => {
		if (!historyId) {
			loadedHistoryIdRef.current = null;

			return;
		}

		if (items.length === 0) {
			return;
		}

		const selected = items.find(
			(item) => String(item.id) === historyId && item.module === "gear",
		);

		if (!selected) {
			return;
		}

		const selectedHistory = selected as GearHistoryItem;

		/*
		 * Prevent the URL effect from
		 * constantly resetting form state.
		 */
		if (loadedHistoryIdRef.current !== historyId) {
			loadedHistoryIdRef.current = historyId;

			setActiveHistory(selectedHistory);

			setIsEditingHistory(true);

			setIsAddingItem(false);

			setFormKey(`gear-history-${selectedHistory.id}`);

			return;
		}

		/*
		 * Keep active history synchronized
		 * with Zustand after a Completed action.
		 */
		setActiveHistory(selectedHistory);
	}, [historyId, items]);

	/*
	 * ============================================================
	 * NORMALIZE HISTORY ITEMS
	 * ============================================================
	 *
	 * New History:
	 *
	 * activeHistory.items
	 *
	 * Old History:
	 *
	 * activeHistory itself becomes
	 * a single entry.
	 *
	 * completed defaults to false.
	 * This keeps old localStorage data
	 * compatible.
	 */

	const historyItems: GearHistoryEntry[] =
		activeHistory?.items && activeHistory.items.length > 0
			? (activeHistory.items as GearHistoryEntry[]).map((item) => ({
					...item,

					completed: item.completed ?? false,
				}))
			: activeHistory
				? [
						{
							id: activeHistory.id,

							title: activeHistory.title,

							subtitle: activeHistory.subtitle,

							form: activeHistory.form,

							result: activeHistory.result,

							createdAt: activeHistory.createdAt,

							completed: false,
						},
					]
				: [];

	/*
	 * ============================================================
	 * COMPLETED PROGRESS
	 * ============================================================
	 */

	const completedCount = historyItems.filter(
		(item) => item.completed === true,
	).length;

	const totalCount = historyItems.length;

	const completedPercentage =
		totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

	/*
	 * ============================================================
	 * FORM VALUES
	 * ============================================================
	 */

	const initialValues =
		activeHistory && !isAddingItem
			? (activeHistory.form as GearFormValues)
			: null;

	const isUpdateMode = isEditingHistory && !isAddingItem;

	/*
	 * ============================================================
	 * BUILD HISTORY PAYLOAD
	 * ============================================================
	 */

	function buildHistoryPayload(result: GearCalculationResult) {
		return {
			module: "gear" as const,

			title: result.gear ?? result.form?.gear ?? "Chief Gear",

			subtitle: `${result.fromLevel ?? result.form?.fromLevel} → ${
				result.toLevel ?? result.form?.toLevel
			}`,

			form: result.form,

			result,
		};
	}

	/*
	 * ============================================================
	 * CALCULATE
	 * ============================================================
	 */

	function handleCalculate(result: GearCalculationResult) {
		const payload = buildHistoryPayload(result);

		/*
		 * Add another result into
		 * existing History.
		 */
		if (activeHistory && isAddingItem) {
			const updated = addCalculationItem(activeHistory.id, payload) as
				| GearHistoryItem
				| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(updated);

			setIsAddingItem(false);

			setIsEditingHistory(false);

			setFormKey(`gear-result-${updated.id}-${Date.now()}`);

			if (tutorial.active && tutorial.step === "calculate") {
				tutorial.goTo("result");
			}

			return;
		}

		/*
		 * Update existing History.
		 */
		if (activeHistory && isEditingHistory) {
			const updated = updateCalculation(activeHistory.id, payload) as
				| GearHistoryItem
				| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(updated);

			setIsAddingItem(false);

			setIsEditingHistory(true);

			setFormKey(`gear-history-${updated.id}`);

			if (tutorial.active && tutorial.step === "calculate") {
				tutorial.goTo("result");
			}

			return;
		}

		/*
		 * Create new History.
		 */
		const saved = saveCalculation(payload) as GearHistoryItem;

		setActiveHistory(saved);

		setIsEditingHistory(false);

		setIsAddingItem(false);

		setFormKey(`gear-new-${Date.now()}`);

		if (tutorial.active && tutorial.step === "calculate") {
			tutorial.goTo("result");
		}
	}

	/*
	 * ============================================================
	 * COMPLETE ONE RESULT
	 * ============================================================
	 *
	 * IMPORTANT:
	 *
	 * entryId is the individual result ID.
	 *
	 * Therefore:
	 *
	 * Pants -> entry A -> complete only Pants
	 *
	 * Belt -> entry B -> remains active
	 *
	 * They do NOT complete together.
	 */
	function handleCompleteItem(entryId: string) {
		if (!activeHistory) {
			return;
		}

		const result = completeCalculationItem(activeHistory.id, entryId);

		if (!result.success || !result.history) {
			return;
		}

		/*
		 * Immediately update local state.
		 */
		setActiveHistory(result.history as GearHistoryItem);
	}

	/*
	 * ============================================================
	 * ADD ITEM
	 * ============================================================
	 */

	function handleAddItem() {
		if (!activeHistory) {
			return;
		}

		setIsAddingItem(true);

		setIsEditingHistory(false);

		setFormKey(`gear-add-item-${Date.now()}`);

		scrollToForm();
	}

	/*
	 * ============================================================
	 * NEW CALCULATION
	 * ============================================================
	 */

	function handleNewCalculation() {
		setActiveHistory(null);

		setIsEditingHistory(false);

		setIsAddingItem(false);

		loadedHistoryIdRef.current = null;

		setFormKey(`gear-new-${Date.now()}`);

		scrollToForm();
	}

	return (
		<div className="grid gap-6">
			<div className="space-y-6 p-4">
				{/* ==================================================
				    GEAR FORM
				================================================== */}

				<div ref={formRef}>
					<GearForm
						key={formKey}
						data={data}
						onCalculate={handleCalculate}
						initialValues={initialValues}
						mode={isUpdateMode ? "update" : "create"}
						lockMainFields={isUpdateMode}
					/>
				</div>

				{/* ==================================================
				    HISTORY RESULTS
				================================================== */}

				{activeHistory && historyItems.length > 0 && (
					<div
						ref={resultRef}
						data-tutorial="chief-gear-result"
						className="space-y-5"
					>
						{/* ==========================================
							    PROGRESS
							========================================== */}

						{totalCount > 1 && (
							<div className="rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-input)] p-4">
								<div className="flex items-center justify-between gap-4">
									<div className="min-w-0">
										<p className="text-sm font-semibold text-[var(--sl-text)]">
											Upgrade Progress
										</p>

										<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
											{completedCount} of {totalCount} upgrades completed
										</p>
									</div>

									<div className="shrink-0 text-sm font-bold text-[var(--sl-text)]">
										{completedPercentage}%
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

						{/* ==========================================
							    RESULT GROUP
							========================================== */}

						<CalculationGroupResult
							items={historyItems}
							getKey={(item) => item.id}
							renderItem={(item, index) => (
								<GearResult
									/*
									 * Individual
									 * calculation result.
									 */
									result={item.result as GearCalculationResult}
									/*
									 * Parent History.
									 */
									history={activeHistory}
									/*
									 * CRITICAL:
									 *
									 * This is the ID
									 * of Pants, Belt,
									 * Coat, etc.
									 */
									entryId={item.id}
									/*
									 * Individual
									 * completed state.
									 */
									completed={item.completed ?? false}
									/*
									 * Complete ONLY
									 * this result.
									 */
									onCompleted={() => handleCompleteItem(item.id)}
									title={index === 0 ? "Result" : undefined}
									showAddButton={index === historyItems.length - 1}
									onAddItem={handleAddItem}
								/>
							)}
							renderTotal={(groupItems) => (
								<GearTotalResult items={groupItems} />
							)}
						/>
					</div>
				)}

				{/* ==================================================
				    NEW CALCULATION
				================================================== */}

				{activeHistory && (
					<div className="px-4 py-2">
						<button
							type="button"
							onClick={handleNewCalculation}
							className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--sl-input)] px-4 py-3 text-sm font-semibold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-input-hover)]"
						>
							<span>New Calculation</span>

							<ArrowRight className="size-4" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
