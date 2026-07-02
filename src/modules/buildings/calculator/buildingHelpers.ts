import regularBuildingData from "../data/regular-building.json";
import fcBuildingData from "../data/fc-building.json";
import type { BuildingType } from "../types";

type BuildingData = {
	Building: string;
	Level: string;
};

export function getBuildingData(type: BuildingType): BuildingData[] {
	return (type === "regular"
		? regularBuildingData
		: fcBuildingData) as BuildingData[];
}

export function getBuildingOptions(type: BuildingType) {
	const data = getBuildingData(type);

	return [...new Set(data.map((item) => item.Building))];
}

export function getLevelOptions(
	type: BuildingType,
	building: string,
) {
	const data = getBuildingData(type);

	return data
		.filter((item) => item.Building === building)
		.map((item) => item.Level);
}

export function getFilteredToLevels(
	levelOptions: string[],
	fromLevel: string,
) {
	const index = levelOptions.indexOf(fromLevel);

	if (index === -1) return [];

	return levelOptions.slice(index + 1);
}