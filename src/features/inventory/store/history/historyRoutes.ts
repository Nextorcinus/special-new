import type { CalculationHistoryItem, CalculationModule } from "./types";

type HistoryCategorySource = {
	category?: unknown;
};

function normalizeCategory(value: unknown): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ");
}

function toRouteSegment(value: string): string {
	return value.replace(/\s+/g, "-");
}

function getHistoryCategory(item: CalculationHistoryItem): string {
	const form = item.form as HistoryCategorySource | undefined;

	const result = item.result as HistoryCategorySource | undefined;

	const candidates = [item.category, form?.category, result?.category];

	for (const candidate of candidates) {
		const normalized = normalizeCategory(candidate);

		if (normalized) {
			return normalized;
		}
	}

	return "";
}

function isUnlockT12Category(category: string): boolean {
	return ["exalted infantry", "exalted lancer", "exalted marksman"].includes(
		category,
	);
}

function isSkillT12Category(category: string): boolean {
	return [
		"infantry skill",
		"lancer skill",
		"marksman skill",
		"exalted infantry skill",
		"exalted lancer skill",
		"exalted marksman skill",
	].includes(category);
}

function resolveHistoryModule(
	item: CalculationHistoryItem,
	category: string,
): CalculationModule {
	if (item.module === "experts") {
		return "experts";
	}

	if (item.module !== "war-academy") {
		return item.module;
	}

	if (isUnlockT12Category(category)) {
		return "unlock-t12";
	}

	if (isSkillT12Category(category)) {
		return "skill-t12";
	}

	return "war-academy";
}

function getResearchCategoryPath(category: string): string {
	const routes: Record<string, string> = {
		growth: "growth",
		economy: "economy",
		battle: "battle",
	};

	const route = routes[category];

	return route ? `/${route}` : "/categories";
}

function getBuildingCategoryPath(category: string): string {
	const routes: Record<string, string> = {
		regular: "regular",
		fc: "fc",
	};

	const route = routes[category];

	return route ? `/${route}` : "";
}

function getWarAcademyCategoryPath(category: string): string {
	const routes: Record<string, string> = {
		infantry: "infantry",
		lancer: "lancer",
		marksman: "marksman",
		cavalry: "cavalry",
		support: "support",
	};

	const route = routes[category];

	return route ? `/${route}` : "";
}

function getUnlockT12CategoryPath(category: string): string {
	const routes: Record<string, string> = {
		"exalted infantry": "exalted-infantry",
		"exalted lancer": "exalted-lancer",
		"exalted marksman": "exalted-marksman",
		infantry: "exalted-infantry",
		lancer: "exalted-lancer",
		marksman: "exalted-marksman",
	};

	const route = routes[category];

	return route ? `/${route}` : "";
}

function getSkillT12CategoryPath(category: string): string {
	const routes: Record<string, string> = {
		"exalted infantry": "exalted-infantry",
		"exalted lancer": "exalted-lancer",
		"exalted marksman": "exalted-marksman",
		"exalted infantry skill": "exalted-infantry",
		"exalted lancer skill": "exalted-lancer",
		"exalted marksman skill": "exalted-marksman",
		"infantry skill": "exalted-infantry",
		"lancer skill": "exalted-lancer",
		"marksman skill": "exalted-marksman",
		infantry: "exalted-infantry",
		lancer: "exalted-lancer",
		marksman: "exalted-marksman",
	};

	const route = routes[category];

	return route ? `/${route}` : "";
}

function getCategoryPath(module: CalculationModule, category: string): string {
	if (!category) {
		return "";
	}

	switch (module) {
		case "research":
			return getResearchCategoryPath(category);

		case "buildings":
			return getBuildingCategoryPath(category);

		case "war-academy":
			return getWarAcademyCategoryPath(category);

		case "unlock-t12":
			return getUnlockT12CategoryPath(category);

		case "skill-t12":
			return getSkillT12CategoryPath(category);

		case "gear":
		case "charm":
		case "widget":
		case "troops":
			return `/${toRouteSegment(category)}`;

		case "pet":
		case "experts":
			return "";

		default:
			return "";
	}
}

function getPetId(item: CalculationHistoryItem): string | null {
	const form = item.form as
		| {
				petId?: unknown;
		  }
		| undefined;

	const result = item.result as
		| {
				petId?: unknown;
		  }
		| undefined;

	const petId = result?.petId ?? form?.petId ?? item.category;

	if (typeof petId !== "string") {
		return null;
	}

	const normalizedPetId = normalizeCategory(petId);

	return normalizedPetId ? toRouteSegment(normalizedPetId) : null;
}

function getBaseRoute(module: CalculationModule, categoryPath: string): string {
	switch (module) {
		case "buildings":
			return `/buildings${categoryPath}`;

		case "gear":
			return `/gear${categoryPath}`;

		case "charm":
			return `/charm${categoryPath}`;

		case "research":
			return `/research${categoryPath}`;

		case "war-academy":
			return `/war-academy${categoryPath}`;

		case "unlock-t12":
			return `/war-academy/flame-tech/unlock-t12${categoryPath}`;

		case "skill-t12":
			return `/war-academy/flame-tech/skill-t12${categoryPath}`;

		case "widget":
			return `/widget${categoryPath}`;

		case "pet":
			return "/pets";

		case "troops":
			return `/troops${categoryPath}`;

		case "experts":
			return "/experts";

		default:
			return "";
	}
}

function appendHistoryId(route: string, historyId: string): string {
	if (!route) {
		return "/";
	}

	const separator = route.includes("?") ? "&" : "?";

	return `${route}${separator}historyId=${historyId}`;
}

export function getHistoryRoute(item: CalculationHistoryItem): string {
	const historyId = encodeURIComponent(String(item.id));

	if (item.module === "experts") {
		return appendHistoryId("/experts", historyId);
	}

	if (item.module === "pet") {
		const petId = getPetId(item);

		if (!petId) {
			return "/pets";
		}

		return appendHistoryId(`/pets/${encodeURIComponent(petId)}`, historyId);
	}

	const category = getHistoryCategory(item);

	const resolvedModule = resolveHistoryModule(item, category);

	const categoryPath = getCategoryPath(resolvedModule, category);

	const baseRoute = getBaseRoute(resolvedModule, categoryPath);

	return appendHistoryId(baseRoute, historyId);
}
