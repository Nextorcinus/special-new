"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

type HistoryStoreState = ReturnType<typeof useHistoryStore.getState>;

function normalizeCategory(value: unknown): string {
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
	const expectedCategory = normalizeCategory(category);

	const historyCategory = normalizeCategory(history.category);
	const formCategory = normalizeCategory(history.form?.category);
	const resultCategory = normalizeCategory(history.result?.category);

	return (
		historyCategory === expectedCategory ||
		formCategory === expectedCategory ||
		resultCategory === expectedCategory
	);
}

function isUnlockT12History(history: UnlockT12HistoryItem): boolean {
	if (history.module === "unlock-t12") {
		return true;
	}

	/*
	 * Dukungan untuk history lama yang sebelumnya
	 * masih disimpan menggunakan module war-academy.
	 */
	if (history.module !== "war-academy") {
		return false;
	}

	const category = normalizeCategory(
		history.category ?? history.form?.category ?? history.result?.category,
	);

	return ["exalted infantry", "exalted lancer", "exalted marksman"].includes(
		category,
	);
}

export default function UnlockT12CalculatorPage({
	category,
	data,
}: UnlockT12CalculatorPageProps) {
	const searchParams = useSearchParams();
	const historyId = searchParams.get("historyId");

	const [activeHistory, setActiveHistory] =
		useState<UnlockT12HistoryItem | null>(null);

	const [formKey, setFormKey] = useState("unlock-t12-new");
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
		if (!historyId || items.length === 0) {
			return;
		}

		const selected = items.find((item) => String(item.id) === historyId);

		if (!selected) {
			return;
		}

		const selectedHistory = selected as UnlockT12HistoryItem;

		const normalizedCategory = String(category).trim().toLowerCase();

		const selectedCategory = String(
			selectedHistory.category ??
				selectedHistory.form?.category ??
				selectedHistory.result?.category ??
				"",
		)
			.trim()
			.toLowerCase();

		const isCurrentHistory = selectedHistory.module === "unlock-t12";

		const isLegacyHistory =
			selectedHistory.module === "war-academy" &&
			["exalted infantry", "exalted lancer", "exalted marksman"].includes(
				selectedCategory,
			);

		if (
			(!isCurrentHistory && !isLegacyHistory) ||
			selectedCategory !== normalizedCategory
		) {
			return;
		}

		setActiveHistory(selectedHistory);
		setIsEditingHistory(true);
		setIsAddingItem(false);
		setFormKey(`unlock-t12-${selectedHistory.id}`);
	}, [category, historyId, items]);

	const historyItems: UnlockT12HistoryEntry[] =
		activeHistory?.items && activeHistory.items.length > 0
			? (activeHistory.items as UnlockT12HistoryEntry[])
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

	const initialValues: Partial<UnlockT12FormValues> =
		activeHistory && !isAddingItem
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

	const isUpdateMode = isEditingHistory && !isAddingItem;

	function buildHistoryPayload(
		form: UnlockT12FormValues,
		result: UnlockT12CalculationResult,
	) {
		return {
			module: "unlock-t12" as const,
			category,
			title: result.research || "Unlock T12",
			subtitle: `${category} · Lv.${result.fromLevel} → Lv.${result.toLevel}`,
			form,
			result,
		};
	}

	function handleCalculate(values: UnlockT12FormValues) {
		const formValues: UnlockT12FormValues = {
			...values,
			category,
		};

		const result = calculateUnlockT12({
			data,
			values: formValues,
		});

		const payload = buildHistoryPayload(formValues, result);

		if (activeHistory && isAddingItem) {
			const updated = addCalculationItem(activeHistory.id, payload) as
				| UnlockT12HistoryItem
				| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(updated);
			setIsAddingItem(false);
			setIsEditingHistory(false);
			setFormKey(`unlock-t12-${updated.id}`);

			return;
		}

		if (activeHistory) {
			const updated = updateCalculation(activeHistory.id, payload) as
				| UnlockT12HistoryItem
				| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(updated);
			setIsAddingItem(false);
			setIsEditingHistory(true);
			setFormKey(`unlock-t12-${updated.id}`);

			return;
		}

		const saved = saveCalculation(payload) as UnlockT12HistoryItem;

		setActiveHistory(saved);
		setIsEditingHistory(false);
		setIsAddingItem(false);
		setFormKey(`unlock-t12-${saved.id}`);
	}

	function handleAddItem() {
		if (!activeHistory) {
			return;
		}

		setIsAddingItem(true);
		setIsEditingHistory(false);
		setFormKey(`unlock-t12-add-${Date.now()}`);

		scrollToForm();
	}

	function handleReset() {
		if (isAddingItem) {
			setIsAddingItem(false);
			setIsEditingHistory(Boolean(activeHistory));
			setFormKey(`unlock-t12-cancel-add-${Date.now()}`);

			return;
		}

		if (activeHistory) {
			setFormKey(`unlock-t12-reset-${Date.now()}`);
		}
	}

	return (
		<div className="grid gap-6">
			<div className="space-y-6 p-4">
				<div ref={formRef}>
					<UnlockT12Form
						key={formKey}
						category={category}
						data={data}
						initialValues={initialValues}
						mode={isUpdateMode ? "update" : "create"}
						onSubmit={handleCalculate}
						onReset={handleReset}
					/>
				</div>

				{activeHistory && historyItems.length > 0 && (
					<CalculationGroupResult
						items={historyItems}
						getKey={(item) => item.id}
						renderItem={(item, index) => (
							<UnlockT12Result
								result={item.result}
								showAddButton={index === historyItems.length - 1}
								onAddItem={handleAddItem}
							/>
						)}
						renderTotal={(groupItems) => (
							<UnlockT12TotalResult items={groupItems} title="Total Result" />
						)}
					/>
				)}
			</div>
		</div>
	);
}
