import type { ExpertSkill } from "../types";

const XP_PER_MINUTE = 60;

export function calculateLearningTime(
	skill: ExpertSkill,
	fromLevel: number,
	toLevel: number,
	currentXp = 0,
): number {
	if (skill.isTalent || toLevel <= fromLevel) {
		return 0;
	}

	const startLevel = Math.max(0, Math.floor(fromLevel));
	const targetLevel = Math.min(
		skill.maxLevel,
		Math.ceil(toLevel),
	);

	if (targetLevel <= startLevel) {
		return 0;
	}

	const totalMinutes = skill.learningTimeMinutes
		.slice(startLevel, targetLevel)
		.reduce(
			(total, minutes) => total + minutes,
			0,
		);

	const xpCredit =
		currentXp > 0
			? currentXp / XP_PER_MINUTE
			: 0;

	return Math.max(
		0,
		totalMinutes - xpCredit,
	);
}