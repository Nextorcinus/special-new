"use client";

import type { Milestone } from "../utils/calculatePoints";
import { formatPoints } from "../utils/calculatePoints";

type MilestoneGoalsProps = {
	milestones: Milestone[];
	totalPoints: number;
};

export default function MilestoneGoals({
	milestones,
	totalPoints,
}: MilestoneGoalsProps) {
	const sortedMilestones = [...milestones].sort((a, b) => a.points - b.points);

	const completedCount = sortedMilestones.filter(
		(milestone) => totalPoints >= milestone.points,
	).length;

	const nextMilestone = sortedMilestones.find(
		(milestone) => totalPoints < milestone.points,
	);

	return (
		<section className="space-y-3">
			<div className="flex flex-wrap items-center gap-2">
				{sortedMilestones.map((milestone) => {
					const completed = totalPoints >= milestone.points;

					return (
						<div
							key={milestone.points}
							title={`${formatPoints(milestone.points)} points`}
							className={[
								"rounded-md border px-2.5 py-1 text-xs font-medium",
								"transition-colors duration-200",
								completed
									? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
									: "border-border bg-muted text-muted-foreground",
							].join(" ")}
						>
							{completed ? "✓ " : ""}
							{milestone.label}
						</div>
					);
				})}
			</div>

			<p className="text-xs text-muted-foreground">
				{completedCount} of {sortedMilestones.length} milestones completed
			</p>

			{nextMilestone ? (
				<p className="text-sm text-muted-foreground">
					Next goal:{" "}
					<span className="font-medium text-foreground">
						{nextMilestone.label}
					</span>
					{" · "}
					{formatPoints(nextMilestone.points - totalPoints)} pts remaining
				</p>
			) : sortedMilestones.length > 0 ? (
				<p className="text-sm font-medium text-emerald-400">
					All milestones completed!
				</p>
			) : null}
		</section>
	);
}
