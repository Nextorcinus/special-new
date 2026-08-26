"use client";

import { useSearchParams } from "next/navigation";
import {
	Suspense,
	useEffect,
	useMemo,
	useState,
} from "react";

import CalculationGroupResult from "@/components/calculator/CalculationGroupResult";
import HistoryPanel from "@/features/inventory/components/HistoryPanel";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import type {
	CalculationHistoryEntry,
	CalculationHistoryItem,
} from "@/features/inventory/store/history/types";

import calculateWarAcademy from "../calculator/calculateWarAcademy";
import type {
	WarAcademyCalculationResult,
	WarAcademyCategory,
	WarAcademyDatabase,
	WarAcademyFormValues,
} from "../type";

import WarAcademyForm from "./WarAcademyForm";
import WarAcademyResult from "./WarAcademyResult";
import WarAcademyTotalResult from "./WarAcademyTotalResult";

type WarAcademyCalculatorPageProps = {
	category: WarAcademyCategory;
	data: WarAcademyDatabase;
};

type WarAcademyHistoryItem = CalculationHistoryItem<
	WarAcademyFormValues,
	WarAcademyCalculationResult
>;

type WarAcademyHistoryEntry = CalculationHistoryEntry<
	WarAcademyFormValues,
	WarAcademyCalculationResult
>;

const DEFAULT_FORM_VALUES: WarAcademyFormValues = {
	research: "",
	fromLevel: "",
	toLevel: "",
	vpLevel: "Off",
	agnesLevel: "0",
	researchSpeed: "",
	doubleTime: false,
};

function createEntryId(): string {
	return `war-academy_${Date.now()}_${Math.random()
		.toString(36)
		.slice(2, 8)}`;
}

function createEntryFromHistory(
	history: WarAcademyHistoryItem,
): WarAcademyHistoryEntry {
	return {
		id: history.id,
		title: history.title,
		subtitle: history.subtitle,
		form: history.form,
		result: history.result,
		createdAt: history.createdAt,
	};
}

function getHistoryEntries(
	history: WarAcademyHistoryItem | null,
): WarAcademyHistoryEntry[] {
	if (!history) {
		return [];
	}

	if (
		Array.isArray(history.items) &&
		history.items.length > 0
	) {
		return history.items as WarAcademyHistoryEntry[];
	}

	if (!history.form || !history.result) {
		return [];
	}

	return [createEntryFromHistory(history)];
}

function createHistoryTitle(
	values: WarAcademyFormValues,
): string {
	return values.research || "War Academy";
}

function createHistorySubtitle(
	category: WarAcademyCategory,
	values: WarAcademyFormValues,
): string {
	return `${category} · Lv.${values.fromLevel} → Lv.${values.toLevel}`;
}

/*
 * ================================================================
 * Main Page
 *
 * useSearchParams() harus berada di dalam Suspense boundary.
 * ================================================================
 */

export default function WarAcademyCalculatorPage(
	props: WarAcademyCalculatorPageProps,
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
			<WarAcademyCalculatorPageContent
				{...props}
			/>
		</Suspense>
	);
}

/*
 * ================================================================
 * Page Content
 *
 * Component ini berada di dalam Suspense sehingga
 * useSearchParams() aman digunakan untuk production build.
 * ================================================================
 */

function WarAcademyCalculatorPageContent({
	category,
	data,
}: WarAcademyCalculatorPageProps) {
	const searchParams =
		useSearchParams();

	const historyId =
		searchParams.get("historyId");

	/*
	 * ================================================================
	 * History Store
	 * ================================================================
	 */

	const historyItems = useHistoryStore(
		(state) => state.items,
	);

	const loadHistory = useHistoryStore(
		(state) => state.loadHistory,
	);

	const saveCalculation =
		useHistoryStore(
			(state) => state.saveCalculation,
		);

	const updateCalculation =
		useHistoryStore(
			(state) => state.updateCalculation,
		);

	const addCalculationItem =
		useHistoryStore(
			(state) => state.addCalculationItem,
		);

	const togglePinHistory =
		useHistoryStore(
			(state) => state.togglePinHistory,
		);

	const deleteHistory =
		useHistoryStore(
			(state) => state.deleteHistory,
		);

	/*
	 * ================================================================
	 * Local State
	 * ================================================================
	 */

	const [
		activeHistory,
		setActiveHistory,
	] =
		useState<WarAcademyHistoryItem | null>(
			null,
		);

	const [result, setResult] =
		useState<WarAcademyCalculationResult | null>(
			null,
		);

	const [formKey, setFormKey] =
		useState(0);

	const [
		isAddingItem,
		setIsAddingItem,
	] = useState(false);

	const [
		isEditingHistory,
		setIsEditingHistory,
	] = useState(false);

	/*
	 * ================================================================
	 * Load History
	 * ================================================================
	 */

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	/*
	 * ================================================================
	 * Load History from URL
	 * ================================================================
	 */

	useEffect(() => {
		if (!historyId) {
			return;
		}

		const selectedHistory =
			historyItems.find(
				(item) =>
					String(item.id) ===
						historyId &&
					item.module ===
						"war-academy",
			) as
				| WarAcademyHistoryItem
				| undefined;

		if (!selectedHistory) {
			return;
		}

		setActiveHistory(
			selectedHistory,
		);

		setResult(
			selectedHistory.result ??
				null,
		);

		setIsAddingItem(false);
		setIsEditingHistory(true);

		setFormKey(
			(current) => current + 1,
		);
	}, [
		historyId,
		historyItems,
	]);

	/*
	 * ================================================================
	 * Keep active history synchronized with store
	 * ================================================================
	 */

	const activeHistoryId =
		activeHistory?.id;

	useEffect(() => {
		if (!activeHistoryId) {
			return;
		}

		const latestHistory =
			historyItems.find(
				(item) =>
					String(item.id) ===
					String(activeHistoryId),
			) as
				| WarAcademyHistoryItem
				| undefined;

		if (!latestHistory) {
			return;
		}

		setActiveHistory(
			latestHistory,
		);
	}, [
		activeHistoryId,
		historyItems,
	]);

	/*
	 * ================================================================
	 * War Academy History
	 * ================================================================
	 */

	const warAcademyHistoryItems =
		useMemo(() => {
			return historyItems.filter(
				(item) =>
					item.module ===
					"war-academy",
			);
		}, [historyItems]);

	/*
	 * ================================================================
	 * History Entries
	 * ================================================================
	 */

	const historyEntries =
		useMemo(() => {
			return getHistoryEntries(
				activeHistory,
			);
		}, [activeHistory]);

	/*
	 * ================================================================
	 * Initial Form Values
	 * ================================================================
	 */

	const initialValues =
		useMemo<
			Partial<WarAcademyFormValues>
		>(() => {
			if (isAddingItem) {
				return {
					...DEFAULT_FORM_VALUES,

					vpLevel:
						activeHistory?.form
							?.vpLevel ??
						"Off",

					agnesLevel:
						activeHistory?.form
							?.agnesLevel ??
						"0",

					researchSpeed:
						activeHistory?.form
							?.researchSpeed ??
						"",

					doubleTime:
						activeHistory?.form
							?.doubleTime ??
						false,
				};
			}

			if (activeHistory?.form) {
				return activeHistory.form;
			}

			return DEFAULT_FORM_VALUES;
		}, [
			activeHistory,
			isAddingItem,
		]);

	/*
	 * ================================================================
	 * Clear Active Calculation
	 * ================================================================
	 */

	function clearActiveCalculation() {
		setActiveHistory(null);
		setResult(null);
		setIsAddingItem(false);
		setIsEditingHistory(false);

		setFormKey(
			(current) => current + 1,
		);

		window.history.replaceState(
			null,
			"",
			window.location.pathname,
		);
	}

	/*
	 * ================================================================
	 * Submit Calculation
	 * ================================================================
	 */

	function handleSubmit(
		values: WarAcademyFormValues,
	) {
		const calculationResult =
			calculateWarAcademy({
				category,
				data,
				values,
			});

		const title =
			createHistoryTitle(values);

		const subtitle =
			createHistorySubtitle(
				category,
				values,
			);

		setResult(calculationResult);

		/*
		 * ------------------------------------------------------------
		 * Add item ke history aktif
		 * ------------------------------------------------------------
		 */

		if (
			activeHistory &&
			isAddingItem
		) {
			addCalculationItem(
				activeHistory.id,
				{
					module:
						"war-academy",
					category,
					title,
					subtitle,
					form: values,
					result:
						calculationResult,
				},
			);

			const newEntry: WarAcademyHistoryEntry =
				{
					id: createEntryId(),
					title,
					subtitle,
					form: values,
					result:
						calculationResult,
					createdAt:
						new Date().toISOString(),
				};

			setActiveHistory(
				(current) => {
					if (!current) {
						return current;
					}

					const currentItems =
						getHistoryEntries(
							current,
						);

					return {
						...current,
						items: [
							...currentItems,
							newEntry,
						],
						updatedAt:
							new Date().toISOString(),
					};
				},
			);

			setIsAddingItem(false);
			setIsEditingHistory(true);

			setFormKey(
				(current) =>
					current + 1,
			);

			return;
		}

		/*
		 * ------------------------------------------------------------
		 * Update history aktif
		 * ------------------------------------------------------------
		 */

		if (
			activeHistory &&
			isEditingHistory
		) {
			updateCalculation(
				activeHistory.id,
				{
					module:
						"war-academy",
					category,
					title,
					subtitle,
					form: values,
					result:
						calculationResult,
				},
			);

			setActiveHistory(
				(current) => {
					if (!current) {
						return current;
					}

					return {
						...current,
						module:
							"war-academy",
						category,
						title,
						subtitle,
						form: values,
						result:
							calculationResult,
						updatedAt:
							new Date().toISOString(),
					};
				},
			);

			return;
		}

		/*
		 * ------------------------------------------------------------
		 * Save new history
		 * ------------------------------------------------------------
		 */

		const savedHistory =
			saveCalculation({
				module:
					"war-academy",
				category,
				title,
				subtitle,
				form: values,
				result:
					calculationResult,
			}) as
				| WarAcademyHistoryItem
				| undefined;

		if (!savedHistory) {
			return;
		}

		setActiveHistory(
			savedHistory,
		);

		setIsAddingItem(false);
		setIsEditingHistory(true);

		setFormKey(
			(current) => current + 1,
		);

		window.history.replaceState(
			null,
			"",
			`${window.location.pathname}?historyId=${savedHistory.id}`,
		);
	}

	/*
	 * ================================================================
	 * Add Item
	 * ================================================================
	 */

	function handleAddItem() {
		if (!activeHistory) {
			return;
		}

		setIsAddingItem(true);
		setIsEditingHistory(false);
		setResult(null);

		setFormKey(
			(current) => current + 1,
		);

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}

	/*
	 * ================================================================
	 * New Calculation
	 * ================================================================
	 */

	function handleNewCalculation() {
		clearActiveCalculation();

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}

	/*
	 * ================================================================
	 * Reset
	 * ================================================================
	 */

	function handleReset() {
		if (isAddingItem) {
			setIsAddingItem(false);
			setIsEditingHistory(true);

			setResult(
				activeHistory?.result ??
					null,
			);

			setFormKey(
				(current) =>
					current + 1,
			);

			return;
		}

		if (activeHistory) {
			setResult(
				activeHistory.result ??
					null,
			);

			setFormKey(
				(current) =>
					current + 1,
			);

			return;
		}

		setResult(null);

		setFormKey(
			(current) => current + 1,
		);
	}

	/*
	 * ================================================================
	 * Select History
	 * ================================================================
	 */

	function handleHistorySelect(
		item: CalculationHistoryItem,
	) {
		if (
			item.module !==
			"war-academy"
		) {
			return;
		}

		const selectedHistory =
			item as WarAcademyHistoryItem;

		setActiveHistory(
			selectedHistory,
		);

		setResult(
			selectedHistory.result ??
				null,
		);

		setIsAddingItem(false);
		setIsEditingHistory(true);

		setFormKey(
			(current) => current + 1,
		);

		window.history.replaceState(
			null,
			"",
			`${window.location.pathname}?historyId=${selectedHistory.id}`,
		);

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}

	/*
	 * ================================================================
	 * Pin History
	 * ================================================================
	 */

	function handlePinHistory(
		id: string,
	) {
		togglePinHistory(id);
	}

	/*
	 * ================================================================
	 * Delete History
	 * ================================================================
	 */

	function handleDeleteHistory(
		id: string,
	) {
		deleteHistory(id);

		if (
			activeHistory?.id !== id
		) {
			return;
		}

		clearActiveCalculation();
	}

	/*
	 * ================================================================
	 * Result Visibility
	 * ================================================================
	 */

	const showGroupResult =
		activeHistory !== null &&
		historyEntries.length > 1 &&
		!isAddingItem;

	const showSingleResult =
		result !== null &&
		!showGroupResult &&
		!isAddingItem;

	/*
	 * ================================================================
	 * Render
	 * ================================================================
 */

	return (
		<div className="grid gap-6">
			<div className="space-y-6 p-4">
				<div>
					<WarAcademyForm
						key={formKey}
						category={category}
						data={data}
						initialValues={
							initialValues
						}
						mode={
							isEditingHistory &&
							!isAddingItem
								? "update"
								: "create"
						}
						lockMainFields={
							isEditingHistory &&
							!isAddingItem
						}
						onSubmit={
							handleSubmit
						}
						onReset={
							handleReset
						}
					/>
				</div>

				{showSingleResult &&
					result && (
						<WarAcademyResult
							result={result}
							history={
								activeHistory
							}
							title="Result"
							showAddButton={
								activeHistory !==
								null
							}
							onAddItem={
								handleAddItem
							}
						/>
					)}

				{showGroupResult && (
					<div className="space-y-5">
						<h2 className="text-2xl font-bold text-[var(--sl-text)]">
							Result
						</h2>

						<CalculationGroupResult
							items={
								historyEntries
							}
							getKey={(item) =>
								item.id
							}
							renderItem={(
								item,
								index,
							) => (
								<WarAcademyResult
									result={
										item.result
									}
									showAddButton={
										index ===
										historyEntries.length -
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
								<WarAcademyTotalResult
									items={
										items
									}
									title="Total Result"
								/>
							)}
						/>
					</div>
				)}

				{activeHistory && (
					<button
						type="button"
						onClick={
							handleNewCalculation
						}
						className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--sl-input)] px-4 py-3 text-sm font-semibold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-input-hover)]"
					>
						New Calculation
					</button>
				)}
			</div>
		</div>
	);
}