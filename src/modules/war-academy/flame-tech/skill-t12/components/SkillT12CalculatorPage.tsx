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

import calculateSkillT12 from "../calculator/calculateSkillT12";
import type {
	SkillT12CalculationResult,
	SkillT12Category,
	SkillT12Database,
	SkillT12FormValues,
} from "../type";

import SkillT12Form from "./SkillT12Form";
import SkillT12Result from "./SkillT12Result";
import SkillT12TotalResult from "./SkillT12TotalResult";

type SkillT12CalculatorPageProps = {
	category: SkillT12Category;
	data: SkillT12Database;
};

type SkillT12HistoryItem = CalculationHistoryItem<
	SkillT12FormValues,
	SkillT12CalculationResult
>;

type SkillT12HistoryEntry = CalculationHistoryEntry<
	SkillT12FormValues,
	SkillT12CalculationResult
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
	history: SkillT12HistoryItem,
	category: SkillT12Category,
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

function isSkillT12History(
	history: SkillT12HistoryItem,
): boolean {
	return history.module === "skill-t12";
}

/*
 * ================================================================
 * Main Page
 * ================================================================
 */

export default function SkillT12CalculatorPage(
	props: SkillT12CalculatorPageProps,
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
			<SkillT12CalculatorPageContent
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

function SkillT12CalculatorPageContent({
	category,
	data,
}: SkillT12CalculatorPageProps) {
	const searchParams =
		useSearchParams();

	const historyId =
		searchParams.get("historyId");

	const [
		activeHistory,
		setActiveHistory,
	] =
		useState<SkillT12HistoryItem | null>(
			null,
		);

	const [formKey, setFormKey] =
		useState("skill-t12-new");

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
				String(item.id) ===
				historyId,
		);

		if (!selected) {
			return;
		}

		const selectedHistory =
			selected as SkillT12HistoryItem;

		if (
			!isSkillT12History(
				selectedHistory,
			) ||
			!isMatchingCategory(
				selectedHistory,
				category,
			)
		) {
			return;
		}

		setActiveHistory(
			selectedHistory,
		);

		setIsEditingHistory(true);
		setIsAddingItem(false);

		setFormKey(
			`skill-t12-${selectedHistory.id}`,
		);
	}, [
		category,
		historyId,
		items,
	]);

	const historyItems:
		SkillT12HistoryEntry[] =
		activeHistory?.items &&
		activeHistory.items.length > 0
			? (activeHistory.items as SkillT12HistoryEntry[])
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

	const initialValues:
		Partial<SkillT12FormValues> =
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

	function buildHistoryPayload(
		form: SkillT12FormValues,
		result: SkillT12CalculationResult,
	) {
		return {
			module: "skill-t12" as const,
			category,
			title:
				result.research ||
				"T12 Skill",
			subtitle: `${category} · Lv.${result.fromLevel} → Lv.${result.toLevel}`,
			form,
			result,
		};
	}

	function handleCalculate(
		values: SkillT12FormValues,
	) {
		const formValues:
			SkillT12FormValues = {
			...values,
			category,
		};

		const result =
			calculateSkillT12({
				data,
				values: formValues,
			});

		if (
			result.selectedLevels
				.length === 0
		) {
			return;
		}

		const payload =
			buildHistoryPayload(
				formValues,
				result,
			);

		if (
			activeHistory &&
			isAddingItem
		) {
			const updated =
				addCalculationItem(
					activeHistory.id,
					payload,
				) as
					| SkillT12HistoryItem
					| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(updated);
			setIsAddingItem(false);
			setIsEditingHistory(false);

			setFormKey(
				`skill-t12-${updated.id}`,
			);

			return;
		}

		if (activeHistory) {
			const updated =
				updateCalculation(
					activeHistory.id,
					payload,
				) as
					| SkillT12HistoryItem
					| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(updated);
			setIsAddingItem(false);
			setIsEditingHistory(true);

			setFormKey(
				`skill-t12-${updated.id}`,
			);

			return;
		}

		const saved =
			saveCalculation(
				payload,
			) as SkillT12HistoryItem;

		setActiveHistory(saved);
		setIsEditingHistory(false);
		setIsAddingItem(false);

		setFormKey(
			`skill-t12-${saved.id}`,
		);
	}

	function handleAddItem() {
		if (!activeHistory) {
			return;
		}

		setIsAddingItem(true);
		setIsEditingHistory(false);

		setFormKey(
			`skill-t12-add-${Date.now()}`,
		);

		scrollToForm();
	}

	function handleReset() {
		if (isAddingItem) {
			setIsAddingItem(false);

			setIsEditingHistory(
				Boolean(activeHistory),
			);

			setFormKey(
				`skill-t12-cancel-add-${Date.now()}`,
			);

			return;
		}

		if (activeHistory) {
			setFormKey(
				`skill-t12-reset-${Date.now()}`,
			);
		}
	}

	return (
		<div className="grid gap-6">
			<div className="space-y-6 p-4">
				<div ref={formRef}>
					<SkillT12Form
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
							getKey={(
								item,
							) =>
								item.id
							}
							renderItem={(
								item,
								index,
							) => (
								<SkillT12Result
									result={
										item.result
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
								<SkillT12TotalResult
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