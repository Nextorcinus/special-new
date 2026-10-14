"use client";

import { useAllianceShowdown } from "../hooks/useAllianceShowdown";
import AllStagesSummary from "./AllStagesSummary";
import MilestoneGoals from "./MilestoneGoals";
import MissionCard from "./MissionCard";
import StageSummary from "./StageSummary";
import StageTabs from "./StageTabs";
import TieredMissionCard from "./TieredMissionCard";

export default function AllianceShowdownCalculator() {
	const {
		stages,
		activeStage,
		activeStageId,
		setActiveStageId,
		missions,
		milestones,
		totalPoints,
		finalPoints,
		baldurLevel,
		setBaldurLevel,
		baldurBonusPercent,
		baldurMultiplier,
		baldurBonus,
		setMissionQuantity,
		selections,
		setMissionSelection,
		rangeSelections,
		setMissionRangeSelection,
		resetStage,
		allStageSummaries,
		allStagesTotalPoints,
		allStagesBaldurBonus,
		allStagesFinalPoints,
	} = useAllianceShowdown();

	if (!activeStage) {
		return (
			<div className="rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-6 text-sm text-[var(--sl-text-muted)]">
				No Alliance Showdown stages available.
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<header className="space-y-2">
				<h1 className="text-2xl font-bold tracking-tight text-[var(--sl-text)]">
					Alliance Showdown Calculator
				</h1>

				<p className="text-sm leading-relaxed text-[var(--sl-text-muted)]">
					Calculate your daily points and track milestone goals for every
					Alliance Showdown stage.
				</p>
			</header>

			<StageTabs
				stages={stages}
				activeStageId={activeStageId}
				onChange={setActiveStageId}
			/>

			<StageSummary
				stageName={activeStage.name}
				day={activeStage.day}
				totalPoints={totalPoints}
				finalPoints={finalPoints}
				baldurLevel={baldurLevel}
				baldurBonusPercent={baldurBonusPercent}
				baldurMultiplier={baldurMultiplier}
				baldurBonus={baldurBonus}
				onBaldurLevelChange={setBaldurLevel}
				onReset={resetStage}
			/>

			<section className="rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
				<div className="mb-3">
					<h2 className="text-sm font-semibold text-[var(--sl-text)]">
						Milestone Goals
					</h2>

					<p className="mt-1 text-xs leading-relaxed text-[var(--sl-text-muted)]">
						Progress is calculated independently for each day.
					</p>
				</div>

				<MilestoneGoals milestones={milestones} totalPoints={finalPoints} />
			</section>

			<section className="space-y-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h2 className="text-sm font-semibold text-[var(--sl-text)]">
						Stage Missions
					</h2>

					<span className="text-xs text-[var(--sl-text-muted)]">
						{missions.length} missions
					</span>
				</div>

				<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
					{missions.map((mission, index) =>
						mission.calculationType === "tiered" ? (
							<TieredMissionCard
								key={`${activeStage.id}-${mission.id}`}
								mission={mission}
								index={index}
								selection={
									selections[mission.id] ?? {
										level: mission.levels?.[0]?.level ?? 0,
										status: null,
									}
								}
								onSelectionChange={(selection) =>
									setMissionSelection(mission.id, selection)
								}
								rangeSelection={rangeSelections[mission.id]}
								onRangeSelectionChange={(selection) =>
									setMissionRangeSelection(mission.id, selection)
								}
								onQuantityChange={(quantity) =>
									setMissionQuantity(mission.id, quantity)
								}
							/>
						) : (
							<MissionCard
								key={`${activeStage.id}-${mission.id}`}
								mission={mission}
								index={index}
								onQuantityChange={(quantity) =>
									setMissionQuantity(mission.id, quantity)
								}
							/>
						),
					)}
				</div>
			</section>

			<AllStagesSummary
				stages={allStageSummaries}
				totalPoints={allStagesTotalPoints}
				finalPoints={allStagesFinalPoints}
				baldurLevel={baldurLevel}
				baldurBonus={allStagesBaldurBonus}
			/>
		</div>
	);
}
