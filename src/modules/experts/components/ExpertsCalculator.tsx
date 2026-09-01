"use client";

import { ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import HistoryPanel from "@/features/inventory/components/HistoryPanel";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import type {
	CalculationHistoryEntry,
	CalculationHistoryItem,
} from "@/features/inventory/store/history/types";

import { EXPERT_GENERATIONS, getExpertsByGeneration } from "../data";

import { useExpertsCalculator } from "../hooks/useExpertsCalculator";
import type { ExpertsCalculationResult, ExpertsState } from "../types";
import { ExpertGeneration } from "./ExpertGeneration";
import { ExpertInventory } from "./ExpertInventory";
import { ExpertsResult } from "./ExpertsResult";

/* =========================================================
 * HISTORY TYPES
 * ========================================================= */

type ExpertsHistoryItem = CalculationHistoryItem<
	ExpertsState,
	ExpertsCalculationResult
>;

type ExpertsHistoryEntry = CalculationHistoryEntry<
	ExpertsState,
	ExpertsCalculationResult
>;

type HistoryStoreState = ReturnType<typeof useHistoryStore.getState>;

/* =========================================================
 * EVENT LEVELS
 * ========================================================= */

const EVENT_LEVELS = Array.from({ length: 11 }, (_, level) => level);

/* =========================================================
 * MAIN COMPONENT
 * ========================================================= */

export function ExpertsCalculator() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-[200px] items-center justify-center p-5">
					<p className="text-sm text-white/40">Loading Experts Calculator...</p>
				</div>
			}
		>
			<ExpertsCalculatorContent />
		</Suspense>
	);
}

/* =========================================================
 * CONTENT
 * ========================================================= */

function ExpertsCalculatorContent() {
	const searchParams = useSearchParams();

	const historyId = searchParams.get("historyId");

	/* =======================================================
	 * CALCULATOR
	 * ======================================================= */

	const {
		state,
		result,
		setInventory,
		setValeriaLevel,
		setBaldurLevel,
		setRelationshipCurrentLevel,
		setRelationshipTargetLevel,
		setCurrentAffinity,
		setCurrentSigils,
		setSkillCurrentLevel,
		setSkillTargetLevel,
		setSkillCurrentXp,
		loadState,
		reset,
	} = useExpertsCalculator();

	/* =======================================================
	 * LOCAL HISTORY STATE
	 * ======================================================= */

	const [activeHistory, setActiveHistory] = useState<ExpertsHistoryItem | null>(
		null,
	);

	const [isAddingItem, setIsAddingItem] = useState(false);

	const [isEditingHistory, setIsEditingHistory] = useState(false);

	const [formKey, setFormKey] = useState("experts-new");

	const formRef = useRef<HTMLDivElement>(null);

	/* =======================================================
	 * HISTORY STORE
	 * ======================================================= */

	const historyItems = useHistoryStore(
		(state: HistoryStoreState) => state.items,
	);

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

	const togglePinHistory = useHistoryStore(
		(state: HistoryStoreState) => state.togglePinHistory,
	);

	const deleteHistory = useHistoryStore(
		(state: HistoryStoreState) => state.deleteHistory,
	);

	/* =======================================================
	 * GENERATIONS
	 * ======================================================= */

	const generations = useMemo(
		() =>
			EXPERT_GENERATIONS.map((generation) => ({
				generation,
				experts: getExpertsByGeneration(generation),
			})),
		[],
	);

	/* =======================================================
	 * LOAD HISTORY
	 * ======================================================= */

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	/* =======================================================
	 * FIND SELECTED HISTORY
	 * ======================================================= */

	useEffect(() => {
		if (!historyId) {
			return;
		}

		const selected = historyItems.find(
			(item) => String(item.id) === historyId && item.module === "experts",
		) as ExpertsHistoryItem | undefined;

		if (!selected) {
			return;
		}

		setActiveHistory(selected);
		setIsAddingItem(false);
		setIsEditingHistory(true);

		/*
		 * Restore calculator state
		 * from saved history.
		 */
		if (selected.form) {
			loadState(selected.form);
		}

		setFormKey(`experts-${selected.id}`);
	}, [historyId, historyItems, loadState]);

	/* =======================================================
	 * SYNC ACTIVE HISTORY
	 * ======================================================= */

	useEffect(() => {
		if (!activeHistory) {
			return;
		}

		const latest = historyItems.find((item) => item.id === activeHistory.id) as
			| ExpertsHistoryItem
			| undefined;

		if (!latest) {
			return;
		}

		setActiveHistory(latest);
	}, [activeHistory?.id, historyItems]);

	/* =======================================================
	 * HISTORY ENTRIES
	 * ======================================================= */

	const historyEntries = useMemo<ExpertsHistoryEntry[]>(() => {
		if (!activeHistory) {
			return [];
		}

		if (Array.isArray(activeHistory.items) && activeHistory.items.length > 0) {
			return activeHistory.items as ExpertsHistoryEntry[];
		}

		if (!activeHistory.form || !activeHistory.result) {
			return [];
		}

		return [
			{
				id: activeHistory.id,
				title: activeHistory.title,
				subtitle: activeHistory.subtitle,
				form: activeHistory.form,
				result: activeHistory.result,
				createdAt: activeHistory.createdAt,
			},
		];
	}, [activeHistory]);

	/* =======================================================
	 * HISTORY PAYLOAD
	 * ======================================================= */

	function buildHistoryPayload(calculationResult: ExpertsCalculationResult) {
		const selectedExperts = calculationResult.experts;

		const title =
			selectedExperts.length === 1
				? selectedExperts[0].name
				: selectedExperts.length > 1
					? `${selectedExperts.length} Experts`
					: "Experts Calculator";

		const subtitle =
			selectedExperts.length === 1
				? `Generation ${selectedExperts[0].generation} · ${selectedExperts[0].focus}`
				: `SvS ${formatPoints(
						calculationResult.svsPoints,
					)} · Showdown ${formatPoints(calculationResult.showdownPoints)}`;

		return {
			module: "experts" as const,
			title,
			subtitle,
			form: state,
			result: calculationResult,
		};
	}

	/* =======================================================
	 * SAVE / UPDATE
	 * ======================================================= */

	function handleSaveCalculation() {
		const calculationResult = result;

		const hasResult =
			calculationResult.totalAffinity > 0 ||
			calculationResult.totalSigils > 0 ||
			calculationResult.totalBooks > 0 ||
			calculationResult.totalLearningMinutes > 0;

		if (!hasResult) {
			return;
		}

		const payload = buildHistoryPayload(calculationResult);

		/* ===================================================
		 * ADD ITEM
		 * =================================================== */

		if (activeHistory && isAddingItem) {
			const updated = addCalculationItem(activeHistory.id, payload) as
				| ExpertsHistoryItem
				| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(updated);

			setIsAddingItem(false);
			setIsEditingHistory(true);

			setFormKey(`experts-${updated.id}`);

			return;
		}

		/* ===================================================
		 * UPDATE
		 * =================================================== */

		if (activeHistory && isEditingHistory) {
			const updated = updateCalculation(activeHistory.id, payload) as
				| ExpertsHistoryItem
				| undefined;

			if (!updated) {
				return;
			}

			setActiveHistory(updated);

			setIsAddingItem(false);
			setIsEditingHistory(true);

			setFormKey(`experts-${updated.id}`);

			return;
		}

		/* ===================================================
		 * CREATE NEW HISTORY
		 * =================================================== */

		const saved = saveCalculation(payload) as ExpertsHistoryItem;

		setActiveHistory(saved);

		setIsAddingItem(false);
		setIsEditingHistory(true);

		setFormKey(`experts-${saved.id}`);

		window.history.replaceState(
			null,
			"",
			`${window.location.pathname}?historyId=${saved.id}`,
		);
	}

	/* =======================================================
	 * ADD ITEM
	 * ======================================================= */

	function handleAddItem() {
		if (!activeHistory) {
			return;
		}

		setIsAddingItem(true);
		setIsEditingHistory(false);

		reset();

		setFormKey(`experts-add-${Date.now()}`);

		requestAnimationFrame(() => {
			formRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		});
	}

	/* =======================================================
	 * NEW CALCULATION
	 * ======================================================= */

	function handleNewCalculation() {
		setActiveHistory(null);
		setIsAddingItem(false);
		setIsEditingHistory(false);

		reset();

		setFormKey(`experts-new-${Date.now()}`);

		window.history.replaceState(null, "", window.location.pathname);

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}

	/* =======================================================
	 * HISTORY SELECT
	 * ======================================================= */

	function handleHistorySelect(item: CalculationHistoryItem) {
		if (item.module !== "experts") {
			return;
		}

		const selected = item as ExpertsHistoryItem;

		setActiveHistory(selected);

		setIsAddingItem(false);
		setIsEditingHistory(true);

		if (selected.form) {
			loadState(selected.form);
		}

		setFormKey(`experts-${selected.id}`);

		window.history.replaceState(
			null,
			"",
			`${window.location.pathname}?historyId=${selected.id}`,
		);

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}

	/* =======================================================
	 * PIN
	 * ======================================================= */

	function handlePinHistory(id: string) {
		togglePinHistory(id);
	}

	/* =======================================================
	 * DELETE
	 * ======================================================= */

	function handleDeleteHistory(id: string) {
		deleteHistory(id);

		if (activeHistory?.id !== id) {
			return;
		}

		setActiveHistory(null);
		setIsAddingItem(false);
		setIsEditingHistory(false);

		reset();

		setFormKey(`experts-new-${Date.now()}`);

		window.history.replaceState(null, "", window.location.pathname);
	}

	/* =======================================================
	 * RESET
	 * ======================================================= */

	function handleReset() {
		if (isAddingItem) {
			setIsAddingItem(false);

			if (activeHistory) {
				setIsEditingHistory(true);

				loadState(activeHistory.form);

				setFormKey(`experts-${activeHistory.id}`);
			} else {
				reset();
			}

			return;
		}

		if (activeHistory) {
			loadState(activeHistory.form);

			setFormKey(`experts-${activeHistory.id}`);

			return;
		}

		reset();

		setFormKey(`experts-reset-${Date.now()}`);
	}

	/* =======================================================
	 * RENDER
	 * ======================================================= */

	return (
		<div key={formKey} className="w-full space-y-6 p-4 sm:p-5">
			{/* ===================================================
			    HEADER
			    =================================================== */}

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-xl font-semibold text-white">
						Experts Calculator
					</h1>

					<p className="mt-1 text-sm text-white/50">
						Plan Expert relationship and skill upgrades.
					</p>
				</div>

				<div className="flex gap-2">
					{activeHistory && (
						<button
							type="button"
							onClick={handleNewCalculation}
							className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
						>
							New
							<ArrowRight className="size-4" />
						</button>
					)}

					<button
						type="button"
						onClick={handleReset}
						className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
					>
						Reset
					</button>
				</div>
			</div>

			{/* ===================================================
			    INVENTORY
			    =================================================== */}

			<ExpertInventory inventory={state.inventory} onChange={setInventory} />

			{/* ===================================================
			    EVENT BONUS
			    =================================================== */}

			<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
				<div>
					<h2 className="text-sm font-semibold text-white">Event Bonus</h2>

					<p className="mt-1 text-xs text-white/40">
						Set Valeria and Baldur levels used for SvS and Alliance Showdown
						calculation.
					</p>
				</div>

				<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
					{/* VALERIA */}

					<div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-white">Valeria</p>

								<p className="mt-0.5 text-xs text-white/40">SvS Bonus</p>
							</div>

							<div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-right">
								<p className="text-[10px] uppercase tracking-wide text-white/30">
									Bonus
								</p>

								<p className="mt-0.5 text-sm font-semibold text-white">
									+{state.valeriaLevel * 2}%
								</p>
							</div>
						</div>

						<div className="mt-3">
							<label
								htmlFor="experts-valeria-level"
								className="mb-1.5 block text-xs font-medium text-white/50"
							>
								Valeria Level
							</label>

							<select
								id="experts-valeria-level"
								value={state.valeriaLevel}
								onChange={(event) =>
									setValeriaLevel(Number(event.target.value))
								}
								className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition hover:bg-white/10 focus:border-white/20 focus:bg-white/10"
							>
								{EVENT_LEVELS.map((level) => (
									<option
										key={level}
										value={level}
										className="bg-zinc-900 text-white"
									>
										{level === 0
											? "Level 0"
											: `Level ${level} (+${level * 2}% SvS)`}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* BALDUR */}

					<div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-white">Baldur</p>

								<p className="mt-0.5 text-xs text-white/40">
									Alliance Showdown
								</p>
							</div>

							<div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-right">
								<p className="text-[10px] uppercase tracking-wide text-white/30">
									Bonus
								</p>

								<p className="mt-0.5 text-sm font-semibold text-white">
									+{state.baldurLevel * 5}%
								</p>
							</div>
						</div>

						<div className="mt-3">
							<label
								htmlFor="experts-baldur-level"
								className="mb-1.5 block text-xs font-medium text-white/50"
							>
								Baldur Level
							</label>

							<select
								id="experts-baldur-level"
								value={state.baldurLevel}
								onChange={(event) => setBaldurLevel(Number(event.target.value))}
								className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition hover:bg-white/10 focus:border-white/20 focus:bg-white/10"
							>
								{EVENT_LEVELS.map((level) => (
									<option
										key={level}
										value={level}
										className="bg-zinc-900 text-white"
									>
										{level === 0
											? "Level 0"
											: `Level ${level} (+${level * 5}% Showdown)`}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
			</section>

			{/* ===================================================
			    EXPERT GENERATIONS
			    =================================================== */}

			<div className="space-y-6">
				{generations.map(({ generation, experts }) => (
					<ExpertGeneration
						key={generation}
						generation={generation}
						experts={experts}
						relationships={state.relationships}
						skills={state.skills}
						onCurrentRelationshipChange={setRelationshipCurrentLevel}
						onTargetRelationshipChange={setRelationshipTargetLevel}
						onCurrentAffinityChange={setCurrentAffinity}
						onCurrentSigilsChange={setCurrentSigils}
						onCurrentSkillLevelChange={setSkillCurrentLevel}
						onTargetSkillLevelChange={setSkillTargetLevel}
						onSkillXpChange={setSkillCurrentXp}
					/>
				))}
			</div>

			{/* ===================================================
			    CURRENT RESULT
			    =================================================== */}

			<ExpertsResult result={result} />

			{/* ===================================================
			    SAVE
			    =================================================== */}

			<div className="space-y-3">
				<button
					type="button"
					onClick={handleSaveCalculation}
					className="h-10 w-full rounded-xl bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--sl-text-muted)]"
				>
					{activeHistory
						? isAddingItem
							? "Add Calculation"
							: "Update Calculation"
						: "Save Calculation"}
				</button>

				{activeHistory && (
					<button
						type="button"
						onClick={handleAddItem}
						className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
					>
						Add Another Calculation
					</button>
				)}
			</div>

			{/* ===================================================
			    HISTORY
			    =================================================== */}

			<HistoryPanel
				items={historyItems.filter((item) => item.module === "experts")}
				activeId={activeHistory?.id ?? null}
				module="experts"
				title="Experts History"
				onSelect={handleHistorySelect}
				onPin={handlePinHistory}
				onDelete={handleDeleteHistory}
			/>
		</div>
	);
}

/* =========================================================
 * HELPERS
 * ========================================================= */

function formatPoints(value: number): string {
	if (!Number.isFinite(value)) {
		return "0";
	}

	if (Math.abs(value) >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(2)}M`;
	}

	if (Math.abs(value) >= 1_000) {
		return `${(value / 1_000).toFixed(2)}K`;
	}

	return Math.round(value).toLocaleString();
}
