import milestoneData from "../data/milestones.json";

import type { Milestone } from "../type";

export function getMilestones(stateId: number): Milestone[] {
	const merged = stateId >= 1000 && stateId <= 1099;

	const milestones = structuredClone(milestoneData.milestones) as Milestone[];

	if (!merged) {
		return milestones;
	}

	return milestones.map((milestone) =>
		milestone.days === 440
			? {
					...milestone,
					days: 470,
				}
			: milestone,
	);
}
