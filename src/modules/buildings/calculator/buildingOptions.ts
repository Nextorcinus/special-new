import regularBuildingData from "../data/regular-building.json";
import fcBuildingData from "../data/fc-building.json";
import type { BuildingType } from "../types";

type BuildingDataItem = {
	Building?: string;
	Level?: string | number;
};

function getBuildingData(type: BuildingType) {
	return type === "regular" ? regularBuildingData : fcBuildingData;
}

export function getBuildingOptions(type: BuildingType) {
	const data = getBuildingData(type) as BuildingDataItem[];

	return Array.from(
		new Set(
			data
				.map((item) => item.Building)
				.filter(Boolean)
				.map(String),
		),
	);
}

export function getLevelOptions(type: BuildingType, building: string) {
	const data = getBuildingData(type) as BuildingDataItem[];

	return data
		.filter((item) => item.Building === building)
		.map((item) => String(item.Level));
}