"use client";

import { ArrowRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import CalculationGroupResult from "@/components/calculator/CalculationGroupResult";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import type {
	CalculationHistoryEntry,
	CalculationHistoryItem,
} from "@/features/inventory/store/history/types";

import { calculateWidget, normalizeWidgetDatabase } from "../calculator";

import type {
	WidgetCalculationResult,
	WidgetDatabaseItem,
	WidgetFormValues,
} from "../type";

import WidgetForm from "./WidgetForm";
import WidgetResult from "./WidgetResult";
import WidgetTotalResult from "./WidgetTotalResult";

type RawWidgetItem = {
	heroes: string;
	exploration: string;
	expedition: string;
	status?: string;
};

type WidgetCalculatorPageProps = {
	data: RawWidgetItem[];
};

type WidgetHistoryItem = CalculationHistoryItem<
	WidgetFormValues,
	WidgetCalculationResult
>;

type WidgetHistoryEntry = CalculationHistoryEntry<
	WidgetFormValues,
	WidgetCalculationResult
>;

type HistoryStoreState = ReturnType<typeof useHistoryStore.getState>;

export default function WidgetCalculatorPage({
	data,
}: WidgetCalculatorPageProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const historyId = searchParams.get("historyId");

	const [activeHistory, setActiveHistory] = useState<WidgetHistoryItem | null>(
		null,
	);

	const [formKey, setFormKey] = useState("new");

	const [isAddingItem, setIsAddingItem] = useState(false);

	const [isOpenedFromHistory, setIsOpenedFromHistory] = useState(false);

	const formRef = useRef<HTMLDivElement>(null);

	const widgetData = useMemo<WidgetDatabaseItem[]>(() => {
		if (!Array.isArray(data)) {
			return [];
		}

		return normalizeWidgetDatabase(data);
	}, [data]);

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

	function removeHistoryIdFromUrl() {
		const params = new URLSearchParams(searchParams.toString());

		params.delete("historyId");

		const query = params.toString();

		router.replace(query ? `${pathname}?${query}` : pathname, {
			scroll: false,
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

		if (!selected || selected.module !== "widget") {
			return;
		}

		const widgetHistory = selected as WidgetHistoryItem;

		setActiveHistory(widgetHistory);
		setIsOpenedFromHistory(true);
		setIsAddingItem(false);
		setFormKey(`history-${widgetHistory.id}`);
	}, [historyId, items]);

	const historyItems: WidgetHistoryEntry[] =
		activeHistory?.items && activeHistory.items.length > 0
			? (activeHistory.items as WidgetHistoryEntry[])
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

	const initialValues: Partial<WidgetFormValues> | undefined =
		activeHistory && !isAddingItem ? activeHistory.form : undefined;

	const isUpdateMode = Boolean(activeHistory) && !isAddingItem;

	const lockMainFields = isOpenedFromHistory && !isAddingItem;

	function buildHistoryPayload(
		form: WidgetFormValues,
		result: WidgetCalculationResult,
	) {
		const skillType =
			result.type === "exploration" ? "Exploration" : "Expedition";

		return {
			module: "widget" as const,
			title: result.heroName || "Widget",
			subtitle:
				`GEN ${result.generation} · ` +
				`Lv.${result.fromLevel} → ` +
				`Lv.${result.toLevel} · ` +
				skillType,
			form,
			result,
		};
	}

	function handleCalculate(values: WidgetFormValues) {
		try {
			const formValues: WidgetFormValues = {
				...values,
			};

			const result = calculateWidget({
				data: widgetData,
				values: formValues,
			});

			const payload = buildHistoryPayload(formValues, result);

			if (activeHistory && isAddingItem) {
				const updated = addCalculationItem(
					activeHistory.id,
					payload,
				) as WidgetHistoryItem | null;

				if (!updated) {
					toast.error("Unable to add widget calculation.");

					return;
				}

				setActiveHistory(updated);
				setIsAddingItem(false);
				setFormKey(`added-${updated.id}-${Date.now()}`);

				toast.success("Widget calculation added.");

				return;
			}

			if (activeHistory) {
				const updated = updateCalculation(
					activeHistory.id,
					payload,
				) as WidgetHistoryItem | null;

				if (!updated) {
					toast.error("Unable to update widget calculation.");

					return;
				}

				setActiveHistory(updated);
				setFormKey(`updated-${updated.id}-${Date.now()}`);

				toast.success("Widget calculation updated.");

				return;
			}

			const saved = saveCalculation(payload) as WidgetHistoryItem;

			setActiveHistory(saved);
			setIsAddingItem(false);
			setIsOpenedFromHistory(false);
			setFormKey(`saved-${saved.id}-${Date.now()}`);

			toast.success("Widget calculation saved.");
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unable to calculate widget.";

			toast.error(message);
		}
	}

	function handleAddItem() {
		if (!activeHistory) {
			return;
		}

		setIsAddingItem(true);
		setFormKey(`add-item-${Date.now()}`);
		scrollToForm();
	}

	function handleNewCalculation() {
		/*
		 * Lepaskan hubungan dengan history lama.
		 */
		setActiveHistory(null);
		setIsAddingItem(false);
		setIsOpenedFromHistory(false);

		/*
		 * Remount form menggunakan nilai default.
		 */
		setFormKey(`new-${Date.now()}`);

		/*
		 * Hapus historyId agar useEffect tidak memuat
		 * history lama kembali.
		 */
		if (historyId) {
			removeHistoryIdFromUrl();
		}

		scrollToForm();
	}

	if (!widgetData.length) {
		return (
			<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5">
				<p className="text-sm font-bold text-[var(--sl-text)]">
					Widget data is unavailable
				</p>

				<p className="mt-2 text-xs leading-5 text-[var(--sl-text-muted)]">
					The widget database could not be loaded.
				</p>
			</div>
		);
	}

	return (
		<div className="grid gap-6">
			<div className="space-y-6 p-4">
				<div ref={formRef}>
					<WidgetForm
						key={formKey}
						data={widgetData}
						onSubmit={handleCalculate}
						initialValues={initialValues}
						mode={isUpdateMode ? "update" : "create"}
						lockMainFields={lockMainFields}
					/>
				</div>

				{activeHistory && (
					<CalculationGroupResult
						items={historyItems}
						getKey={(item) => item.id}
						renderItem={(item, index) => (
							<WidgetResult
								result={item.result}
								history={activeHistory}
								title={index === 0 ? "Result" : undefined}
								showAddButton={index === historyItems.length - 1}
								onAddItem={handleAddItem}
							/>
						)}
						renderTotal={(groupItems) => (
							<WidgetTotalResult items={groupItems} />
						)}
					/>
				)}

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
