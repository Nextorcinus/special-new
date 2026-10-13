export type Mission = {
	id: string;
	name: string;
	points: number;
	unit: string;
	priority: "great" | "medium" | "low";
	quantity: number;
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
	milestoneSets: Record<MilestoneSet, Milestone[]>;
	stages: ShowdownStage[];
};

/**
 * Menghitung poin dari satu misi.
 */
export function calculateMissionPoints(
	mission: Mission,
	quantity = mission.quantity,
): number {
	return Math.max(0, quantity) * mission.points;
}

/**
 * Menghitung total poin seluruh misi pada satu stage.
 */
export function calculateTotalPoints(missions: Mission[]): number {
	return missions.reduce(
		(total, mission) => total + calculateMissionPoints(mission),
		0,
	);
}

/**
 * Menghitung jumlah milestone yang tercapai.
 */
export function calculateCompletedMilestones(
	totalPoints: number,
	milestones: Milestone[],
): number {
	return milestones.filter((milestone) => totalPoints >= milestone.points)
		.length;
}

/**
 * Mengambil milestone berikutnya yang belum tercapai.
 */
export function getNextMilestone(
	totalPoints: number,
	milestones: Milestone[],
): Milestone | null {
	return (
		[...milestones]
			.sort((a, b) => a.points - b.points)
			.find((milestone) => totalPoints < milestone.points) ?? null
	);
}

/**
 * Memformat angka dengan pemisah ribuan.
 */
export function formatPoints(points: number): string {
	return new Intl.NumberFormat("en-US").format(points);
}
