export type MemberEventFieldType = "power" | "number" | "text";

export type MemberEventField = {
	key: string;
	label: string;
	type: MemberEventFieldType;
	placeholder?: string;
	required?: boolean;
};

export type MemberEventDefinition = {
	value: string;
	label: string;
	description: string;
	fields: MemberEventField[];
};

export type MemberEventLabel = {
	value: string;
	label: string;
};

export const MEMBER_EVENT_CONFIG: MemberEventDefinition[] = [
	{
		value: "winter-siege",
		label: "Winter Siege",
		description: "Store squad power for Winter Siege planning.",
		fields: [
			{
				key: "squad1Power",
				label: "Squad 1 Power",
				type: "power",
				placeholder: "2.244B",
				required: false,
			},
			{
				key: "squad2Power",
				label: "Squad 2 Power",
				type: "power",
				placeholder: "1.579B",
				required: false,
			},
		],
	},

	{
		value: "foundry-battle",
		label: "Foundry Battle",
		description: "Store troops power for Foundry Battle.",
		fields: [
			{
				key: "troopsPower",
				label: "Troops Power",
				type: "power",
				placeholder: "8.731B",
				required: true,
			},
		],
	},
];

export const MEMBER_EVENT_LABELS: MemberEventLabel[] = MEMBER_EVENT_CONFIG.map(
	(event) => ({
		value: event.value,
		label: event.label,
	}),
);

export function getMemberEventDefinition(
	eventType: string,
): MemberEventDefinition | undefined {
	return MEMBER_EVENT_CONFIG.find((event) => event.value === eventType);
}

export function getMemberEventLabel(eventType: string): string {
	return getMemberEventDefinition(eventType)?.label ?? eventType;
}

export function getMemberEventFields(eventType: string): MemberEventField[] {
	return getMemberEventDefinition(eventType)?.fields ?? [];
}
