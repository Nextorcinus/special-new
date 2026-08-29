import type {
	Expert,
	ExpertSkill,
} from "../types";

function normalizeRelationshipLevel(
	level: number,
): number {
	if (
		!Number.isFinite(level) ||
		level < 0
	) {
		return 0;
	}

	return Math.min(
		100,
		Math.floor(level),
	);
}

function getRelationshipTier(
	level: number,
): number {
	return (
		10 *
		Math.floor(
			normalizeRelationshipLevel(
				level,
			) / 10,
		)
	);
}

export function getSkillRequirement(
	expert: Expert,
	skillId: string,
): number {
	const index = expert.skills
		.filter((skill) => !skill.isTalent)
		.findIndex(
			(skill) =>
				skill.id === skillId,
		);

	if (index < 0) {
		return 0;
	}

	return (index + 1) * 10;
}

export function calculateSkillCap(
	expert: Expert,
	skill: ExpertSkill,
	relationshipLevel: number,
): number {
	if (skill.isTalent) {
		return skill.maxLevel;
	}

	const relationshipTier =
		getRelationshipTier(
			relationshipLevel,
		);

	const requiredRelationship =
		getSkillRequirement(
			expert,
			skill.id,
		);

	if (
		relationshipTier <
		requiredRelationship
	) {
		return 0;
	}

	const caps = skill.relLevelCaps;

	if (!caps) {
		return skill.maxLevel;
	}

	const relationshipLevels =
		Object.keys(caps)
			.map(Number)
			.sort(
				(a, b) => a - b,
			);

	if (
		relationshipLevels.length ===
			0 ||
		relationshipTier <
			relationshipLevels[0] ||
		relationshipTier >
			relationshipLevels[
				relationshipLevels.length - 1
			]
	) {
		return skill.maxLevel;
	}

	let cap = 0;

	for (const level of relationshipLevels) {
		if (level <= relationshipTier) {
			cap = caps[level];
		} else {
			break;
		}
	}

	return cap;
}

export function getNextSkillCapUnlock(
	skill: ExpertSkill,
	relationshipLevel: number,
): number | null {
	if (
		skill.isTalent ||
		!skill.relLevelCaps
	) {
		return null;
	}

	const relationshipTier =
		getRelationshipTier(
			relationshipLevel,
		);

	const levels =
		Object.keys(
			skill.relLevelCaps,
		)
			.map(Number)
			.sort(
				(a, b) => a - b,
			);

	if (levels.length === 0) {
		return null;
	}

	let currentCap = 0;

	if (
		relationshipTier <
		levels[0]
	) {
		currentCap = 0;
	} else if (
		relationshipTier >
		levels[levels.length - 1]
	) {
		currentCap = skill.maxLevel;
	} else {
		for (const level of levels) {
			if (level <= relationshipTier) {
				currentCap =
					skill.relLevelCaps[
						level
					];
			} else {
				break;
			}
		}
	}

	if (
		currentCap >= skill.maxLevel
	) {
		return null;
	}

	for (const level of levels) {
		if (
			level > relationshipTier &&
			skill.relLevelCaps[level] >
				currentCap
		) {
			return level;
		}
	}

	return null;
}

export function getRelationshipRequiredForSkillLevel(
	skill: ExpertSkill,
	targetLevel: number,
): number | null {
	if (
		skill.isTalent ||
		targetLevel <= 0
	) {
		return null;
	}

	const requiredRelationship =
		getSkillRequirement(
			{
				skills: [skill],
			} as Expert,
			skill.id,
		);

	if (!skill.relLevelCaps) {
		return null;
	}

	const levels =
		Object.keys(
			skill.relLevelCaps,
		)
			.map(Number)
			.sort(
				(a, b) => a - b,
			);

	for (const level of levels) {
		if (
			skill.relLevelCaps[level] >=
			targetLevel
		) {
			return Math.max(
				level,
				requiredRelationship,
			);
		}
	}

	return null;
}