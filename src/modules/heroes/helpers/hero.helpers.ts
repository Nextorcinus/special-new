import type {
	HeroClass,
	HeroFiltersValue,
	HeroGeneration,
	HeroListItem,
	HeroRarity,
	NormalizedHero,
} from "../type";

type SelectOption = {
	value: string;
	label: string;
};

export const HERO_CLASS_OPTIONS: SelectOption[] = [
	{
		value: "all",
		label: "All Classes",
	},
	{
		value: "Infantry",
		label: "Infantry",
	},
	{
		value: "Lancer",
		label: "Lancer",
	},
	{
		value: "Marksman",
		label: "Marksman",
	},
];

export const HERO_RARITY_OPTIONS: SelectOption[] = [
	{
		value: "all",
		label: "All Rarities",
	},
	{
		value: "Rare",
		label: "Rare",
	},
	{
		value: "Epic",
		label: "Epic",
	},
	{
		value: "Legendary",
		label: "Legendary",
	},
	{
		value: "Mythic",
		label: "Mythic",
	},
];

export const DEFAULT_HERO_FILTERS: HeroFiltersValue = {
	search: "",
	heroClass: "all",
	rarity: "all",
	generation: "all",
};

const HERO_CLASS_LABELS: Record<string, string> = {
	infantry: "Infantry",
	lancer: "Lancer",
	marksman: "Marksman",
};

const HERO_RARITY_LABELS: Record<string, string> = {
	rare: "Rare",
	epic: "Epic",
	legendary: "Legendary",
	mythic: "Mythic",
};

const HERO_RARITY_WEIGHTS: Record<string, number> = {
	rare: 1,
	epic: 2,
	legendary: 3,
	mythic: 4,
};

export function createHeroSlug(value: string): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function getHeroThumbnail(thumbnail: string): string {
	const value = String(thumbnail ?? "")
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

export function normalizeHero(hero: HeroListItem): NormalizedHero {
	return {
		id: createHeroSlug(hero.id || hero.name),
		name: String(hero.name ?? "").trim(),
		heroClass: hero.class,
		rarity: hero.rarity,
		generation: hero.generation,
		tier: hero.tier,
		thumbnail: getHeroThumbnail(hero.thumbnail),
	};
}

export function normalizeHeroes(heroes: HeroListItem[]): NormalizedHero[] {
	return heroes.map(normalizeHero);
}

export function getHeroById(
	heroes: NormalizedHero[],
	id: string,
): NormalizedHero | undefined {
	const normalizedId = createHeroSlug(id);

	return heroes.find((hero) => createHeroSlug(hero.id) === normalizedId);
}

export function getHeroGenerationOptions(
	heroes: NormalizedHero[],
): SelectOption[] {
	const generations = Array.from(
		new Set(
			heroes
				.map((hero) => String(hero.generation ?? "").trim())
				.filter(Boolean),
		),
	).sort((a, b) => compareGenerations(b, a));

	return [
		{
			value: "all",
			label: "All Generations",
		},
		...generations.map((generation) => ({
			value: generation,
			label: formatGeneration(generation),
		})),
	];
}

export function filterHeroes(
	heroes: NormalizedHero[],
	filters: HeroFiltersValue,
): NormalizedHero[] {
	const search = normalizeComparableValue(filters.search);

	return heroes.filter((hero) => {
		const matchesSearch =
			search === "" ||
			normalizeComparableValue(hero.name).includes(search) ||
			normalizeComparableValue(hero.id).includes(search);

		const matchesClass =
			filters.heroClass === "all" ||
			normalizeComparableValue(hero.heroClass) ===
				normalizeComparableValue(filters.heroClass);

		const matchesRarity =
			filters.rarity === "all" ||
			normalizeComparableValue(hero.rarity) ===
				normalizeComparableValue(filters.rarity);

		const matchesGeneration =
			filters.generation === "all" ||
			normalizeComparableValue(hero.generation) ===
				normalizeComparableValue(filters.generation);

		return matchesSearch && matchesClass && matchesRarity && matchesGeneration;
	});
}

export function sortHeroes(heroes: NormalizedHero[]): NormalizedHero[] {
	return [...heroes].sort((a, b) => {
		const generationComparison = compareGenerations(b.generation, a.generation);

		if (generationComparison !== 0) {
			return generationComparison;
		}

		const rarityComparison =
			getRarityWeight(b.rarity) - getRarityWeight(a.rarity);

		if (rarityComparison !== 0) {
			return rarityComparison;
		}

		return a.name.localeCompare(b.name);
	});
}

export function getFilteredHeroes(
	heroes: NormalizedHero[],
	filters: HeroFiltersValue,
): NormalizedHero[] {
	return sortHeroes(filterHeroes(heroes, filters));
}

export function getHeroClassLabel(heroClass: HeroClass): string {
	const normalized = normalizeComparableValue(heroClass);

	return HERO_CLASS_LABELS[normalized] ?? formatLabel(String(heroClass));
}

export function getHeroRarityLabel(rarity: HeroRarity): string {
	const normalized = normalizeComparableValue(rarity);

	return HERO_RARITY_LABELS[normalized] ?? formatLabel(String(rarity));
}

export function formatGeneration(generation: HeroGeneration): string {
	const value = String(generation ?? "").trim();

	if (!value) {
		return "Unknown";
	}

	if (/^\d+$/.test(value)) {
		return `S${value}`;
	}

	const seasonMatch = value.match(/^s\s*(\d+)$/i);

	if (seasonMatch) {
		return `S${seasonMatch[1]}`;
	}

	const generationMatch = value.match(/^gen(?:eration)?\s*(\d+)$/i);

	if (generationMatch) {
		return `S${generationMatch[1]}`;
	}

	return formatLabel(value);
}

export function getHeroSubtitle(hero: NormalizedHero): string {
	return `${formatGeneration(hero.generation)} · ${getHeroClassLabel(
		hero.heroClass,
	)}`;
}

function normalizeComparableValue(value: unknown): string {
	return String(value ?? "")
		.trim()
		.toLowerCase();
}

function formatLabel(value: string): string {
	return String(value ?? "")
		.trim()
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

function getGenerationNumber(generation: HeroGeneration): number | null {
	const value = String(generation ?? "").trim();
	const match = value.match(/\d+/);

	if (!match) {
		return null;
	}

	const number = Number(match[0]);

	return Number.isFinite(number) ? number : null;
}

function compareGenerations(a: HeroGeneration, b: HeroGeneration): number {
	const aNumber = getGenerationNumber(a);
	const bNumber = getGenerationNumber(b);

	if (aNumber !== null && bNumber !== null) {
		return aNumber - bNumber;
	}

	if (aNumber !== null) {
		return 1;
	}

	if (bNumber !== null) {
		return -1;
	}

	return String(a).localeCompare(String(b), undefined, {
		numeric: true,
		sensitivity: "base",
	});
}

function getRarityWeight(rarity: HeroRarity): number {
	return HERO_RARITY_WEIGHTS[normalizeComparableValue(rarity)] ?? 0;
}
