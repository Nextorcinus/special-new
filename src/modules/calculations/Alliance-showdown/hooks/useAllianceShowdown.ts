"use client";

import { useCallback, useMemo, useState } from "react";
import showdownData from "../data/alliance-showdown.json";
import {
	type AllianceShowdownData,
	calculateMissionRangePoints,
	getMissionPoints,
	type Mission,
	type MissionRangeSelection,
	type MissionSelection,
} from "../utils/calculatePoints";

const data = showdownData as unknown as AllianceShowdownData;

type StageQuantities = Record<string, Record<string, number>>;
type StageSelections = Record<string, Record<string, MissionSelection>>;
type StageRangeSelections = Record<
	string,
	Record<string, MissionRangeSelection>
>;

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

function calculateMissionBaldurBonus(
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

			const bonusPoints = calculateMissionBaldurBonus(basePoints, bonusPercent);

			return {
				basePoints: total.basePoints + basePoints,
				bonusPoints: total.bonusPoints + bonusPoints,
				finalPoints: total.finalPoints + basePoints + bonusPoints,
			};
		},
		{ basePoints: 0, bonusPoints: 0, finalPoints: 0 },
	);
}

export function useAllianceShowdown() {
	const [activeStageId, setActiveStageId] = useState(data.stages[0]?.id ?? "");

	const [quantities, setQuantities] = useState<StageQuantities>(
		createInitialQuantities,
	);

	const [selections, setSelections] = useState<StageSelections>(
		createInitialSelections,
	);

	const [rangeSelections, setRangeSelections] = useState<StageRangeSelections>(
		createInitialRangeSelections,
	);

	const [baldurLevel, setBaldurLevel] = useState(0);

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

	const baldurBonusPercent = baldurLevel * 5;
	const baldurMultiplier = 1 + baldurBonusPercent / 100;

	const activeStageCalculation = useMemo(
		() =>
			calculateStagePoints(
				missions,
				activeSelections,
				activeRangeSelections,
				baldurBonusPercent,
			),
		[missions, activeSelections, activeRangeSelections, baldurBonusPercent],
	);

	const totalPoints = activeStageCalculation.basePoints;
	const baldurBonus = activeStageCalculation.bonusPoints;
	const finalPoints = activeStageCalculation.finalPoints;

	const updateBaldurLevel = useCallback((level: number) => {
		const safeLevel = Number.isFinite(level)
			? Math.min(10, Math.max(0, Math.floor(level)))
			: 0;

		setBaldurLevel(safeLevel);
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
					baldurBonusPercent,
				);

				return {
					id: stage.id,
					day: stage.day,
					name: stage.name,
					totalPoints: calculation.basePoints,
					finalPoints: calculation.finalPoints,
				};
			}),
		[quantities, selections, rangeSelections, baldurBonusPercent],
	);

	const allStagesTotalPoints = useMemo(
		() => allStageSummaries.reduce((sum, stage) => sum + stage.totalPoints, 0),
		[allStageSummaries],
	);

	const allStagesBaldurBonus = useMemo(
		() =>
			allStageSummaries.reduce(
				(sum, stage) => sum + stage.finalPoints - stage.totalPoints,
				0,
			),
		[allStageSummaries],
	);

	const allStagesFinalPoints = allStagesTotalPoints + allStagesBaldurBonus;

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
		baldurLevel,
		setBaldurLevel: updateBaldurLevel,
		baldurBonusPercent,
		baldurMultiplier,
		baldurBonus,
		selections: activeSelections,
		setMissionSelection: updateMissionSelection,
		rangeSelections: activeRangeSelections,
		setMissionRangeSelection: updateMissionRangeSelection,
		allStageSummaries,
		allStagesTotalPoints,
		allStagesBaldurBonus,
		allStagesFinalPoints,
		resetStage,
	};
}
