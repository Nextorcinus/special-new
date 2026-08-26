"use client";

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

import calculateUnlockT12 from "../calculator/calculateUnlockT12";
import type {
	UnlockT12CalculationResult,
	UnlockT12Category,
	UnlockT12Database,
	UnlockT12FormValues,
} from "../type";

import UnlockT12Form from "./UnlockT12Form";
import UnlockT12Result from "./UnlockT12Result";
import UnlockT12TotalResult from "./UnlockT12TotalResult";

type UnlockT12CalculatorPageProps = {
	category: UnlockT12Category;
	data: UnlockT12Database;
};

type UnlockT12HistoryItem = CalculationHistoryItem<
	UnlockT12FormValues,
	UnlockT12CalculationResult
>;

type UnlockT12HistoryEntry = CalculationHistoryEntry<
	UnlockT12FormValues,
	UnlockT12CalculationResult
>;

type HistoryStoreState = ReturnType<
	typeof useHistoryStore.getState
>;

function normalizeCategory(
	value: unknown,
): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ");
}

function isMatchingCategory(
	history: UnlockT12HistoryItem,
	category: UnlockT12Category,
): boolean {
	const expectedCategory =
		normalizeCategory(category);

	const historyCategory =
		normalizeCategory(
			history.category,
		);

	const formCategory =
		normalizeCategory(
			history.form?.category,
		);

	const resultCategory =
		normalizeCategory(
			history.result?.category,
		);

	return (
		historyCategory ===
			expectedCategory ||
		formCategory ===
			expectedCategory ||
		resultCategory ===
			expectedCategory
	);
}

function isUnlockT12History(
	history: UnlockT12HistoryItem,
): boolean {
	if (
		history.module ===
		"unlock-t12"
	) {
		return true;
	}

	/*
	 * Dukungan untuk history lama yang sebelumnya
	 * masih disimpan menggunakan module war-academy.
	 */
	if (
		history.module !==
		"war-academy"
	) {
		return false;
	}

	const category =
		normalizeCategory(
			history.category ??
				history.form?.category ??
				history.result?.category,
		);

	return [
		"exalted infantry",
		"exalted lancer",
		"exalted marksman",
	].includes(category);
}

/*
 * ================================================================
 * Main Page
 *
 * Suspense boundary untuk useSearchParams().
 * ================================================================
 */

export default function UnlockT12CalculatorPage(
	props: UnlockT12CalculatorPageProps,
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
			<UnlockT12CalculatorPageContent
				{...props}
			/>
		</Suspense>
	);
}

/*
 * ================================================================
 * Page Content
 *
 * useSearchParams() berada di dalam component ini karena component
 * ini merupakan child dari Suspense di atas.
 * ================================================================
 */

function UnlockT12CalculatorPageContent({
	category,
	data,
}: UnlockT12CalculatorPageProps) {
	const searchParams =
		useSearchParams();

	const historyId =
		searchParams.get("historyId");

	const [
		activeHistory,
		setActiveHistory,
	] =
		useState<UnlockT12HistoryItem | null>(
			null,
		);

	const [formKey, setFormKey] =
		useState("unlock-t12-new");

	const [
		isAddingItem,
		setIsAddingItem,
	] = useState(false);

	const [
		isEditingHistory,
		setIsEditingHistory,
	] = useState(false);

	const formRef =
		useRef<HTMLDivElement>(null);

	const items = useHistoryStore(
		(state: HistoryStoreState) =>
			state.items,
	);

	const loadHistory =
		useHistoryStore(
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
	 * Load history from URL
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

		if (!selected) {
			return;
		}

		const selectedHistory =
			selected as UnlockT12HistoryItem;

		const normalizedCategory =
			normalizeCategory(
				category,
			);

		const selectedCategory =
			normalizeCategory(
				selectedHistory.category ??
					selectedHistory.form
						?.category ??
					selectedHistory.result
						?.category ??
					"",
			);

		const isCurrentHistory =
			selectedHistory.module ===
			"unlock-t12";

		const isLegacyHistory =
			selectedHistory.module ===
				"war-academy" &&
			[
				"exalted infantry",
				"exalted lancer",
				"exalted marksman",
			].includes(
				selectedCategory,
			);

		if (
			(!isCurrentHistory &&
				!isLegacyHistory) ||
			selectedCategory !==
				normalizedCategory
		) {
			return;
		}

		setActiveHistory(
			selectedHistory,
		);

		setIsEditingHistory(true);
		setIsAddingItem(false);

		setFormKey(
			`unlock-t12-${selectedHistory.id}`,
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

	const historyItems:
		UnlockT12HistoryEntry[] =
		activeHistory?.items &&
		activeHistory.items.length > 0
			? (activeHistory.items as UnlockT12HistoryEntry[])
			: activeHistory
				? [
						{
							id:
								activeHistory.id,
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
		Partial<UnlockT12FormValues> =
		activeHistory &&
		!isAddingItem
			? {
					...activeHistory.form,
					category,
				}
			: {
					category,
					research: "",
					fromLevel: "0",
					toLevel: "",
				};

	const isUpdateMode =
		isEditingHistory &&
		!isAddingItem;

	/*
	 * ================================================================
	 * History payload
	 * ================================================================
	 */

	function buildHistoryPayload(
		form: UnlockT12FormValues,
		result: UnlockT12CalculationResult,
	) {
		return {
			module: "unlock-t12" as const,
			category,
			title:
				result.research ||
				"Unlock T12",
			subtitle: `${category} · Lv.${result.fromLevel} → Lv.${result.toLevel}`,
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
		values: UnlockT12FormValues,
	) {
		const formValues:
			UnlockT12FormValues = {
			...values,
			category,
		};

		const result =
			calculateUnlockT12({
				data,
				values: formValues,
			});

		const payload =
			buildHistoryPayload(
				formValues,
				result,
			);

		/*
		 * Add item
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
					| UnlockT12HistoryItem
					| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(
				updated,
			);

			setIsAddingItem(false);
			setIsEditingHistory(false);

			setFormKey(
				`unlock-t12-${updated.id}`,
			);

			return;
		}

		/*
		 * Update history
		 */

		if (activeHistory) {
			const updated =
				updateCalculation(
					activeHistory.id,
					payload,
				) as
					| UnlockT12HistoryItem
					| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(
				updated,
			);

			setIsAddingItem(false);
			setIsEditingHistory(true);

			setFormKey(
				`unlock-t12-${updated.id}`,
			);

			return;
		}

		/*
		 * Create new history
		 */

		const saved =
			saveCalculation(
				payload,
			) as UnlockT12HistoryItem;

		setActiveHistory(saved);

		setIsEditingHistory(false);
		setIsAddingItem(false);

		setFormKey(
			`unlock-t12-${saved.id}`,
		);
	}

	/*
	 * ================================================================
	 * Add item
	 * ================================================================
	 */

	function handleAddItem() {
		if (!activeHistory) {
			return;
		}

		setIsAddingItem(true);
		setIsEditingHistory(false);

		setFormKey(
			`unlock-t12-add-${Date.now()}`,
		);

		scrollToForm();
	}

	/*
	 * ================================================================
	 * Reset
	 * ================================================================
	 */

	function handleReset() {
		if (isAddingItem) {
			setIsAddingItem(false);

			setIsEditingHistory(
				Boolean(activeHistory),
			);

			setFormKey(
				`unlock-t12-cancel-add-${Date.now()}`,
			);

			return;
		}

		if (activeHistory) {
			setFormKey(
				`unlock-t12-reset-${Date.now()}`,
			);
		}
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
					<UnlockT12Form
						key={formKey}
						category={category}
						data={data}
						initialValues={
							initialValues
						}
						mode={
							isUpdateMode
								? "update"
								: "create"
						}
						onSubmit={
							handleCalculate
						}
						onReset={
							handleReset
						}
					/>
				</div>

				{activeHistory &&
					historyItems.length >
						0 && (
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
								<UnlockT12Result
									result={
										item.result
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
								<UnlockT12TotalResult
									items={
										groupItems
									}
									title="Total Result"
								/>
							)}
						/>
					)}
			</div>
		</div>
	);
}