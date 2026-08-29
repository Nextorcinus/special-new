import expertsData from "./experts.json";
import giftsData from "./gifts.json";

import type { Expert } from "../types";

export const EXPERTS =
	expertsData as Expert[];

export const GIFTS = giftsData;

export const EXPERTS_BY_ID =
	Object.fromEntries(
		EXPERTS.map((expert) => [
			expert.id,
			expert,
		]),
	) as Record<string, Expert>;

export function getExpertById(
	id: string,
): Expert | undefined {
	return EXPERTS_BY_ID[id];
}

export function getExpertsByGeneration(
	generation: number,
): Expert[] {
	return EXPERTS.filter(
		(expert) =>
			expert.generation ===
			generation,
	);
}

export const EXPERT_GENERATIONS =
	Array.from(
		new Set(
			EXPERTS.map(
				(expert) =>
					expert.generation,
			),
		),
	).sort(
		(a, b) => a - b,
	);