"use client";

import { ArrowRight } from "lucide-react";
import {
	usePathname,
	useRouter,
	useSearchParams,
} from "next/navigation";
import {
	Suspense,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";

import CalculationGroupResult from "@/components/calculator/CalculationGroupResult";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import type {
	CalculationHistoryEntry,
	CalculationHistoryItem,
} from "@/features/inventory/store/history/types";

import {
	calculateWidget,
	normalizeWidgetDatabase,
} from "../calculator";

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

type HistoryStoreState = ReturnType<
	typeof useHistoryStore.getState
>;

/*
 * ================================================================
 * Main Page
 *
 * The page itself provides the Suspense boundary required by
 * useSearchParams(), usePathname(), and the routing logic below.
 * ================================================================
 */

export default function WidgetCalculatorPage(
	props: WidgetCalculatorPageProps,
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
			<WidgetCalculatorPageContent
				{...props}
			/>
		</Suspense>
	);
}

/*
 * ================================================================
 * Page Content
 *
 * All routing hooks remain inside this component, which is rendered
 * as a child of Suspense above.
 * ================================================================
 */

function WidgetCalculatorPageContent({
	data,
}: WidgetCalculatorPageProps) {
	const router = useRouter();

	const pathname =
		usePathname();

	const searchParams =
		useSearchParams();

	const historyId =
		searchParams.get("historyId");

	/*
	 * ================================================================
	 * Local State
	 * ================================================================
	 */

	const [
		activeHistory,
		setActiveHistory,
	] =
		useState<WidgetHistoryItem | null>(
			null,
		);

	const [formKey, setFormKey] =
		useState("new");

	const [
		isAddingItem,
		setIsAddingItem,
	] = useState(false);

	const [
		isOpenedFromHistory,
		setIsOpenedFromHistory,
	] = useState(false);

	const formRef =
		useRef<HTMLDivElement>(null);

	/*
	 * ================================================================
	 * Normalize Widget Database
	 * ================================================================
	 */

	const widgetData =
		useMemo<WidgetDatabaseItem[]>(() => {
			if (!Array.isArray(data)) {
				return [];
			}

			return normalizeWidgetDatabase(
				data,
			);
		}, [data]);

	/*
	 * ================================================================
	 * History Store
	 * ================================================================
	 */

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
	 * Scroll to Form
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
	 * Remove historyId from URL
	 * ================================================================
	 */

	function removeHistoryIdFromUrl() {
		const params =
			new URLSearchParams(
				searchParams.toString(),
			);

		params.delete("historyId");

		const query =
			params.toString();

		router.replace(
			query
				? `${pathname}?${query}`
				: pathname,
			{
				scroll: false,
			},
		);
	}

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
				"widget"
		) {
			return;
		}

		const widgetHistory =
			selected as WidgetHistoryItem;

		setActiveHistory(
			widgetHistory,
		);

		setIsOpenedFromHistory(true);
		setIsAddingItem(false);

		setFormKey(
			`history-${widgetHistory.id}`,
		);
	}, [
		historyId,
		items,
	]);

	/*
	 * ================================================================
	 * History Items
	 * ================================================================
	 */

	const historyItems:
		WidgetHistoryEntry[] =
		activeHistory?.items &&
		activeHistory.items.length > 0
			? (activeHistory.items as WidgetHistoryEntry[])
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
	 * Initial Form Values
	 * ================================================================
	 */

	const initialValues:
		| Partial<WidgetFormValues>
		| undefined =
		activeHistory &&
		!isAddingItem
			? activeHistory.form
			: undefined;

	const isUpdateMode =
		Boolean(activeHistory) &&
		!isAddingItem;

	const lockMainFields =
		isOpenedFromHistory &&
		!isAddingItem;

	/*
	 * ================================================================
	 * History Payload
	 * ================================================================
	 */

	function buildHistoryPayload(
		form: WidgetFormValues,
		result: WidgetCalculationResult,
	) {
		const skillType =
			result.type ===
			"exploration"
				? "Exploration"
				: "Expedition";

		return {
			module: "widget" as const,

			title:
				result.heroName ||
				"Widget",

			subtitle:
				`GEN ${result.generation} · ` +
				`Lv.${result.fromLevel} → ` +
				`Lv.${result.toLevel} · ` +
				skillType,

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
		values: WidgetFormValues,
	) {
		try {
			const formValues:
				WidgetFormValues = {
				...values,
			};

			const result =
				calculateWidget({
					data: widgetData,
					values: formValues,
				});

			const payload =
				buildHistoryPayload(
					formValues,
					result,
				);

			/*
			 * --------------------------------------------------------
			 * Add item
			 * --------------------------------------------------------
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
						| WidgetHistoryItem
						| null;

				if (!updated) {
					toast.error(
						"Unable to add widget calculation.",
					);

					return;
				}

				setActiveHistory(
					updated,
				);

				setIsAddingItem(false);

				setFormKey(
					`added-${updated.id}-${Date.now()}`,
				);

				toast.success(
					"Widget calculation added.",
				);

				return;
			}

			/*
			 * --------------------------------------------------------
			 * Update existing history
			 * --------------------------------------------------------
			 */

			if (activeHistory) {
				const updated =
					updateCalculation(
						activeHistory.id,
						payload,
					) as
						| WidgetHistoryItem
						| null;

				if (!updated) {
					toast.error(
						"Unable to update widget calculation.",
					);

					return;
				}

				setActiveHistory(
					updated,
				);

				setFormKey(
					`updated-${updated.id}-${Date.now()}`,
				);

				toast.success(
					"Widget calculation updated.",
				);

				return;
			}

			/*
			 * --------------------------------------------------------
			 * Save new history
			 * --------------------------------------------------------
			 */

			const saved =
				saveCalculation(
					payload,
				) as WidgetHistoryItem;

			setActiveHistory(saved);

			setIsAddingItem(false);
			setIsOpenedFromHistory(false);

			setFormKey(
				`saved-${saved.id}-${Date.now()}`,
			);

			toast.success(
				"Widget calculation saved.",
			);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Unable to calculate widget.";

			toast.error(message);
		}
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

		setFormKey(
			`add-item-${Date.now()}`,
		);

		scrollToForm();
	}

	/*
	 * ================================================================
	 * New Calculation
	 * ================================================================
	 */

	function handleNewCalculation() {
		/*
		 * Release connection with old history.
		 */

		setActiveHistory(null);
		setIsAddingItem(false);
		setIsOpenedFromHistory(false);

		/*
		 * Remount form using default values.
		 */

		setFormKey(
			`new-${Date.now()}`,
		);

		/*
		 * Remove historyId so the history-loading effect
		 * does not load the old history again.
		 */

		if (historyId) {
			removeHistoryIdFromUrl();
		}

		scrollToForm();
	}

	/*
	 * ================================================================
	 * Empty Widget Data
	 * ================================================================
	 */

	if (!widgetData.length) {
		return (
			<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5">
				<p className="text-sm font-bold text-[var(--sl-text)]">
					Widget data is unavailable
				</p>

				<p className="mt-2 text-xs leading-5 text-[var(--sl-text-muted)]">
					The widget database
					could not be loaded.
				</p>
			</div>
		);
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
					<WidgetForm
						key={formKey}
						data={widgetData}
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
							lockMainFields
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
							<WidgetResult
								result={
									item.result
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
							<WidgetTotalResult
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