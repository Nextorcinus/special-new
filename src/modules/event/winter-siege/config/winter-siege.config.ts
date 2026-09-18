export type WinterSiegeLocationType = "base" | "gate" | "stronghold";

export type WinterSiegeMapLocation = {
	id: string;
	name: string;
	type: WinterSiegeLocationType;
	x: number;
	y: number;
	maxSquads: number;
};

export const WINTER_SIEGE_MAP_LOCATIONS: WinterSiegeMapLocation[] = [
	// ============================================
	// ROW 1: GATES
	// ============================================
	{
		id: "gate-1",
		name: "Gate 1",
		type: "gate",
		x: 22,
		y: 22,
		maxSquads: 2,
	},
	{
		id: "gate-2",
		name: "Gate 2",
		type: "gate",
		x: 50,
		y: 22,
		maxSquads: 2,
	},
	{
		id: "gate-3",
		name: "Gate 3",
		type: "gate",
		x: 78,
		y: 22,
		maxSquads: 2,
	},

	// ============================================
	// ROW 2: STRONGHOLDS
	// ============================================
	{
		id: "stronghold-1",
		name: "Stronghold 1",
		type: "stronghold",
		x: 34,
		y: 52,
		maxSquads: 3,
	},
	{
		id: "stronghold-2",
		name: "Stronghold 2",
		type: "stronghold",
		x: 66,
		y: 52,
		maxSquads: 3,
	},

	// ============================================
	// ROW 3: BASE
	// ============================================
	{
		id: "base",
		name: "Base",
		type: "base",
		x: 50,
		y: 82,
		maxSquads: 4,
	},
];
