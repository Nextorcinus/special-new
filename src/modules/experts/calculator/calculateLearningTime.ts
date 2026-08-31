import type { ExpertSkill } from "../types";

export function calculateLearningTime(
	skill: ExpertSkill,
	currentLevel: number,
	targetLevel: number,
	currentXp = 0,
): number {
	const current = Math.max(
		0,
		Math.min(skill.maxLevel, Math.floor(currentLevel)),
	);

	const target = Math.max(
		current,
		Math.min(skill.maxLevel, Math.floor(targetLevel)),
	);

	if (target <= current) {
		return 0;
	}

	let totalMinutes = 0;

	/**
	 * learningTimeMinutes uses the same
	 * level indexing as bookCosts.
	 *
	 * Example:
	 *
	 * current = 2
	 * target = 3
	 *
	 * use index 2
	 */
	for (let level = current; level < target; level++) {
		totalMinutes += Number(skill.learningTimeMinutes[level]) || 0;
	}

	/**
	 * currentXp is stored as XP.
	 *
	 * 60 XP = 1 learning minute.
	 */
	const learnedMinutes = Math.max(0, Number(currentXp) || 0) / 60;

	return Math.max(0, Math.round(totalMinutes - learnedMinutes));
}

export default calculateLearningTime;
