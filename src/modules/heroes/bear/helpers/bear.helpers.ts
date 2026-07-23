import type { NormalizedHero } from "../../type";
import type {
	BearGenerationGuideItem,
	BearHeroPickerOption,
	BearJoiningPriorityItem,
	BearJoiningRecommendation,
	BearOpeningGroup,
	BearOpeningRecommendation,
	BearRecommendationData,
	BearRecommendationHero,
	BearRecommendationViewData,
} from "../type";

export function createBearRecommendationViewData(
	data: BearRecommendationData,
	heroes: NormalizedHero[],
): BearRecommendationViewData {
	const heroMap = createHeroMap(heroes);

	return {
		openingRallies: {
			p2w: createOpeningRecommendation("p2w", data.openingRallies.p2w, heroMap),
			f2p: createOpeningRecommendation("f2p", data.openingRallies.f2p, heroMap),
		},
		joiningPriority: createJoiningRecommendations(
			data.joiningPriority,
			heroMap,
		),
		warning: data.warning,
	};
}

export function createBearHeroPickerOptions(
	heroes: NormalizedHero[],
): BearHeroPickerOption[] {
	return [...heroes]
		.sort((a, b) => {
			const generationComparison =
				getGenerationWeight(b.generation) - getGenerationWeight(a.generation);

			if (generationComparison !== 0) {
				return generationComparison;
			}

			return a.name.localeCompare(b.name);
		})
		.map((hero) => ({
			value: hero.id,
			label: `${hero.name} · ${formatGeneration(hero.generation)}`,
			thumbnail: hero.thumbnail,
			heroClass: hero.heroClass,
			rarity: hero.rarity,
			generation: hero.generation,
			tier: hero.tier,
		}));
}

export function normalizeBearRecommendationData(
	data: BearRecommendationData,
): BearRecommendationData {
	return {
		openingRallies: {
			p2w: normalizeHeroIds(data.openingRallies?.p2w),
			f2p: normalizeHeroIds(data.openingRallies?.f2p),
		},
		joiningPriority: normalizeJoiningPriority(data.joiningPriority),
		warning: String(data.warning ?? "").trim(),
	};
}

export function cloneBearRecommendationData(
	data: BearRecommendationData,
): BearRecommendationData {
	return {
		openingRallies: {
			p2w: [...data.openingRallies.p2w],
			f2p: [...data.openingRallies.f2p],
		},
		joiningPriority: data.joiningPriority.map((item) => ({
			...item,
		})),
		warning: data.warning,
	};
}

export function addOpeningHeroId(heroIds: string[], heroId: string): string[] {
	const normalizedHeroId = normalizeHeroId(heroId);

	if (!normalizedHeroId) {
		return heroIds;
	}

	if (heroIds.some((id) => normalizeHeroId(id) === normalizedHeroId)) {
		return heroIds;
	}

	return [...heroIds, normalizedHeroId];
}

export function removeOpeningHeroId(
	heroIds: string[],
	heroId: string,
): string[] {
	const normalizedHeroId = normalizeHeroId(heroId);

	return heroIds.filter((id) => normalizeHeroId(id) !== normalizedHeroId);
}

export function reorderJoiningPriority(
	items: BearJoiningPriorityItem[],
	itemId: string,
	direction: "up" | "down",
): BearJoiningPriorityItem[] {
	const sortedItems = normalizeJoiningPriority(items);

	const currentIndex = sortedItems.findIndex((item) => item.id === itemId);

	if (currentIndex === -1) {
		return sortedItems;
	}

	const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

	if (targetIndex < 0 || targetIndex >= sortedItems.length) {
		return sortedItems;
	}

	const nextItems = [...sortedItems];

	const currentItem = nextItems[currentIndex];

	const targetItem = nextItems[targetIndex];

	nextItems[currentIndex] = targetItem;

	nextItems[targetIndex] = currentItem;

	return reindexJoiningPriority(nextItems);
}

export function reindexJoiningPriority(
	items: BearJoiningPriorityItem[],
): BearJoiningPriorityItem[] {
	return items.map((item, index) => ({
		...item,
		priority: index + 1,
	}));
}

export function createJoiningPriorityItem(
	heroId: string | null = null,
): BearJoiningPriorityItem {
	const id = createBearItemId();

	return {
		id,
		priority: 1,
		heroId: heroId === null ? null : normalizeHeroId(heroId),
		label: heroId === null ? "No Heroes" : undefined,
	};
}

export function updateJoiningHero(
	items: BearJoiningPriorityItem[],
	itemId: string,
	heroId: string | null,
): BearJoiningPriorityItem[] {
	return items.map((item) => {
		if (item.id !== itemId) {
			return item;
		}

		if (heroId === null) {
			return {
				...item,
				heroId: null,
				label: "No Heroes",
			};
		}

		return {
			...item,
			heroId: normalizeHeroId(heroId),
			label: undefined,
		};
	});
}

export function removeJoiningPriorityItem(
	items: BearJoiningPriorityItem[],
	itemId: string,
): BearJoiningPriorityItem[] {
	return reindexJoiningPriority(items.filter((item) => item.id !== itemId));
}

export function addJoiningPriorityItem(
	items: BearJoiningPriorityItem[],
	heroId: string | null = null,
): BearJoiningPriorityItem[] {
	return reindexJoiningPriority([...items, createJoiningPriorityItem(heroId)]);
}

export function getBearGenerationGuideItem(
	items: BearGenerationGuideItem[],
	generation: string | number,
): BearGenerationGuideItem | undefined {
	const normalizedGeneration = normalizeGeneration(generation);

	return items.find(
		(item) => normalizeGeneration(item.generation) === normalizedGeneration,
	);
}

export function getOpeningGroupLabel(group: BearOpeningGroup): string {
	switch (group) {
		case "p2w":
			return "P2W";

		case "f2p":
			return "F2P";
	}
}

function createHeroMap(
	heroes: NormalizedHero[],
): Map<string, BearRecommendationHero> {
	return new Map(
		heroes.map((hero) => [
			normalizeHeroId(hero.id),
			{
				id: hero.id,
				name: hero.name,
				thumbnail: hero.thumbnail,
				heroClass: hero.heroClass,
				rarity: hero.rarity,
				generation: hero.generation,
				tier: hero.tier,
			},
		]),
	);
}

function createOpeningRecommendation(
	group: BearOpeningGroup,
	heroIds: string[],
	heroMap: Map<string, BearRecommendationHero>,
): BearOpeningRecommendation {
	const normalizedIds = normalizeHeroIds(heroIds);

	const heroes = normalizedIds
		.map((heroId) => heroMap.get(heroId))
		.filter((hero): hero is BearRecommendationHero => Boolean(hero));

	return {
		group,
		label: getOpeningGroupLabel(group),
		heroIds: normalizedIds,
		heroes,
	};
}

function createJoiningRecommendations(
	items: BearJoiningPriorityItem[],
	heroMap: Map<string, BearRecommendationHero>,
): BearJoiningRecommendation[] {
	return normalizeJoiningPriority(items).map((item) => {
		const hero =
			item.heroId === null
				? undefined
				: heroMap.get(normalizeHeroId(item.heroId));

		return {
			id: item.id,
			priority: item.priority,
			heroId: item.heroId,
			label: item.label ?? hero?.name ?? "No Heroes",
			hero,
		};
	});
}

function normalizeJoiningPriority(
	items: BearJoiningPriorityItem[] | undefined,
): BearJoiningPriorityItem[] {
	if (!Array.isArray(items)) {
		return [];
	}

	const normalized = items
		.filter((item) => typeof item === "object" && item !== null)
		.map((item, index) => ({
			id: String(item.id ?? "").trim() || `priority-${index + 1}`,
			priority: Number.isFinite(Number(item.priority))
				? Number(item.priority)
				: index + 1,
			heroId: item.heroId === null ? null : normalizeHeroId(item.heroId),
			label:
				item.heroId === null
					? String(item.label ?? "No Heroes").trim()
					: item.label
						? String(item.label).trim()
						: undefined,
		}))
		.sort((a, b) => a.priority - b.priority);

	return reindexJoiningPriority(normalized);
}

function normalizeHeroIds(values: unknown): string[] {
	if (!Array.isArray(values)) {
		return [];
	}

	return Array.from(
		new Set(
			values
				.map((value) => normalizeHeroId(String(value ?? "")))
				.filter(Boolean),
		),
	);
}

function normalizeHeroId(value: string): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[_\s]+/g, "-")
		.replace(/[^a-z0-9-]+/g, "")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function normalizeGeneration(value: string | number): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "");
}

function getGenerationWeight(generation: string | number): number {
	const match = String(generation ?? "").match(/\d+/);

	if (!match) {
		return 0;
	}

	const number = Number(match[0]);

	return Number.isFinite(number) ? number : 0;
}

function formatGeneration(generation: string | number): string {
	const value = String(generation ?? "").trim();

	if (!value) {
		return "Unknown";
	}

	if (/^\d+$/.test(value)) {
		return `S${value}`;
	}

	if (/^s\d+$/i.test(value)) {
		return value.toUpperCase();
	}

	return value;
}

function createBearItemId(): string {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}

	return `bear-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
