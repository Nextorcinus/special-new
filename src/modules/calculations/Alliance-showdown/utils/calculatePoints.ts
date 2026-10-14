export type MissionPriority = "great" | "medium" | "low";

export type MissionStatus = {
	status: number;
	points: number;
};

export type MissionLevel = {
	level: number;
	points?: number;
	statuses?: MissionStatus[];
};

export type Mission = {
	id: string;
	name: string;
	points: number;
	unit: string;
	priority: MissionPriority;
	quantity: number;
	calculationType?: "simple" | "tiered";
	maxQuantity?: number;
	pointsPerScore?: number;
	levels?: MissionLevel[];
};

export type Milestone = {
	points: number;
	label: string;
};

export type MilestoneSet = "standard" | "final";

export type ShowdownStage = {
	id: string;
	day: number;
	name: string;
	milestoneSet: MilestoneSet;
	missions: Mission[];
};

export type AllianceShowdownData = {
	title: string;
	source?: string;
	notes?: string[];
	milestoneSets: Record<MilestoneSet, Milestone[]>;
	stages: ShowdownStage[];
};

export type MissionSelection = {
	level: number;
	status: number | null;
};

export type MissionRangeSelection = {
	from: MissionSelection;
	to: MissionSelection;
};

type ProgressStep = {
	level: number;
	status: number | null;
	points: number;
};

function getProgressSteps(mission: Mission): ProgressStep[] {
	const steps: ProgressStep[] = [];

	for (const level of [...(mission.levels ?? [])].sort(
		(a, b) => a.level - b.level,
	)) {
		if (level.statuses?.length) {
			for (const status of [...level.statuses].sort(
				(a, b) => a.status - b.status,
			)) {
				steps.push({
					level: level.level,
					status: status.status,
					points: status.points,
				});
			}
		} else {
			steps.push({
				level: level.level,
				status: null,
				points: level.points ?? 0,
			});
		}
	}

	return steps;
}

function getSelectionIndex(
	steps: ProgressStep[],
	selection: MissionSelection,
): number {
	if (selection.status !== null) {
		return steps.findIndex(
			(step) =>
				step.level === selection.level && step.status === selection.status,
		);
	}

	const statusSteps = steps.filter(
		(step) => step.level === selection.level && step.status !== null,
	);

	if (statusSteps.length > 0) {
		return steps.findIndex(
			(step) =>
				step.level === selection.level &&
				step.status === statusSteps[statusSteps.length - 1].status,
		);
	}

	return steps.findIndex(
		(step) => step.level === selection.level && step.status === null,
	);
}

export function getMissionPoints(
	mission: Mission,
	selection?: MissionSelection,
): number {
	if (mission.calculationType !== "tiered") {
		return mission.points;
	}

	const selectedLevel = mission.levels?.find(
		(item) => item.level === selection?.level,
	);

	if (!selectedLevel) {
		return 0;
	}

	if (selection?.status == null) {
		return selectedLevel.points ?? 0;
	}

	const selectedStatus = selectedLevel.statuses?.find(
		(item) => item.status === selection.status,
	);

	return selectedStatus?.points ?? 0;
}

export function getMissionRangePoints(
	mission: Mission,
	selection: MissionRangeSelection,
): number {
	if (mission.pointsPerScore === undefined || mission.pointsPerScore < 0) {
		return 0;
	}

	const steps = getProgressSteps(mission);

	if (steps.length === 0) {
		return 0;
	}

	const fromIndex = getSelectionIndex(steps, selection.from);
	const toIndex = getSelectionIndex(steps, selection.to);

	if (fromIndex < 0 || toIndex < 0 || toIndex <= fromIndex) {
		return 0;
	}

	const scoreIncrease = steps
		.slice(fromIndex + 1, toIndex + 1)
		.reduce((total, step) => total + step.points, 0);

	return scoreIncrease * mission.pointsPerScore;
}

export function calculateMissionPoints(
	mission: Mission,
	selection?: MissionSelection,
): number {
	const points = getMissionPoints(mission, selection);

	const quantity = Number.isFinite(mission.quantity)
		? Math.max(0, mission.quantity)
		: 0;

	return points * quantity;
}

export function calculateMissionRangePoints(
	mission: Mission,
	selection: MissionRangeSelection,
	_quantity = mission.quantity,
): number {
	return getMissionRangePoints(mission, selection);
}

export function calculateTotalPoints(missions: Mission[]): number {
	return missions.reduce(
		(total, mission) => total + calculateMissionPoints(mission),
		0,
	);
}

export function calculateCompletedMilestones(
	milestones: Milestone[],
	totalPoints: number,
): Milestone[] {
	return milestones.filter((milestone) => totalPoints >= milestone.points);
}

export function getNextMilestone(
	milestones: Milestone[],
	totalPoints: number,
): Milestone | null {
	return milestones.find((milestone) => totalPoints < milestone.points) ?? null;
}

export function formatPoints(points: number): string {
	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 2,
	}).format(points);
}
