import type { ExpertSkill } from "../types";

export function calculateBooks(
	skill: ExpertSkill,
	fromLevel: number,
	toLevel: number,
): number {
	if (
		skill.isTalent ||
		toLevel <= fromLevel
	) {
		return 0;
	}

	const from = Math.max(
		0,
		Math.floor(fromLevel),
	);

	const to = Math.min(
		skill.maxLevel,
		Math.ceil(toLevel),
	);

	if (to <= from) {
		return 0;
	}

	return skill.bookCosts
		.slice(from, to)
		.reduce(
			(total, cost) =>
				total + cost,
			0,
		);
}