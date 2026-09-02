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

	const currentIndex = Math.max(0, current - 1);

	const targetIndex = Math.max(0, target - 1);

	const currentMinutes = Number(skill.learningTimeMinutes[currentIndex]) || 0;

	const targetMinutes = Number(skill.learningTimeMinutes[targetIndex]) || 0;

	const requiredMinutes = Math.max(0, targetMinutes - currentMinutes);

	const learnedMinutes = Math.max(0, Number(currentXp) || 0) / 60;

	return Math.max(0, Math.round(requiredMinutes - learnedMinutes));
}

export default calculateLearningTime;
