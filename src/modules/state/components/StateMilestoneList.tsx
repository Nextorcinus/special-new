"use client";

import type { MilestoneResult } from "../type";
import StateMilestoneCard from "./StateMilestoneCard";

type Props = {
	title: string;
	milestones: MilestoneResult[];
	upcoming?: boolean;
};

export default function StateMilestoneList({
	title,
	milestones,
	upcoming = false,
}: Props) {
	if (milestones.length === 0) {
		return null;
	}

	return (
		<section className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold tracking-tight">{title}</h2>

				<span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
					{milestones.length}
				</span>
			</div>

			<div className="space-y-6">
				{milestones.map((milestone) => (
					<StateMilestoneCard
						key={`${milestone.days}-${milestone.name}`}
						milestone={milestone}
						upcoming={upcoming}
					/>
				))}
			</div>
		</section>
	);
}
