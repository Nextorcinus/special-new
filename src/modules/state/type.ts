export type StateAgeResponse = Record<string, number>;

export type MilestoneCardType =
	| "hero"
	| "item"
	| "pet"
	| "feature"
	| "equipment";

export interface MilestoneCard {
	id: string;

	type: MilestoneCardType;

	name: string;

	image: string;

	folder: string;

	acquisition?: string[];
}

export interface MilestoneGroup {
	id: string;

	groupName: string;

	cards: MilestoneCard[];
}

export interface Milestone {
	id: string;

	days: number;

	name: string;

	details?: string[];

	cards?: MilestoneCard[];

	heroGroups?: MilestoneGroup[];
}
export interface MilestoneResult extends Milestone {
	daysLeft: number;

	daysAgo: number;
}

export interface StateInfo {
	id: number;

	createdAt: Date;

	ageInDays: number;
}

export interface UseStateAgeResult {
	loading: boolean;

	state: StateInfo | null;

	upcoming: MilestoneResult[];

	previous: MilestoneResult[];
}
