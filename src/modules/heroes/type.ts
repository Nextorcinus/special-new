export type HeroClass = "Infantry" | "Lancer" | "Marksman" | string;

export type HeroRarity = "Rare" | "Epic" | "Mythic" | "Legendary" | string;

export type HeroTier = "S" | "A" | "B" | "C" | "D" | string;

export type HeroGeneration = string | number;

export type HeroListItem = {
	id: string;
	name: string;
	rarity: HeroRarity;
	class: HeroClass;
	thumbnail: string;
	generation: HeroGeneration;
	tier?: HeroTier;
};

export type HeroFilterClass = "all" | HeroClass;

export type HeroFilterRarity = "all" | HeroRarity;

export type HeroFilterGeneration = "all" | HeroGeneration;

export type HeroFiltersValue = {
	search: string;
	heroClass: HeroFilterClass;
	rarity: HeroFilterRarity;
	generation: HeroFilterGeneration;
};

export type NormalizedHero = {
	id: string;
	name: string;
	heroClass: HeroClass;
	rarity: HeroRarity;
	generation: HeroGeneration;
	tier?: HeroTier;
	thumbnail: string;
};

export type HeroSkillEffect = {
	"effect-name"?: string;
	"affect-on"?: string[];
	stats?: Array<string | number>;
	description?: string;
	icon?: string;
};

export type HeroSkill = {
	"skill-name": string;
	"trigger-point"?: string;
	"trigger-time"?: string;
	effects?: HeroSkillEffect;
};

export type HeroSkillMap = Record<string, HeroSkill>;

export type HeroSkillsRaw = {
	exploration?: HeroSkillMap & {
		expedition?: HeroSkillMap;
	};

	expedition?: HeroSkillMap;
};

export type HeroStats = {
	attack?: number | string;
	defense?: number | string;
	health?: number | string;
};

export type HeroExpeditionStats = {
	attack?: number | string;
	defense?: number | string;
	health?: number | string;
	lethality?: number | string;
};

export type HeroWidgetDetail = {
	"has-widget"?: boolean;
};

export type HeroWidgetExplorationStats = {
	attack?: number | string;
	defense?: number | string;
	health?: number | string;
	ability?: string;
	icon?: string;
	name?: string;
};

export type HeroWidgetExpeditionStats = {
	lethality?: number | string;

	/**
	 * Beberapa JSON lama memakai huruf kapital.
	 */
	Health?: number | string;

	/**
	 * Tetap didukung untuk data yang sudah dinormalisasi.
	 */
	health?: number | string;

	ability?: string;
	icon?: string;
	name?: string;
};

export type HeroWidgetStats = {
	exploration?: HeroWidgetExplorationStats;
	expedition?: HeroWidgetExpeditionStats;
};

export type HeroUniquePassive = {
	name?: string;
	icon?: string;
	ability?: string;
	stats?: string;
};

export type HeroDetail = {
	id: string;
	name: string;
	generation: HeroGeneration;
	rarity: HeroRarity;
	class: HeroClass;

	stats?: HeroStats;
	expedition?: HeroExpeditionStats;

	skills?: HeroSkillsRaw;

	widget?: HeroWidgetDetail;

	"widget-name"?: string;
	"widget-icon"?: string;
	"widget-affect-on"?: string;
	"widget-description"?: string | string[];
	"widget-level"?: string;
	"widget-stats"?: HeroWidgetStats;

	uniquePassive?: HeroUniquePassive;

	image: string;
	thumbnail: string;
};

export type NormalizedHeroDetail = Omit<HeroDetail, "skills"> & {
	skills: {
		exploration: HeroSkillMap;
		expedition: HeroSkillMap;
	};
};
