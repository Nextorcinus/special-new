import type { MemberEventDefinition } from "../config/member-event.config";

export type Member = {
	id: string;
	name: string;
	furnace: number;
	power: string | null;
	createdAt: string;
	updatedAt: string;
};

export type MemberFormValues = {
	name: string;
	furnace: string;
	power: string;
};

export type MemberEventData = {
	id: string;
	memberId: string;
	eventType: string;
	data: Record<string, unknown>;
	createdAt: string;
	updatedAt: string;
};

export type MemberEventFormValues = {
	eventType: string;
	data: Record<string, string>;
};

export type { MemberEventDefinition };
