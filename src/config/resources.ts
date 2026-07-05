export const RESOURCES = {
	Meat: {
		id: "meat",
		label: "Meat",
		icon: "/icons/meat.png",
	},
	Wood: {
		id: "wood",
		label: "Wood",
		icon: "/icons/wood.png",
	},
	Coal: {
		id: "coal",
		label: "Coal",
		icon: "/icons/coal.png",
	},
	Iron: {
		id: "iron",
		label: "Iron",
		icon: "/icons/iron.png",
	},
	Crystal: {
		id: "fire-crystal",
		label: "FC",
		icon: "/icons/crystal.png",
	},
	RFC: {
		id: "refined",
		label: "RFC",
		icon: "/icons/rfc.png",
	},
} as const;

export type ResourceKey = keyof typeof RESOURCES;

export const RESOURCE_KEYS = Object.keys(RESOURCES) as ResourceKey[];