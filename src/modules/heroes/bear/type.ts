import type { HeroClass, HeroGeneration, HeroRarity, HeroTier } from "../type";

export type BearOpeningGroup = "p2w" | "f2p";

export type BearRecommendationMode = "default" | "custom";

export type BearHeroReference = {
	heroId: string;
};

export type BearOpeningRallies = {
	p2w: string[];
	f2p: string[];
};

export type BearJoiningPriorityItem = {
	id: string;
	priority: number;
	heroId: string | null;
	label?: string;
};

export type BearRecommendationData = {
	openingRallies: BearOpeningRallies;
	joiningPriority: BearJoiningPriorityItem[];
	warning: string;
};

export type BearRecommendationState = {
	data: BearRecommendationData;
	isLoaded: boolean;

	loadRecommendation: () => void;

	setOpeningHeroes: (group: BearOpeningGroup, heroIds: string[]) => void;

	addOpeningHero: (group: BearOpeningGroup, heroId: string) => void;

	removeOpeningHero: (group: BearOpeningGroup, heroId: string) => void;

	setJoiningPriority: (items: BearJoiningPriorityItem[]) => void;

	setJoiningHero: (itemId: string, heroId: string | null) => void;

	addJoiningHero: (heroId?: string | null) => void;

	removeJoiningHero: (itemId: string) => void;

	moveJoiningHero: (itemId: string, direction: "up" | "down") => void;

	setWarning: (warning: string) => void;

	resetRecommendation: () => void;
};

export type BearHeroPickerOption = {
	value: string;
	label: string;
	thumbnail: string;
	heroClass: HeroClass;
	rarity: HeroRarity;
	generation: HeroGeneration;
	tier?: HeroTier;
};

export type BearRecommendationHero = {
	id: string;
	name: string;
	thumbnail: string;
	heroClass: HeroClass;
	rarity: HeroRarity;
	generation: HeroGeneration;
	tier?: HeroTier;
};

export type BearOpeningRecommendation = {
	group: BearOpeningGroup;
	label: string;
	heroIds: string[];
	heroes: BearRecommendationHero[];
};

export type BearJoiningRecommendation = {
	id: string;
	priority: number;
	heroId: string | null;
	label: string;
	hero?: BearRecommendationHero;
};

export type BearRecommendationViewData = {
	openingRallies: {
		p2w: BearOpeningRecommendation;
		f2p: BearOpeningRecommendation;
	};

	joiningPriority: BearJoiningRecommendation[];

	warning: string;
};

export type BearTierName = "SS" | "S" | "A" | "B" | "C" | "D";

export type BearTierHeroItem = {
	heroId: string;
	order: number;
};

export type BearTierGroup = {
	tier: BearTierName;
	label: string;
	description?: string;
	heroes: BearTierHeroItem[];
};

export type BearTierListData = {
	title: string;
	description?: string;
	tiers: BearTierGroup[];
};

export type BearGenerationGuideItem = {
	id: string;
	generation: HeroGeneration;
	title: string;
	description?: string;

	openingRallies: {
		p2w: string[];
		f2p: string[];
	};

	joiningPriority: string[];

	notes?: string[];
};

export type BearGenerationGuideData = {
	title: string;
	description?: string;
	items: BearGenerationGuideItem[];
};

export type BearRecommendationEditorValue = {
	openingRallies: BearOpeningRallies;
	joiningPriority: BearJoiningPriorityItem[];
	warning: string;
};
