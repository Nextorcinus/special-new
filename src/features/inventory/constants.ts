import type { ResourceGroup } from "./types";

export const RESOURCE_GROUPS: ResourceGroup[] = [
	{
		id: "chief-gear",
		title: "Chief Gear",
		items: [
			{
				id: "design-plans",
				label: "Design Plans",
				icon: "/icons/design-plan.png",
				value: "",
			},
			{
				id: "polishing",
				label: "Polishing",
				icon: "/icons/polishing-solution.png",
				value: "",
			},
			{
				id: "hardened-alloy",
				label: "Hardened Alloy",
				icon: "/icons/hardened-alloy.png",
				value: "",
			},
			{
				id: "lunar-amber",
				label: "Lunar Amber",
				icon: "/icons/amber.png",
				value: "",
			},
		],
	},
	{
		id: "chief-charm",
		title: "Chief Charm",
		items: [
			{
				id: "guide",
				label: "Guide",
				icon: "/icons/charm-guide.png",
				value: "",
			},
			{
				id: "design",
				label: "Design",
				icon: "/icons/charm-design.png",
				value: "",
			},
			{
				id: "jewel",
				label: "Jewel",
				icon: "/icons/charm-secret.png",
				value: "",
			},
		],
	},
	{
		id: "crystal-fire",
		title: "Crystal Fire",
		items: [
			{
				id: "fire-crystal",
				label: "Fire Crystal",
				icon: "/icons/crystal.png",
				value: "",
			},
			{
				id: "shard",
				label: "Shard",
				icon: "/icons/fire_crystal_shard.png",
				value: "",
			},
			{ id: "refined", label: "Refined", icon: "/icons/rfc.png", value: "" },
		],
	},
	{
		id: "resources",
		title: "Resources",
		items: [
			{ id: "meat", label: "Meat", icon: "/icons/meat.png", value: "" },
			{ id: "wood", label: "Wood", icon: "/icons/wood.png", value: "" },
			{ id: "coal", label: "Coal", icon: "/icons/coal.png", value: "" },
			{ id: "iron", label: "Iron", icon: "/icons/iron.png", value: "" },
			{ id: "steel", label: "Steel", icon: "/icons/steel.png", value: "" },
		],
	},
];
