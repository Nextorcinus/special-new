import type { WidgetDatabaseItem, WidgetHero, WidgetStatus } from "../type";

export type RawWidgetItem = {
	heroes: string;
	exploration: string;
	expedition: string;
	status?: string;
};

function createHeroId(name: string): string {
	return name
		.toLowerCase()
		.trim()
		.replace(/['’]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function normalizeHeroName(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.map((word) => {
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join(" ");
}

function normalizeStatus(status?: string): WidgetStatus | undefined {
	if (!status) {
		return undefined;
	}

	const normalized = status.toLowerCase().trim();

	if (normalized.includes("next update")) {
		return "next-update";
	}

	if (normalized.includes("new")) {
		return "new";
	}

	return undefined;
}

export function parseWidgetHeroLabel(value: string): {
	generation: number;
	name: string;
} {
	const match = value.trim().match(/^GEN\s+(\d+)\s+(.+)$/i);

	if (!match) {
		return {
			generation: 0,
			name: normalizeHeroName(value),
		};
	}

	return {
		generation: Number(match[1]),
		name: normalizeHeroName(match[2]),
	};
}

export function normalizeWidgetHero(raw: RawWidgetItem): WidgetHero {
	const parsed = parseWidgetHeroLabel(raw.heroes);

	const id = createHeroId(parsed.name);

	return {
		id,
		name: parsed.name,
		generation: parsed.generation,
		exploration: raw.exploration.trim(),
		expedition: raw.expedition.trim(),
		status: normalizeStatus(raw.status),
		thumbnail: `/heroes/${id}_thumb.png`,
	};
}

export function normalizeWidgetDatabase(
	data: RawWidgetItem[],
): WidgetDatabaseItem[] {
	return data.map((item) => normalizeWidgetHero(item));
}

export function getWidgetHeroById(
	data: WidgetDatabaseItem[],
	heroId: string,
): WidgetDatabaseItem | undefined {
	return data.find((item) => item.id === heroId);
}

export function isValidWidgetSelection(
	fromLevel: number,
	toLevel: number,
): boolean {
	return (
		Number.isFinite(fromLevel) &&
		Number.isFinite(toLevel) &&
		fromLevel >= 0 &&
		toLevel <= 10 &&
		toLevel > fromLevel
	);
}
