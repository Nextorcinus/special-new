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

import { useTutorial } from "@/features/tutorial";

import { useHistoryStore } from "@/features/inventory/store/history/history.store";

import type {
	CalculationHistoryEntry,
	CalculationHistoryItem,
} from "@/features/inventory/store/history/types";

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

type GearHistoryItem =
	CalculationHistoryItem<
		GearFormValues,
		GearCalculationResult
	>;

type GearHistoryEntry =
	CalculationHistoryEntry<
		GearFormValues,
		GearCalculationResult
	>;

type HistoryStoreState =
	ReturnType<
		typeof useHistoryStore.getState
	>;

export default function GearCalculatorPage(
	props: GearCalculatorPageProps,
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
			<GearCalculatorPageContent
				{...props}
			/>
		</Suspense>
	);
}

function GearCalculatorPageContent({
	data,
}: GearCalculatorPageProps) {
	const searchParams =
		useSearchParams();

	const historyId =
		searchParams.get("historyId");

	const tutorial = useTutorial();

	const [activeHistory, setActiveHistory] =
		useState<GearHistoryItem | null>(
			null,
		);

	const [formKey, setFormKey] =
		useState("gear-new");

	const [isAddingItem, setIsAddingItem] =
		useState(false);

	const [
		isEditingHistory,
		setIsEditingHistory,
	] = useState(false);

	const formRef =
		useRef<HTMLDivElement>(null);

	const resultRef =
		useRef<HTMLDivElement>(null);

	const loadedHistoryIdRef =
		useRef<string | null>(null);

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
	 * ============================================================
	 * SCROLL TO FORM
	 * ============================================================
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
	 * ============================================================
	 * SCROLL TO RESULT
	 * ============================================================
	 *
	 * The result must already exist in the DOM
	 * before we scroll to it.
	 */

	function scrollToResult() {
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				resultRef.current?.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			});
		});
	}

	/*
	 * ============================================================
	 * TUTORIAL RESULT TRANSITION
	 * ============================================================
	 *
	 * Calculate creates the result asynchronously
	 * through React state.
	 *
	 * We therefore wait until the "result" step
	 * is active and the result element actually
	 * exists before scrolling.
	 */

	useEffect(() => {
		if (
			!tutorial.active ||
			tutorial.step !== "result"
		) {
			return;
		}

		let cancelled = false;
		let frame = 0;

		const waitForResult = () => {
			if (cancelled) {
				return;
			}

			if (!resultRef.current) {
				frame =
					requestAnimationFrame(
						waitForResult,
					);

				return;
			}

			scrollToResult();
		};

		/*
		 * Wait for the result to be committed
		 * to the DOM before starting the scroll.
		 */
		frame =
			requestAnimationFrame(() => {
				frame =
					requestAnimationFrame(
						waitForResult,
					);
			});

		return () => {
			cancelled = true;

			if (frame) {
				cancelAnimationFrame(frame);
			}
		};
	}, [
		tutorial.active,
		tutorial.step,
	]);

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
	 * LOAD HISTORY FROM URL
	 * ============================================================
	 */

	useEffect(() => {
		if (!historyId) {
			loadedHistoryIdRef.current =
				null;

			return;
		}

		if (items.length === 0) {
			return;
		}

		const selected = items.find(
			(item) =>
				String(item.id) ===
					historyId &&
				item.module === "gear",
		);

		if (!selected) {
			return;
		}

		const selectedHistory =
			selected as GearHistoryItem;

		if (
			loadedHistoryIdRef.current !==
			historyId
		) {
			loadedHistoryIdRef.current =
				historyId;

			setActiveHistory(
				selectedHistory,
			);

			setIsEditingHistory(true);

			setIsAddingItem(false);

			setFormKey(
				`gear-history-${selectedHistory.id}`,
			);

			return;
		}

		setActiveHistory(
			selectedHistory,
		);
	}, [historyId, items]);

	/*
	 * ============================================================
	 * HISTORY ITEMS
	 * ============================================================
	 */

	const historyItems: GearHistoryEntry[] =
		activeHistory?.items &&
		activeHistory.items.length > 0
			? (activeHistory.items as GearHistoryEntry[])
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

	const initialValues =
		activeHistory &&
		!isAddingItem
			? (activeHistory.form as GearFormValues)
			: null;

	const isUpdateMode =
		isEditingHistory &&
		!isAddingItem;

	/*
	 * ============================================================
	 * BUILD HISTORY PAYLOAD
	 * ============================================================
	 */

	function buildHistoryPayload(
		result: GearCalculationResult,
	) {
		return {
			module: "gear" as const,

			title:
				result.gear ??
				result.form?.gear ??
				"Chief Gear",

			subtitle: `${
				result.fromLevel ??
				result.form?.fromLevel
			} → ${
				result.toLevel ??
				result.form?.toLevel
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

	function handleCalculate(
		result: GearCalculationResult,
	) {
		const payload =
			buildHistoryPayload(result);

		/*
		 * ========================================================
		 * ADD ITEM
		 * ========================================================
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
					| GearHistoryItem
					| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(updated);

			setIsAddingItem(false);

			setIsEditingHistory(false);

			setFormKey(
				`gear-result-${updated.id}-${Date.now()}`,
			);

			/*
			 * Tutorial:
			 *
			 * Calculate berhasil.
			 *
			 * Pindahkan ke result.
			 *
			 * Scrolling tidak dilakukan
			 * langsung di sini karena result
			 * belum tentu sudah ter-render.
			 */
			if (
				tutorial.active &&
				tutorial.step ===
					"calculate"
			) {
				tutorial.goTo(
					"result",
				);
			}

			return;
		}

		/*
		 * ========================================================
		 * UPDATE HISTORY
		 * ========================================================
		 */

		if (
			activeHistory &&
			isEditingHistory
		) {
			const updated =
				updateCalculation(
					activeHistory.id,
					payload,
				) as
					| GearHistoryItem
					| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(updated);

			setIsAddingItem(false);

			setIsEditingHistory(true);

			setFormKey(
				`gear-history-${updated.id}`,
			);

			/*
			 * Tutorial:
			 *
			 * Calculate berhasil.
			 */
			if (
				tutorial.active &&
				tutorial.step ===
					"calculate"
			) {
				tutorial.goTo(
					"result",
				);
			}

			return;
		}

		/*
		 * ========================================================
		 * NEW CALCULATION
		 * ========================================================
		 */

		const saved =
			saveCalculation(
				payload,
			) as GearHistoryItem;

		setActiveHistory(saved);

		setIsEditingHistory(false);

		setIsAddingItem(false);

		setFormKey(
			`gear-new-${Date.now()}`,
		);

		/*
		 * Tutorial:
		 *
		 * Calculate berhasil.
		 *
		 * Pindahkan tutorial ke Result.
		 *
		 * useEffect di atas akan menunggu
		 * resultRef tersedia lalu melakukan
		 * smooth scroll.
		 */
		if (
			tutorial.active &&
			tutorial.step ===
				"calculate"
		) {
			tutorial.goTo(
				"result",
			);
		}
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

		setFormKey(
			`gear-add-item-${Date.now()}`,
		);

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

		loadedHistoryIdRef.current =
			null;

		setFormKey(
			`gear-new-${Date.now()}`,
		);

		scrollToForm();
	}

	return (
		<div className="grid gap-6">
			<div className="space-y-6 p-4">
				<div ref={formRef}>
					<GearForm
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
					historyItems.length >
						0 && (
						<div
							ref={resultRef}
							data-tutorial="chief-gear-result"
						>
							<CalculationGroupResult
								items={
									historyItems
								}
								getKey={(item) =>
									item.id
								}
								renderItem={(
									item,
									index,
								) => (
									<GearResult
										result={
											item.result as GearCalculationResult
										}
										history={
											activeHistory
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
									<GearTotalResult
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