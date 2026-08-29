import type { Expert } from "../types";

export function calculateAffinity(
	expert: Expert,
	fromLevel: number,
	toLevel: number,
): number {
	if (toLevel <= fromLevel) {
		return 0;
	}

	const startLevel = Math.ceil(fromLevel);
	const targetLevel = Math.ceil(toLevel);

	return expert.affinityCosts
		.slice(
			Math.max(0, startLevel),
			Math.min(100, targetLevel),
		)
		.reduce(
			(total, cost) => total + cost,
			0,
		);
}