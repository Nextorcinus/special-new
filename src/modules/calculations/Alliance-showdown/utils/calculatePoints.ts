export type MissionPriority = "great" | "medium" | "low";

export type MissionStatus = {
	status: number | string;
	points: number;
};

export type MissionLevel = {
	level: number | string;
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
	level: number | string;
	status: number | string | null;
};

export type MissionRangeSelection = {
	from: MissionSelection;
	to: MissionSelection;
};

type ProgressStep = {
	level: number | string;
	status: number | string | null;
	points: number;
};

function sameValue(
	a: number | string | null | undefined,
	b: number | string | null | undefined,
): boolean {
	return a === b || (a != null && b != null && String(a) === String(b));
}

/**
 * Mengikuti urutan level dan status dari JSON.
 * Jangan mengurutkan berdasarkan nama karena urutan teks
 * belum tentu sama dengan urutan progresi permainan.
 */
function getProgressSteps(mission: Mission): ProgressStep[] {
	const steps: ProgressStep[] = [];

	for (const level of mission.levels ?? []) {
		if (level.statuses?.length) {
			for (const status of level.statuses) {
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
	const matchingIndices = steps
		.map((step, index) => ({ step, index }))
		.filter(({ step }) => sameValue(step.level, selection.level));

	if (matchingIndices.length === 0) {
		return -1;
	}

	if (selection.status !== null) {
		const exactMatch = matchingIndices.find(({ step }) =>
			sameValue(step.status, selection.status),
		);

		return exactMatch?.index ?? -1;
	}

	// Base Level pada level yang memiliki status dianggap
	// sebagai posisi sebelum status pertama level tersebut.
	const firstStatusIndex = matchingIndices.find(
		({ step }) => step.status !== null,
	);

	if (firstStatusIndex) {
		return firstStatusIndex.index - 1;
	}

	return matchingIndices[0].index;
}

export function getMissionPoints(
	mission: Mission,
	selection?: MissionSelection,
): number {
	if (mission.calculationType !== "tiered") {
		return mission.points;
	}

	if (!selection) {
		return 0;
	}

	const selectedLevel = mission.levels?.find((item) =>
		sameValue(item.level, selection.level),
	);

	if (!selectedLevel) {
		return 0;
	}

	if (selection.status === null) {
		return selectedLevel.points ?? 0;
	}

	const selectedStatus = selectedLevel.statuses?.find((item) =>
		sameValue(item.status, selection.status),
	);

	return selectedStatus?.points ?? selectedLevel.points ?? 0;
}

/**
 * Menghitung jumlah langkah progresi antara From dan To.
 *
 * Poin setiap langkah dijumlahkan satu per satu, bukan
 * mengurangkan nilai endpoint yang mungkin sama.
 */
export function getMissionRangePoints(
	mission: Mission,
	selection: MissionRangeSelection,
): number {
	const pointsPerScore = mission.pointsPerScore;

	if (
		pointsPerScore === undefined ||
		!Number.isFinite(pointsPerScore) ||
		pointsPerScore < 0
	) {
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

	return scoreIncrease * pointsPerScore;
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
