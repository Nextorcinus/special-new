export type BuildingType = "regular" | "fc";

export type BuildingCategory = {
	id: BuildingType;
	title: string;
	icon: string;
	href: string;
};

export type BuildingOption = {
	id: string;
	name: string;
	type: BuildingType;
};