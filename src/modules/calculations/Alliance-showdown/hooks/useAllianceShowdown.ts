"use client";

import { useCallback, useMemo, useState } from "react";
import showdownData from "../data/alliance-showdown.json";
import {
  calculateTotalPoints,
  type AllianceShowdownData,
  type Mission,
} from "../utils/calculatePoints";

const data = showdownData as unknown as AllianceShowdownData;

type StageQuantities = Record<string, Record<string, number>>;

function createInitialQuantities(): StageQuantities {
  return Object.fromEntries(
    data.stages.map((stage) => [
      stage.id,
      Object.fromEntries(
        stage.missions.map((mission) => [
          mission.id,
          mission.quantity ?? 0,
        ]),
      ),
    ]),
  );
}

export function useAllianceShowdown() {
  const [activeStageId, setActiveStageId] = useState(
    data.stages[0]?.id ?? "",
  );

  const [quantities, setQuantities] = useState<StageQuantities>(
    createInitialQuantities,
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
        quantities[activeStage.id]?.[mission.id] ??
        mission.quantity ??
        0,
    }));
  }, [activeStage, quantities]);

  const milestones = useMemo(() => {
    if (!activeStage) return [];

    return data.milestoneSets[activeStage.milestoneSet] ?? [];
  }, [activeStage]);

  const totalPoints = useMemo(
    () => calculateTotalPoints(missions),
    [missions],
  );

  const updateBaldurLevel = useCallback((level: number) => {
    const safeLevel = Number.isFinite(level)
      ? Math.min(10, Math.max(0, Math.floor(level)))
      : 0;

    setBaldurLevel(safeLevel);
  }, []);

  const baldurBonusPercent = baldurLevel * 5;
  const baldurMultiplier = 1 + baldurBonusPercent / 100;

  const baldurBonus = Math.floor(
    (totalPoints * baldurBonusPercent) / 100,
  );

  const finalPoints = totalPoints + baldurBonus;

  const allStageSummaries = useMemo(() => {
    return data.stages.map((stage) => {
      const stageMissions: Mission[] = stage.missions.map((mission) => ({
        ...mission,
        quantity:
          quantities[stage.id]?.[mission.id] ??
          mission.quantity ??
          0,
      }));

      const stageTotalPoints = calculateTotalPoints(stageMissions);

      const stageBaldurBonus = Math.floor(
        (stageTotalPoints * baldurBonusPercent) / 100,
      );

      return {
        id: stage.id,
        day: stage.day,
        name: stage.name,
        totalPoints: stageTotalPoints,
        finalPoints: stageTotalPoints + stageBaldurBonus,
      };
    });
  }, [quantities, baldurBonusPercent]);

  const allStagesTotalPoints = useMemo(
    () =>
      allStageSummaries.reduce(
        (sum, stage) => sum + stage.totalPoints,
        0,
      ),
    [allStageSummaries],
  );

  const allStagesBaldurBonus = useMemo(
    () =>
      allStageSummaries.reduce(
        (sum, stage) => sum + (stage.finalPoints - stage.totalPoints),
        0,
      ),
    [allStageSummaries],
  );

  const allStagesFinalPoints =
    allStagesTotalPoints + allStagesBaldurBonus;

  const updateMissionQuantity = useCallback(
    (missionId: string, quantity: number) => {
      if (!activeStage) return;

      const safeQuantity = Number.isFinite(quantity)
        ? Math.max(0, Math.floor(quantity))
        : 0;

      setQuantities((previous) => ({
        ...previous,
        [activeStage.id]: {
          ...previous[activeStage.id],
          [missionId]: safeQuantity,
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
          0,
        ]),
      ),
    }));
  }, [activeStage]);

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
    allStageSummaries,
    allStagesTotalPoints,
    allStagesBaldurBonus,
    allStagesFinalPoints,
    resetStage,
  };
}
