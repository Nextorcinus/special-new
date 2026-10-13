"use client";

import { useAllianceShowdown } from "../hooks/useAllianceShowdown";
import MilestoneGoals from "./MilestoneGoals";
import MissionCard from "./MissionCard";
import StageSummary from "./StageSummary";
import StageTabs from "./StageTabs";

export default function AllianceShowdownCalculator() {
	const {
		stages,
		activeStage,
		activeStageId,
		setActiveStageId,
		missions,
		milestones,
		totalPoints,
		setMissionQuantity,
		resetStage,
	} = useAllianceShowdown();

	if (!activeStage) {
		return (
			<div className="rounded-xl border border-border p-6 text-sm text-muted-foreground">
				No Alliance Showdown stages available.
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<StageTabs
				stages={stages}
				activeStageId={activeStageId}
				onChange={setActiveStageId}
			/>

			<StageSummary
				stageName={activeStage.name}
				day={activeStage.day}
				totalPoints={totalPoints}
				onReset={resetStage}
			/>

			<section className="rounded-xl border border-border bg-card p-4">
				<div className="mb-3">
					<h3 className="text-sm font-semibold text-foreground">
						Milestone Goals
					</h3>

					<p className="mt-1 text-xs text-muted-foreground">
						Progress is calculated independently for each day.
					</p>
				</div>

				<MilestoneGoals milestones={milestones} totalPoints={totalPoints} />
			</section>

			<section className="space-y-3">
				<div className="flex items-center justify-between gap-3">
					<h3 className="text-sm font-semibold text-foreground">
						Stage Missions
					</h3>

					<span className="text-xs text-muted-foreground">
						{missions.length} missions
					</span>
				</div>

				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
					{missions.map((mission) => (
						<MissionCard
							key={mission.id}
							mission={mission}
							onQuantityChange={(quantity) =>
								setMissionQuantity(mission.id, quantity)
							}
						/>
					))}
				</div>
			</section>
		</div>
	);
}
