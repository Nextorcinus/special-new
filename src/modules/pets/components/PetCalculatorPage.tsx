"use client";

import { ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import CalculationGroupResult from "@/components/calculator/CalculationGroupResult";
import HistoryPanel from "@/features/inventory/components/HistoryPanel";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import type {
	CalculationHistoryEntry,
	CalculationHistoryItem,
} from "@/features/inventory/store/history/types";

import { calculatePet } from "../calculator/calculatePet";
import type {
	PetCalculationResult,
	PetData,
	PetDatabase,
	PetFormValues,
} from "../type";
import PetForm from "./PetForm";
import PetResult from "./PetResult";
import PetTotalResult from "./PetTotalResult";

type PetCalculatorPageProps = {
	database: PetDatabase;
	pet: PetData;
};

type PetHistoryItem = CalculationHistoryItem<
	PetFormValues,
	PetCalculationResult
>;

type PetHistoryEntry = CalculationHistoryEntry<
	PetFormValues,
	PetCalculationResult
>;

function createHistoryTitle(result: PetCalculationResult): string {
	return result.petName;
}

function createHistorySubtitle(result: PetCalculationResult): string {
	return [
		`GEN ${result.generation}`,
		result.rarity,
		`Lv.${result.fromLevel} → Lv.${result.toLevel}`,
	].join(" · ");
}

function createEntryFromHistory(history: PetHistoryItem): PetHistoryEntry {
	return {
		id: history.id,
		title: history.title,
		subtitle: history.subtitle,
		form: history.form,
		result: history.result,
		createdAt: history.createdAt,
	};
}

function getHistoryEntries(history: PetHistoryItem | null): PetHistoryEntry[] {
	if (!history) {
		return [];
	}

	if (Array.isArray(history.items) && history.items.length > 0) {
		return history.items as PetHistoryEntry[];
	}

	if (!history.form || !history.result) {
		return [];
	}

	return [createEntryFromHistory(history)];
}

export default function PetCalculatorPage({
	database,
	pet,
}: PetCalculatorPageProps) {
	const searchParams = useSearchParams();
	const historyId = searchParams.get("historyId");

	const historyItems = useHistoryStore((state) => state.items);

	const loadHistory = useHistoryStore((state) => state.loadHistory);

	const saveCalculation = useHistoryStore((state) => state.saveCalculation);

	const updateCalculation = useHistoryStore((state) => state.updateCalculation);

	const addCalculationItem = useHistoryStore(
		(state) => state.addCalculationItem,
	);

	const togglePinHistory = useHistoryStore((state) => state.togglePinHistory);

	const deleteHistory = useHistoryStore((state) => state.deleteHistory);

	const [activeHistory, setActiveHistory] = useState<PetHistoryItem | null>(
		null,
	);

	const [result, setResult] = useState<PetCalculationResult | null>(null);

	const [isAddingItem, setIsAddingItem] = useState(false);

	const [isEditingHistory, setIsEditingHistory] = useState(false);

	const [formKey, setFormKey] = useState(0);

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	const petHistoryItems = useMemo(() => {
		return historyItems.filter((item) => {
			if (item.module !== "pet") {
				return false;
			}

			const petItem = item as PetHistoryItem;

			return petItem.form?.petId === pet.id;
		});
	}, [historyItems, pet.id]);

	useEffect(() => {
		if (!historyId || historyItems.length === 0) {
			return;
		}

		const selectedHistory = historyItems.find((item) => {
			if (String(item.id) !== historyId || item.module !== "pet") {
				return false;
			}

			const petItem = item as PetHistoryItem;

			return petItem.form?.petId === pet.id;
		}) as PetHistoryItem | undefined;

		if (!selectedHistory) {
			return;
		}

		setActiveHistory(selectedHistory);
		setResult(selectedHistory.result ?? null);
		setIsAddingItem(false);
		setIsEditingHistory(true);
		setFormKey((current) => current + 1);
	}, [historyId, historyItems, pet.id]);

	const activeHistoryId = activeHistory?.id;

	useEffect(() => {
		if (!activeHistoryId) {
			return;
		}

		const latestHistory = historyItems.find(
			(item) => item.id === activeHistoryId && item.module === "pet",
		) as PetHistoryItem | undefined;

		if (!latestHistory) {
			return;
		}

		setActiveHistory(latestHistory);
	}, [activeHistoryId, historyItems]);

	const historyEntries = useMemo(() => {
		return getHistoryEntries(activeHistory);
	}, [activeHistory]);

	const initialValues = useMemo<Partial<PetFormValues>>(() => {
		if (isAddingItem) {
			return {
				petId: pet.id,
				fromLevel: 0,
				toLevel: 1,
				valeriaLevel: activeHistory?.form?.valeriaLevel ?? 0,
			};
		}

		if (activeHistory?.form && activeHistory.form.petId === pet.id) {
			return {
				...activeHistory.form,
				petId: pet.id,
			};
		}

		return {
			petId: pet.id,
			fromLevel: 0,
			toLevel: 1,
			valeriaLevel: 0,
		};
	}, [activeHistory, isAddingItem, pet.id]);

	function replaceHistoryUrl(nextHistoryId?: string) {
		const pathname = window.location.pathname;

		window.history.replaceState(
			null,
			"",
			nextHistoryId ? `${pathname}?historyId=${nextHistoryId}` : pathname,
		);
	}

	function handleSubmit(values: PetFormValues) {
		try {
			const normalizedValues: PetFormValues = {
				...values,
				petId: pet.id,
			};

			const calculationResult = calculatePet({
				values: normalizedValues,
				database,
			});

			const title = createHistoryTitle(calculationResult);

			const subtitle = createHistorySubtitle(calculationResult);

			setResult(calculationResult);

			if (activeHistory && isAddingItem) {
				const updatedHistory = addCalculationItem(activeHistory.id, {
					module: "pet",
					category: pet.id,
					title,
					subtitle,
					form: normalizedValues,
					result: calculationResult,
				}) as PetHistoryItem | undefined;

				if (updatedHistory) {
					setActiveHistory(updatedHistory);
				}

				setIsAddingItem(false);
				setIsEditingHistory(true);
				setFormKey((current) => current + 1);

				toast.success("Pet item added.");

				return;
			}

			if (activeHistory && isEditingHistory) {
				const updatedHistory = updateCalculation(activeHistory.id, {
					module: "pet",
					category: pet.id,
					title,
					subtitle,
					form: normalizedValues,
					result: calculationResult,
				}) as PetHistoryItem | undefined;

				if (updatedHistory) {
					setActiveHistory(updatedHistory);
				}

				toast.success("Pet calculation updated.");

				return;
			}

			const savedHistory = saveCalculation({
				module: "pet",
				category: pet.id,
				title,
				subtitle,
				form: normalizedValues,
				result: calculationResult,
			}) as PetHistoryItem | undefined;

			if (!savedHistory) {
				toast.error("Unable to save pet calculation.");

				return;
			}

			setActiveHistory(savedHistory);
			setIsAddingItem(false);
			setIsEditingHistory(true);
			setFormKey((current) => current + 1);

			replaceHistoryUrl(savedHistory.id);

			toast.success("Pet calculation saved.");
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Unable to calculate pet upgrade.";

			toast.error(message);
		}
	}

	function handleAddItem() {
		if (!activeHistory) {
			return;
		}

		setIsAddingItem(true);
		setIsEditingHistory(false);
		setResult(null);
		setFormKey((current) => current + 1);

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}

	function handleNewCalculation() {
		setActiveHistory(null);
		setResult(null);
		setIsAddingItem(false);
		setIsEditingHistory(false);
		setFormKey((current) => current + 1);

		replaceHistoryUrl();

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}

	function handleReset() {
		if (isAddingItem) {
			setIsAddingItem(false);
			setIsEditingHistory(true);
			setResult(activeHistory?.result ?? null);
			setFormKey((current) => current + 1);

			return;
		}

		if (activeHistory) {
			setResult(activeHistory.result ?? null);
			setFormKey((current) => current + 1);

			return;
		}

		setResult(null);
		setFormKey((current) => current + 1);
	}

	function handleHistorySelect(item: CalculationHistoryItem) {
		if (item.module !== "pet") {
			return;
		}

		const selectedHistory = item as PetHistoryItem;

		if (selectedHistory.form?.petId !== pet.id) {
			return;
		}

		setActiveHistory(selectedHistory);
		setResult(selectedHistory.result ?? null);
		setIsAddingItem(false);
		setIsEditingHistory(true);
		setFormKey((current) => current + 1);

		replaceHistoryUrl(selectedHistory.id);

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}

	function handleDeleteHistory(id: string) {
		deleteHistory(id);

		if (activeHistory?.id !== id) {
			return;
		}

		handleNewCalculation();
	}

	const showGroupResult =
		Boolean(activeHistory) && historyEntries.length > 1 && !isAddingItem;

	const showSingleResult = Boolean(result) && !showGroupResult && !isAddingItem;

	return (
		<div className="grid gap-6">
			<div className="space-y-6">
				<div className="p-4">
					<PetForm
						key={formKey}
						pet={pet}
						initialValues={initialValues}
						mode={isEditingHistory && !isAddingItem ? "update" : "create"}
						onSubmit={handleSubmit}
						onReset={handleReset}
					/>
				</div>

				{showSingleResult && result && (
					<div className="p-4">
						<PetResult
							result={result}
							history={activeHistory}
							showAddButton={Boolean(activeHistory)}
							onAddItem={handleAddItem}
						/>
					</div>
				)}

				{showGroupResult && (
					<div className="space-y-5 p-4">
						<h2 className="text-2xl font-bold text-[var(--sl-text)]">Result</h2>

						<CalculationGroupResult
							items={historyEntries}
							getKey={(item) => item.id}
							renderItem={(item, index) => (
								<PetResult
									result={item.result}
									showAddButton={index === historyEntries.length - 1}
									onAddItem={handleAddItem}
								/>
							)}
							renderTotal={(entries) => <PetTotalResult items={entries} />}
						/>
					</div>
				)}
				{activeHistory && (
					<div className="px-4 py-2">
						<button
							type="button"
							onClick={handleNewCalculation}
							className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--sl-input)] px-4 py-3 text-sm font-semibold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-input-hover)]"
						>
							<span>New Calculation {pet.name}</span>

							<ArrowRight className="size-4" />
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
