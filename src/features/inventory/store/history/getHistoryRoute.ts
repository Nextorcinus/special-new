import type { CalculationHistoryItem, CalculationModule } from "./types";

function normalizeCategory(value?: string): string {
	return String(value ?? "")
		.trim()
		.toLowerCase();
}

function normalizeCategoryPath(
	module: CalculationModule,
	category?: string,
): string {
	const normalizedCategory = normalizeCategory(category);

	if (!normalizedCategory) {
		return "";
	}

	switch (module) {
		case "research": {
			const routes: Record<string, string> = {
				growth: "growth",
				economy: "economy",
				battle: "battle",
			};

			const route = routes[normalizedCategory];

			return route ? `/${route}` : "/categories";
		}

		case "buildings": {
			const routes: Record<string, string> = {
				regular: "regular",
				fc: "fc",
			};

			const route = routes[normalizedCategory];

			return route ? `/${route}` : "";
		}

		case "war-academy": {
			const routes: Record<string, string> = {
				infantry: "infantry",
				lancer: "lancer",
				marksman: "marksman",
				cavalry: "cavalry",
				support: "support",
			};

			const route = routes[normalizedCategory];

			return route ? `/${route}` : "";
		}

		case "unlock-t12": {
			const routes: Record<string, string> = {
				"exalted infantry": "infantry",
				"exalted lancer": "lancer",
				"exalted marksman": "marksman",

				infantry: "infantry",
				lancer: "lancer",
				marksman: "marksman",
			};

			const route = routes[normalizedCategory];

			return route ? `/${route}` : "";
		}

		case "skill-t12": {
			const routes: Record<string, string> = {
				infantry: "infantry",
				lancer: "lancer",
				marksman: "marksman",

				"exalted infantry": "infantry",
				"exalted lancer": "lancer",
				"exalted marksman": "marksman",
			};

			const route = routes[normalizedCategory];

			return route ? `/${route}` : "";
		}

		case "gear":
		case "charm":
		case "widget":
		case "troops":
			return `/${normalizedCategory.replace(/\s+/g, "-")}`;

		case "pet":
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

	const petId = result?.petId ?? form?.petId;

	if (typeof petId !== "string") {
		return null;
	}

	const normalizedPetId = petId.trim();

	return normalizedPetId || null;
}

function getBaseRoute(module: CalculationModule, categoryPath: string): string {
	const routes: Record<CalculationModule, string> = {
		buildings: `/buildings${categoryPath}`,
		gear: `/gear${categoryPath}`,
		charm: `/charm${categoryPath}`,
		research: `/research${categoryPath}`,
		"war-academy": `/war-academy${categoryPath}`,
		"unlock-t12": `/war-academy/flame-tech/unlock-t12${categoryPath}`,
		"skill-t12": `/war-academy/flame-tech/skill-t12${categoryPath}`,
		widget: `/widget${categoryPath}`,
		pet: "/pets",
		troops: `/troops${categoryPath}`,
	};

	return routes[module];
}

export function getHistoryRoute(item: CalculationHistoryItem): string {
	const historyId = encodeURIComponent(String(item.id));

	if (item.module === "pet") {
		const petId = getPetId(item);

		if (!petId) {
			return "/pets";
		}

		return `/pets/${encodeURIComponent(petId)}?historyId=${historyId}`;
	}

	const categoryPath = normalizeCategoryPath(item.module, item.category);

	const baseRoute = getBaseRoute(item.module, categoryPath);

	return `${baseRoute}?historyId=${historyId}`;
}
