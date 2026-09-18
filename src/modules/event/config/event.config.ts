import type { LucideIcon } from "lucide-react";
import { Flame, Shield, Swords, Trophy } from "lucide-react";

export type EventDefinition = {
	id: string;
	name: string;
	description: string;
	icon: LucideIcon;
	available: boolean;
	route: string;
};

export const EVENT_CONFIG: EventDefinition[] = [
	{
		id: "winter-siege",
		name: "Winter Siege",
		description:
			"Plan stronghold attacks, assign members, and build your siege strategy.",
		icon: Swords,
		available: true,
		route: "/events/winter-siege",
	},

	{
		id: "foundry-battle",
		name: "Foundry Battle",
		description:
			"Prepare your members and organize your Foundry Battle lineup.",
		icon: Shield,
		available: false,
		route: "/events/foundry-battle",
	},

	{
		id: "canyon",
		name: "Canyon",
		description: "Prepare member assignments and strategy for Canyon battles.",
		icon: Trophy,
		available: false,
		route: "/events/canyon",
	},

	{
		id: "bear-trap",
		name: "Bear Trap",
		description:
			"Organize member formations and optimize your Bear Trap setup.",
		icon: Flame,
		available: false,
		route: "/events/bear-trap",
	},
];

export function getEventDefinition(eventId: string) {
	return EVENT_CONFIG.find((event) => event.id === eventId);
}
