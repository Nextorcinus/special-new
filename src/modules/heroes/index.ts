import { getHeroDetailData } from "./data/details";
import heroesDatabase from "./data/index.json";

import { getHeroById, normalizeHero, sortHeroes } from "./helpers/hero.helpers";
import { normalizeHeroDetail } from "./helpers/hero-detail.helpers";

import type {
	HeroListItem,
	NormalizedHero,
	NormalizedHeroDetail,
} from "./type";

const rawHeroes = heroesDatabase as HeroListItem[];

export const heroes: NormalizedHero[] = sortHeroes(
	rawHeroes.map(normalizeHero),
);

export function getHeroes(): NormalizedHero[] {
	return heroes;
}

export function getHero(id: string): NormalizedHero | undefined {
	return getHeroById(heroes, id);
}

export function getHeroDetail(id: string): NormalizedHeroDetail | undefined {
	const rawDetail = getHeroDetailData(id);

	if (!rawDetail) {
		return undefined;
	}

	return normalizeHeroDetail(rawDetail);
}
