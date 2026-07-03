import regularBuildingData from "../data/regular-building.json";
import fcBuildingData from "../data/fc-building.json";

export type BuildingType = "regular" | "fc";

type BuildingDataItem = {
	Building?: string;
	Level?: string | number;
	Duration?: string;
	Meat?: unknown;
	Wood?: unknown;
	Coal?: unknown;
	Iron?: unknown;
	Crystal?: unknown;
	"Refined Fire Crystal"?: unknown;
	"SvS Points"?: unknown;
};

type CalculateUpgradeInput = {
	type: BuildingType;
	building: string;
	fromLevel: string;
	toLevel: string;
	buffs: {
		petLevel: string;
		vpLevel: string;
		doubleTime: boolean;
		zinmanSkill: string;
		agnesLevel: string;
		constructionSpeed: number;
		valeriaBonus: number;
	};
};

function parseDurationToSeconds(str: string) {
	const d = Number(str.match(/(\d+)d/)?.[1] || 0);
	const h = Number(str.match(/(\d+)h/)?.[1] || 0);
	const m = Number(str.match(/(\d+)m/)?.[1] || 0);
	const s = Number(str.match(/(\d+)s/)?.[1] || 0);

	return d * 86400 + h * 3600 + m * 60 + s;
}

function formatDuration(seconds: number) {
	const safeSeconds = Math.max(0, seconds);

	const d = Math.floor(safeSeconds / 86400);
	const h = Math.floor((safeSeconds % 86400) / 3600);
	const m = Math.floor((safeSeconds % 3600) / 60);
	const s = Math.floor(safeSeconds % 60);

	return `${d}d ${h}h ${m}m ${s}s`;
}

function normalizeBuff(value: string, map: Record<string, number> = {}) {
	if (value in map) {
		return map[value];
	}

	return Number.parseFloat(value) || 0;
}

function parseResource(value: unknown) {
	return Number(value?.toString().replace(/[^0-9.]/g, "")) || 0;
}

const petBuffMap: Record<string, number> = {
	Off: 0,
	"Lv.1": 5,
	"Lv.2": 7,
	"Lv.3": 9,
	"Lv.4": 12,
	"Lv.5": 15,
	"Level 1": 5,
	"Level 2": 7,
	"Level 3": 9,
	"Level 4": 12,
	"Level 5": 15,
};

const zinmanBuffMap: Record<string, number> = {
	Off: 0,
	"Lv.1": 3,
	"Lv.2": 6,
	"Lv.3": 9,
	"Lv.4": 12,
	"Lv.5": 15,
	"Level 1": 3,
	"Level 2": 6,
	"Level 3": 9,
	"Level 4": 12,
	"Level 5": 15,
	"Level 1 (-3% cost)": 3,
	"Level 2 (-6% cost)": 6,
	"Level 3 (-9% cost)": 9,
	"Level 4 (-12% cost)": 12,
	"Level 5 (-15% cost)": 15,
};

const agnesBuffMap: Record<string, number> = {
	Off: 0,
	"0": 0,
	"1": 2,
	"2": 4,
	"3": 6,
	"4": 8,
	"5": 10,
	"Lv.1": 2,
	"Lv.2": 4,
	"Lv.3": 6,
	"Lv.4": 8,
	"Lv.5": 10,
	"Level 1": 2,
	"Level 2": 4,
	"Level 3": 6,
	"Level 4": 8,
	"Level 5": 10,
	"Level 1 (-2h)": 2,
	"Level 2 (-4h)": 4,
	"Level 3 (-6h)": 6,
	"Level 4 (-8h)": 8,
	"Level 5 (-10h)": 10,
};

const vpBuffMap: Record<string, number> = {
	Off: 0,
	"10%": 10,
	"15%": 15,
	"20%": 20,
	"25%": 25,
	"+10%": 10,
	"+15%": 15,
	"+20%": 20,
	"+25%": 25,
};

export function calculateUpgrade({
	type,
	building,
	fromLevel,
	toLevel,
	buffs,
}: CalculateUpgradeInput) {
	const data = (type === "regular"
		? regularBuildingData
		: fcBuildingData) as BuildingDataItem[];

	const buildingEntries = data.filter(
		(item) =>
			item.Building?.trim().toLowerCase() === building.trim().toLowerCase(),
	);

	const startIndex = buildingEntries.findIndex(
		(item) => String(item.Level) === String(fromLevel),
	);

	const endIndex = buildingEntries.findIndex(
		(item) => String(item.Level) === String(toLevel),
	);

	if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
		return null;
	}

	const range = buildingEntries.slice(startIndex + 1, endIndex + 1);

	let totalSeconds = 0;

	const rawResources = {
		Meat: 0,
		Wood: 0,
		Coal: 0,
		Iron: 0,
		Crystal: 0,
		RFC: 0,
	};

	const zinman = normalizeBuff(buffs.zinmanSkill, zinmanBuffMap);
	const zinmanMultiplier = 1 - zinman / 100;

	for (const item of range) {
		totalSeconds += parseDurationToSeconds(item.Duration || "0m");

		rawResources.Meat += parseResource(item.Meat) * zinmanMultiplier;
		rawResources.Wood += parseResource(item.Wood) * zinmanMultiplier;
		rawResources.Coal += parseResource(item.Coal) * zinmanMultiplier;
		rawResources.Iron += parseResource(item.Iron) * zinmanMultiplier;
		rawResources.Crystal += parseResource(item.Crystal);
		rawResources.RFC += parseResource(item["Refined Fire Crystal"]);
	}

	const constructionSpeed = Number(buffs.constructionSpeed) || 0;
	const vp = normalizeBuff(buffs.vpLevel, vpBuffMap);
	const pet = normalizeBuff(buffs.petLevel, petBuffMap);
	const doubleTime = buffs.doubleTime ? 20 : 0;

	const agnesHours = normalizeBuff(buffs.agnesLevel, agnesBuffMap);
	const agnesSeconds = agnesHours * 3600;

	const totalBuff = constructionSpeed + vp + pet + doubleTime;

	const reducedSeconds = Math.max(
		0,
		totalSeconds / (1 + totalBuff / 100) - agnesSeconds,
	);

	const svsBase = range.reduce((sum, item) => {
		return sum + parseResource(item["SvS Points"]);
	}, 0);

	const valeriaBonus = Math.min(Number(buffs.valeriaBonus) || 0, 20);
	const svsFinal = Math.round(svsBase * (1 + valeriaBonus / 100));

	return {
		type,
		building,
		fromLevel,
		toLevel,
		buffs,
		timeOriginal: formatDuration(totalSeconds),
		timeReduced: formatDuration(reducedSeconds),
		rawResources,
		resources: rawResources,
		svsBase,
		svsFinal,
		valeriaBonus,
		agnesHours,
	};
}