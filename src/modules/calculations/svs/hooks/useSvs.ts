"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import svsJson from "../data/svs.json";

import {
	calculateMissionRangePoints,
	getMissionPoints,
	type Mission,
	type MissionRangeSelection,
	type MissionSelection,
	type SvsData,
} from "../utils/calculatePoints";

const data = svsJson as unknown as SvsData;

type StageQuantities = Record<string, Record<string, number>>;
type StageSelections = Record<string, Record<string, MissionSelection>>;
type StageRangeSelections = Record<
	string,
	Record<string, MissionRangeSelection>
>;

type SvsProgress = {
	activeStageId: string;
	quantities: StageQuantities;
	selections: StageSelections;
	rangeSelections: StageRangeSelections;
	valeriaLevel: number;
};

type StorageMode = "local" | "remote";

const STORAGE_KEY = "special-lazyness-SvsProgress";
const SAVE_DEBOUNCE_MS = 500;

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sameValue(
	a: number | string | null | undefined,
	b: number | string | null | undefined,
): boolean {
	return a === b || (a != null && b != null && String(a) === String(b));
}

function createDefaultSelection(mission: Mission): MissionSelection {
	return {
		level: mission.levels?.[0]?.level ?? 0,
		status: null,
	};
}

function createDefaultRangeSelection(mission: Mission): MissionRangeSelection {
	const initial = createDefaultSelection(mission);

	return {
		from: { ...initial },
		to: { ...initial },
	};
}

function createInitialQuantities(): StageQuantities {
	return Object.fromEntries(
		data.stages.map((stage) => [
			stage.id,
			Object.fromEntries(
				stage.missions.map((mission) => [mission.id, mission.quantity ?? 0]),
			),
		]),
	);
}

function createInitialSelections(): StageSelections {
	return Object.fromEntries(
		data.stages.map((stage) => [
			stage.id,
			Object.fromEntries(
				stage.missions
					.filter(
						(mission) =>
							mission.calculationType === "tiered" &&
							mission.pointsPerScore === undefined,
					)
					.map((mission) => [mission.id, createDefaultSelection(mission)]),
			),
		]),
	);
}

function createInitialRangeSelections(): StageRangeSelections {
	return Object.fromEntries(
		data.stages.map((stage) => [
			stage.id,
			Object.fromEntries(
				stage.missions
					.filter(
						(mission) =>
							mission.calculationType === "tiered" &&
							mission.pointsPerScore !== undefined,
					)
					.map((mission) => [mission.id, createDefaultRangeSelection(mission)]),
			),
		]),
	);
}

function createInitialProgress(): SvsProgress {
	return {
		activeStageId: data.stages[0]?.id ?? "",
		quantities: createInitialQuantities(),
		selections: createInitialSelections(),
		rangeSelections: createInitialRangeSelections(),
		valeriaLevel: 0,
	};
}

/**
 * Read local progress safely.
 * This function is only called inside client-side effects.
 */
function readLocalProgress(): Partial<SvsProgress> | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);

		if (!raw) return null;

		const parsed: unknown = JSON.parse(raw);

		if (!isRecord(parsed)) return null;

		const progress: Partial<SvsProgress> = {};

		if (typeof parsed.activeStageId === "string") {
			progress.activeStageId = parsed.activeStageId;
		}

		if (isRecord(parsed.quantities)) {
			progress.quantities = parsed.quantities as StageQuantities;
		}

		if (isRecord(parsed.selections)) {
			progress.selections = parsed.selections as StageSelections;
		}

		if (isRecord(parsed.rangeSelections)) {
			progress.rangeSelections = parsed.rangeSelections as StageRangeSelections;
		}

		if (
			typeof parsed.valeriaLevel === "number" &&
			Number.isFinite(parsed.valeriaLevel)
		) {
			progress.valeriaLevel = Math.min(
				10,
				Math.max(0, Math.floor(parsed.valeriaLevel)),
			);
		}

		return progress;
	} catch (error) {
		console.error("[Svs] Failed to read local progress:", error);

		return null;
	}
}

/**
 * Merge saved stage records with the current defaults.
 * This preserves default entries when saved data is incomplete.
 */
function mergeStageRecords<T>(
	initial: Record<string, Record<string, T>>,
	saved: unknown,
): Record<string, Record<string, T>> {
	if (!isRecord(saved)) return initial;

	const result: Record<string, Record<string, T>> = {
		...initial,
	};

	for (const [stageId, savedStage] of Object.entries(saved)) {
		if (!isRecord(savedStage)) continue;

		result[stageId] = {
			...(initial[stageId] ?? {}),
			...(savedStage as Record<string, T>),
		};
	}

	return result;
}

function calculateMissionBasePoints(
	mission: Mission,
	selection?: MissionSelection,
	rangeSelection?: MissionRangeSelection,
): number {
	if (mission.pointsPerScore !== undefined) {
		if (!rangeSelection) return 0;

		return calculateMissionRangePoints(mission, rangeSelection);
	}

	const points = getMissionPoints(mission, selection);
	const quantity = Number.isFinite(mission.quantity)
		? Math.max(0, mission.quantity)
		: 0;

	return points * quantity;
}

function calculateMissionValeriaBonus(
	basePoints: number,
	bonusPercent: number,
): number {
	return Math.floor((basePoints * bonusPercent) / 100);
}

function calculateStagePoints(
	missions: Mission[],
	selections: Record<string, MissionSelection>,
	rangeSelections: Record<string, MissionRangeSelection>,
	bonusPercent: number,
): { basePoints: number; bonusPoints: number; finalPoints: number } {
	return missions.reduce(
		(total, mission) => {
			const basePoints = calculateMissionBasePoints(
				mission,
				selections[mission.id],
				rangeSelections[mission.id],
			);

			const bonusPoints = calculateMissionValeriaBonus(
				basePoints,
				bonusPercent,
			);

			return {
				basePoints: total.basePoints + basePoints,
				bonusPoints: total.bonusPoints + bonusPoints,
				finalPoints: total.finalPoints + basePoints + bonusPoints,
			};
		},
		{ basePoints: 0, bonusPoints: 0, finalPoints: 0 },
	);
}

export function useSvs() {
	const initialProgress = useMemo(createInitialProgress, []);

	const [activeStageId, setActiveStageId] = useState(
		initialProgress.activeStageId,
	);

	const [quantities, setQuantities] = useState<StageQuantities>(
		initialProgress.quantities,
	);

	const [selections, setSelections] = useState<StageSelections>(
		initialProgress.selections,
	);

	const [rangeSelections, setRangeSelections] = useState<StageRangeSelections>(
		initialProgress.rangeSelections,
	);

	const [valeriaLevel, setValeriaLevel] = useState(0);

	const [isProgressLoaded, setIsProgressLoaded] = useState(false);
	const [storageMode, setStorageMode] = useState<StorageMode>("local");

	/**
	 * Load server progress first.
	 *
	 * If the user is authenticated and has saved server progress,
	 * that progress takes precedence over local progress.
	 *
	 * If the user is not authenticated, local progress is restored.
	 */
	useEffect(() => {
		let cancelled = false;

		const applyProgress = (progress: Partial<SvsProgress>) => {
			if (cancelled) return;

			const validStageIds = new Set(data.stages.map((stage) => stage.id));

			const nextStageId =
				progress.activeStageId && validStageIds.has(progress.activeStageId)
					? progress.activeStageId
					: (data.stages[0]?.id ?? "");

			setActiveStageId(nextStageId);

			if (progress.quantities) {
				setQuantities((previous) =>
					mergeStageRecords(previous, progress.quantities),
				);
			}

			if (progress.selections) {
				setSelections((previous) =>
					mergeStageRecords(previous, progress.selections),
				);
			}

			if (progress.rangeSelections) {
				setRangeSelections((previous) =>
					mergeStageRecords(previous, progress.rangeSelections),
				);
			}

			if (typeof progress.valeriaLevel === "number") {
				setValeriaLevel(
					Math.min(10, Math.max(0, Math.floor(progress.valeriaLevel))),
				);
			}
		};

		async function loadProgress() {
			let remoteRequestSucceeded = false;

			try {
				const response = await fetch("/api/svs", {
					method: "GET",
					cache: "no-store",
				});

				if (cancelled) return;

				if (response.ok) {
					const result: unknown = await response.json();

					if (!isRecord(result)) {
						throw new Error("Invalid Svs API response");
					}

					remoteRequestSucceeded = true;

					if (isRecord(result.data)) {
						applyProgress(result.data as Partial<SvsProgress>);
					} else {
						// The account has no saved progress yet.
						// Restore local progress so it can be migrated
						// to the account by the save effect.
						const localProgress = readLocalProgress();

						if (localProgress) {
							applyProgress(localProgress);
						}
					}
				} else if (response.status !== 401) {
					throw new Error(
						`Failed to load server progress: HTTP ${response.status}`,
					);
				}
			} catch (error) {
				console.error("[Svs] Failed to load remote progress:", error);
			}

			if (cancelled) return;

			if (!remoteRequestSucceeded) {
				const localProgress = readLocalProgress();

				if (localProgress) {
					applyProgress(localProgress);
				}
			}

			if (cancelled) return;

			setStorageMode(remoteRequestSucceeded ? "remote" : "local");

			setIsProgressLoaded(true);
		}

		void loadProgress();

		return () => {
			cancelled = true;
		};
	}, []);

	/**
	 * Save progress after loading has finished.
	 *
	 * Local progress is written immediately.
	 * Remote progress is debounced to reduce API requests.
	 */
	useEffect(() => {
		if (!isProgressLoaded) return;

		const progress: SvsProgress = {
			activeStageId,
			quantities,
			selections,
			rangeSelections,
			valeriaLevel,
		};

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
		} catch (error) {
			console.error("[Svs] Failed to save local progress:", error);
		}

		if (storageMode !== "remote") return;

		const controller = new AbortController();

		const saveTimer = setTimeout(() => {
			void fetch("/api/svs", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ data: progress }),
				signal: controller.signal,
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error(`Save failed: HTTP ${response.status}`);
					}
				})
				.catch((error: unknown) => {
					if (error instanceof Error && error.name === "AbortError") {
						return;
					}

					console.error("[Svs] Failed to save remote progress:", error);
				});
		}, SAVE_DEBOUNCE_MS);

		return () => {
			clearTimeout(saveTimer);
			controller.abort();
		};
	}, [
		isProgressLoaded,
		storageMode,
		activeStageId,
		quantities,
		selections,
		rangeSelections,
		valeriaLevel,
	]);

	const activeStage = useMemo(
		() =>
			data.stages.find((stage) => stage.id === activeStageId) ??
			data.stages[0] ??
			null,
		[activeStageId],
	);

	const missions = useMemo<Mission[]>(() => {
		if (!activeStage) return [];

		return activeStage.missions.map((mission) => ({
			...mission,
			quantity:
				quantities[activeStage.id]?.[mission.id] ?? mission.quantity ?? 0,
		}));
	}, [activeStage, quantities]);

	const activeSelections = useMemo(
		() => (activeStage ? (selections[activeStage.id] ?? {}) : {}),
		[activeStage, selections],
	);

	const activeRangeSelections = useMemo(
		() => (activeStage ? (rangeSelections[activeStage.id] ?? {}) : {}),
		[activeStage, rangeSelections],
	);

	const milestones = useMemo(() => {
		if (!activeStage) return [];

		return data.milestoneSets[activeStage.milestoneSet] ?? [];
	}, [activeStage]);

	const valeriaBonusPercent = valeriaLevel * 2;
	const valeriaMultiplier = 1 + valeriaBonusPercent / 100;

	const activeStageCalculation = useMemo(
		() =>
			calculateStagePoints(
				missions,
				activeSelections,
				activeRangeSelections,
				valeriaBonusPercent,
			),
		[missions, activeSelections, activeRangeSelections, valeriaBonusPercent],
	);

	const totalPoints = activeStageCalculation.basePoints;
	const valeriaBonus = activeStageCalculation.bonusPoints;
	const finalPoints = activeStageCalculation.finalPoints;

	const updateValeriaLevel = useCallback((level: number) => {
		const safeLevel = Number.isFinite(level)
			? Math.min(10, Math.max(0, Math.floor(level)))
			: 0;

		setValeriaLevel(safeLevel);
	}, []);

	const updateMissionQuantity = useCallback(
		(missionId: string, quantity: number) => {
			if (!activeStage) return;

			const mission = activeStage.missions.find(
				(item) => item.id === missionId,
			);

			if (!mission) return;

			const safeQuantity = Number.isFinite(quantity)
				? Math.max(0, Math.floor(quantity))
				: 0;

			const limitedQuantity =
				mission.maxQuantity === undefined
					? safeQuantity
					: Math.min(mission.maxQuantity, safeQuantity);

			setQuantities((previous) => ({
				...previous,
				[activeStage.id]: {
					...previous[activeStage.id],
					[missionId]: limitedQuantity,
				},
			}));
		},
		[activeStage],
	);

	const updateMissionSelection = useCallback(
		(missionId: string, selection: MissionSelection) => {
			if (!activeStage) return;

			const mission = activeStage.missions.find(
				(item) => item.id === missionId,
			);

			if (
				!mission ||
				mission.calculationType !== "tiered" ||
				mission.pointsPerScore !== undefined
			) {
				return;
			}

			const selectedLevel = mission.levels?.find((level) =>
				sameValue(level.level, selection.level),
			);

			if (!selectedLevel) return;

			let safeStatus: number | string | null = null;

			if (selection.status !== null) {
				const selectedStatus = selectedLevel.statuses?.find((status) =>
					sameValue(status.status, selection.status),
				);

				if (!selectedStatus) return;

				safeStatus = selectedStatus.status;
			}

			setSelections((previous) => ({
				...previous,
				[activeStage.id]: {
					...previous[activeStage.id],
					[missionId]: {
						level: selectedLevel.level,
						status: safeStatus,
					},
				},
			}));
		},
		[activeStage],
	);

	const updateMissionRangeSelection = useCallback(
		(missionId: string, selection: MissionRangeSelection) => {
			if (!activeStage) return;

			const mission = activeStage.missions.find(
				(item) => item.id === missionId,
			);

			if (
				!mission ||
				mission.calculationType !== "tiered" ||
				mission.pointsPerScore === undefined
			) {
				return;
			}

			const validateEndpoint = (
				endpoint: MissionSelection,
			): MissionSelection | null => {
				const level = mission.levels?.find((item) =>
					sameValue(item.level, endpoint.level),
				);

				if (!level) return null;

				if (endpoint.status === null) {
					return {
						level: level.level,
						status: null,
					};
				}

				const status = level.statuses?.find((item) =>
					sameValue(item.status, endpoint.status),
				);

				if (!status) return null;

				return {
					level: level.level,
					status: status.status,
				};
			};

			const from = validateEndpoint(selection.from);
			const to = validateEndpoint(selection.to);

			if (!from || !to) return;

			setRangeSelections((previous) => ({
				...previous,
				[activeStage.id]: {
					...previous[activeStage.id],
					[missionId]: { from, to },
				},
			}));
		},
		[activeStage],
	);

	const resetStage = useCallback(() => {
		if (!activeStage) return;

		setQuantities((previous) => ({
			...previous,
			[activeStage.id]: Object.fromEntries(
				activeStage.missions.map((mission) => [
					mission.id,
					mission.quantity ?? 0,
				]),
			),
		}));

		setSelections((previous) => ({
			...previous,
			[activeStage.id]: Object.fromEntries(
				activeStage.missions
					.filter(
						(mission) =>
							mission.calculationType === "tiered" &&
							mission.pointsPerScore === undefined,
					)
					.map((mission) => [mission.id, createDefaultSelection(mission)]),
			),
		}));

		setRangeSelections((previous) => ({
			...previous,
			[activeStage.id]: Object.fromEntries(
				activeStage.missions
					.filter(
						(mission) =>
							mission.calculationType === "tiered" &&
							mission.pointsPerScore !== undefined,
					)
					.map((mission) => [mission.id, createDefaultRangeSelection(mission)]),
			),
		}));
	}, [activeStage]);

	const allStageSummaries = useMemo(
		() =>
			data.stages.map((stage) => {
				const stageMissions = stage.missions.map((mission) => ({
					...mission,
					quantity: quantities[stage.id]?.[mission.id] ?? mission.quantity ?? 0,
				}));

				const calculation = calculateStagePoints(
					stageMissions,
					selections[stage.id] ?? {},
					rangeSelections[stage.id] ?? {},
					valeriaBonusPercent,
				);

				return {
					id: stage.id,
					day: stage.day,
					name: stage.name,
					totalPoints: calculation.basePoints,
					finalPoints: calculation.finalPoints,
				};
			}),
		[quantities, selections, rangeSelections, valeriaBonusPercent],
	);

	const allStagesTotalPoints = useMemo(
		() => allStageSummaries.reduce((sum, stage) => sum + stage.totalPoints, 0),
		[allStageSummaries],
	);

	const allStagesValeriaBonus = useMemo(
		() =>
			allStageSummaries.reduce(
				(sum, stage) => sum + stage.finalPoints - stage.totalPoints,
				0,
			),
		[allStageSummaries],
	);

	const allStagesFinalPoints = allStagesTotalPoints + allStagesValeriaBonus;

	return {
		stages: data.stages,
		activeStage,
		activeStageId,
		setActiveStageId,
		missions,
		setMissionQuantity: updateMissionQuantity,
		milestones,
		totalPoints,
		finalPoints,
		valeriaLevel,
		setValeriaLevel: updateValeriaLevel,
		valeriaBonusPercent,
		valeriaMultiplier,
		valeriaBonus,
		selections: activeSelections,
		setMissionSelection: updateMissionSelection,
		rangeSelections: activeRangeSelections,
		setMissionRangeSelection: updateMissionRangeSelection,
		allStageSummaries,
		allStagesTotalPoints,
		allStagesValeriaBonus,
		allStagesFinalPoints,
		resetStage,
		isProgressLoaded,
		storageMode,
	};
}
