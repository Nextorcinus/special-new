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

export type BuildingFormValues = {
	building: string;
	fromLevel: string;
	toLevel: string;
	petLevel: string;
	vpLevel: string;
	doubleTime: boolean;
	zinmanSkill: string;
	agnesLevel: string;
	valeriaLevel: string;
	constructionSpeed: string;
};

