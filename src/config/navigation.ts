export type NavigationGroup = "chief" | "heroes" | "development";

export type NavigationItem = {
	id: string;
	title: string;
	icon: string;
	href: string;
	group?: NavigationGroup;
};

export const NAVIGATION: NavigationItem[] = [
	// Chief
	{
		id: "charm",
		title: "Chief Charm",
		icon: "/category/chief-charm.png",
		href: "/charm",
		group: "chief",
	},
	{
		id: "gear",
		title: "Chief Gear",
		icon: "/category/chief-gear.png",
		href: "/gear",
		group: "chief",
	},

	// Heroes
	{
		id: "heroes",
		title: "Heroes List",
		icon: "/category/heroes.png",
		href: "/heroes",
		group: "heroes",
	},
	{
		id: "experts",
		title: "Heroes Expert",
		icon: "/category/heroes-expert.png",
		href: "/experts",
		group: "heroes",
	},

	// Development
	{
		id: "buildings",
		title: "Buildings",
		icon: "/category/building-upgrade.png",
		href: "/buildings",
		group: "development",
	},
	{
		id: "research",
		title: "Research",
		icon: "/category/research.png",
		href: "/research",
		group: "development",
	},
	{
		id: "pets",
		title: "Pets",
		icon: "/category/pet-building.png",
		href: "/pets",
		group: "development",
	},

	// Other
	{
		id: "troops",
		title: "Troops",
		icon: "/category/troops-assistant.png",
		href: "/troops",
	},
	{
		id: "war-academy",
		title: "War Academy",
		icon: "/category/war-academy.png",
		href: "/war-academy",
	},
	{
		id: "rfc",
		title: "RFC",
		icon: "/category/rfc.png",
		href: "/rfc",
	},
	{
		id: "widget",
		title: "Widget",
		icon: "/category/widget.png",
		href: "/widget",
	},
	{
		id: "state",
		title: "State",
		icon: "/category/state-age.png",
		href: "/state",
	},
];
