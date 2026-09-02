export const RESOURCES = {
	// Resources
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
	Steel: {
		id: "steel",
		label: "Steel",
		icon: "/icons/steel.png",
	},

	// Fire Crystal
	Crystal: {
		id: "fire-crystal",
		label: "Fire Crystal",
		icon: "/icons/crystal.png",
	},
	Shard: {
		id: "shard",
		label: "Shard",
		icon: "/icons/fire_crystal_shard.png",
	},
	RFC: {
		id: "refined",
		label: "Refined Fire Crystal",
		icon: "/icons/rfc.png",
	},

	// Chief Gear
	Plans: {
		id: "design-plans",
		label: "Design Plans",
		icon: "/icons/design-plan.png",
	},
	Polish: {
		id: "polishing",
		label: "Polishing Solution",
		icon: "/icons/polishing-solution.png",
	},
	Alloy: {
		id: "hardened-alloy",
		label: "Hardened Alloy",
		icon: "/icons/hardened-alloy.png",
	},
	Amber: {
		id: "lunar-amber",
		label: "Lunar Amber",
		icon: "/icons/amber.png",
	},

	// Chief Charm
	Guide: {
		id: "guide",
		label: "Guide",
		icon: "/icons/charm-guide.png",
	},
	Design: {
		id: "design",
		label: "Design",
		icon: "/icons/charm-design.png",
	},
	Jewel: {
		id: "jewel",
		label: "Secret Charm",
		icon: "/icons/charm-secret.png",
	},

	// Pets
	PetFood: {
		id: "pet-food",
		label: "Pet Food",
		icon: "/icons/pet-food.png",
	},
	TamingManual: {
		id: "taming-manual",
		label: "Taming Manual",
		icon: "/icons/taming-manual.png",
	},
	EnergizingPotion: {
		id: "energizing-potion",
		label: "Energizing Potion",
		icon: "/icons/energizing-potion.png",
	},
	StrengtheningSerum: {
		id: "strengthening-serum",
		label: "Strengthening Serum",
		icon: "/icons/strengthening-serum.png",
	},

	// Experts
	Compass: {
		id: "expert-compass",
		label: "Compass",
		icon: "/icons/compass.png",
	},
	FieryHeart: {
		id: "expert-fiery-heart",
		label: "Fiery Heart",
		icon: "/icons/fiery-heart.png",
	},
	SailOfConquest: {
		id: "expert-sail-of-conquest",
		label: "Sail of Conquest",
		icon: "/icons/sail-of-conquest.png",
	},
	GeneralSigils: {
		id: "expert-general-sigils",
		label: "General Sigils",
		icon: "/icons/sigils.png",
	},
	BooksOfKnowledge: {
		id: "expert-books-of-knowledge",
		label: "Books of Knowledge",
		icon: "/icons/books.png",
	},
	LearningSpeedup: {
		id: "expert-learning-speedup",
		label: "Learning Speedup",
		icon: "/icons/learning_speedup.png",
	},
} as const;

export type ResourceKey = keyof typeof RESOURCES;

export const RESOURCE_KEYS = Object.keys(RESOURCES) as ResourceKey[];
