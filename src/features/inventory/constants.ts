import { RESOURCES } from "@/config/resources";

export const RESOURCE_GROUPS = [
	{
		id: "resources",
		title: "Resources",
		items: [
			RESOURCES.Meat,
			RESOURCES.Wood,
			RESOURCES.Coal,
			RESOURCES.Iron,
			RESOURCES.Steel,
		],
	},
	{
		id: "crystal-fire",
		title: "Crystal Fire",
		items: [RESOURCES.Crystal, RESOURCES.Shard, RESOURCES.RFC],
	},
	{
		id: "chief-gear",
		title: "Chief Gear",
		items: [
			RESOURCES.Plans,
			RESOURCES.Polish,
			RESOURCES.Alloy,
			RESOURCES.Amber,
		],
	},
	{
		id: "chief-charm",
		title: "Chief Charm",
		items: [RESOURCES.Guide, RESOURCES.Design, RESOURCES.Jewel],
	},

	{
		id: "pets",
		title: "Pets",
		items: [
			RESOURCES.PetFood,
			RESOURCES.TamingManual,
			RESOURCES.EnergizingPotion,
			RESOURCES.StrengtheningSerum,
		],
	},
];
