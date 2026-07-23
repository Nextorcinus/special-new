import type { HeroDetail, HeroSkillMap, NormalizedHeroDetail } from "../type";

export function normalizeHeroDetail(hero: HeroDetail): NormalizedHeroDetail {
	const rawExploration = hero.skills?.exploration ?? {};

	const rawExpedition =
		hero.skills?.expedition ?? getNestedExpeditionSkills(rawExploration);

	const exploration = removeNestedExpeditionSkills(rawExploration);

	return {
		...hero,
		skills: {
			exploration,
			expedition: rawExpedition,
		},
		image: getHeroAssetPath(hero.image),
		thumbnail: getHeroAssetPath(hero.thumbnail),
	};
}

export function getHeroAssetPath(filename: string | undefined): string {
	const value = normalizePath(filename);

	if (!value) {
		return "/heroes/placeholder.png";
	}

	if (isExternalPath(value)) {
		return value;
	}

	if (value.startsWith("/heroes/")) {
		return value;
	}

	if (value.startsWith("heroes/")) {
		return `/${value}`;
	}

	if (value.startsWith("/")) {
		return value;
	}

	return `/heroes/${value}`;
}

export function getHeroSkillIconPath(icon: string | undefined): string {
	const value = String(icon ?? "")
		.trim()
		.replace(/\\/g, "/");

	if (!value) {
		return "/heroes/placeholder.png";
	}

	if (
		value.startsWith("http://") ||
		value.startsWith("https://") ||
		value.startsWith("data:")
	) {
		return value;
	}

	if (value.startsWith("/heroes/")) {
		return value;
	}

	if (value.startsWith("heroes/")) {
		return `/${value}`;
	}

	if (value.startsWith("/")) {
		return value;
	}

	return `/heroes/${value}`;
}

export function getHeroUniquePassiveIconPath(icon: string | undefined): string {
	const value = normalizePath(icon);

	if (!value) {
		return "/heroes/skills/placeholder.png";
	}

	if (isExternalPath(value)) {
		return value;
	}

	if (value.startsWith("/heroes/")) {
		return value;
	}

	if (value.startsWith("heroes/")) {
		return `/${value}`;
	}

	if (value.startsWith("/")) {
		return value;
	}

	return `/heroes/skills/${value}`;
}

export function getHeroExplorationSkills(
	hero: NormalizedHeroDetail,
): HeroSkillMap {
	return hero.skills.exploration;
}

export function getHeroExpeditionSkills(
	hero: NormalizedHeroDetail,
): HeroSkillMap {
	return hero.skills.expedition;
}

export function hasHeroSkills(skills: HeroSkillMap | undefined): boolean {
	return Boolean(skills && Object.keys(skills).length > 0);
}

function getNestedExpeditionSkills(exploration: HeroSkillMap): HeroSkillMap {
	const nestedExpedition = (
		exploration as HeroSkillMap & {
			expedition?: unknown;
		}
	).expedition;

	if (!isHeroSkillMap(nestedExpedition)) {
		return {};
	}

	return nestedExpedition;
}

function removeNestedExpeditionSkills(exploration: HeroSkillMap): HeroSkillMap {
	return Object.fromEntries(
		Object.entries(exploration).filter(
			([key, value]) => key !== "expedition" && isHeroSkill(value),
		),
	) as HeroSkillMap;
}

function isHeroSkillMap(value: unknown): value is HeroSkillMap {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return false;
	}

	return Object.values(value).every((item) => isHeroSkill(item));
}

function isHeroSkill(value: unknown): boolean {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePath(value: string | undefined): string {
	return String(value ?? "")
		.trim()
		.replace(/\\/g, "/");
}

function isExternalPath(value: string): boolean {
	return (
		value.startsWith("http://") ||
		value.startsWith("https://") ||
		value.startsWith("data:")
	);
}
