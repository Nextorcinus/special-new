export type WinterSiegeSquadId = "squad-1" | "squad-2";

export type WinterSiegeEventData = {
	squad1Power?: unknown;
	squad2Power?: unknown;
};

export type WinterSiegeMember = {
	id: string;
	name: string;
	furnace: number;
	power: string | null;
	eventData: WinterSiegeEventData;
};

export type WinterSiegeSquad = {
	id: string;
	memberId: string;
	memberName: string;
	squadId: WinterSiegeSquadId;
	squadName: string;
	power: unknown;
};

export type WinterSiegeAssignment = {
	memberId: string;
	squadId: WinterSiegeSquadId;
	locationId: string | null;
};

export type WinterSiegePlan = {
	assignments: WinterSiegeAssignment[];
};
