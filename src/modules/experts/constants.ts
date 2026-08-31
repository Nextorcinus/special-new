export const EXPERT_RELATIONSHIP_MIN_LEVEL = 0;

export const EXPERT_RELATIONSHIP_MAX_LEVEL = 100;

export const EXPERT_RELATIONSHIP_STEP = 10;

export const EXPERT_SKILL_MIN_LEVEL = 0;

export const EXPERT_DEFAULT_CURRENT_LEVEL = 0;

export const EXPERT_DEFAULT_TARGET_LEVEL = 0;

export const EXPERT_DEFAULT_CURRENT_XP = 0;

export const EXPERT_DEFAULT_CURRENT_AFFINITY = 0;

export const EXPERT_DEFAULT_CURRENT_SIGILS = 0;

export const EXPERT_GENERATION_MIN = 1;

/* =========================================================
 * RELATIONSHIP LEVELS
 * ========================================================= */

export const EXPERT_RELATIONSHIP_LEVELS = Array.from(
	{
		length: EXPERT_RELATIONSHIP_MAX_LEVEL - EXPERT_RELATIONSHIP_MIN_LEVEL + 1,
	},
	(_, index) => EXPERT_RELATIONSHIP_MIN_LEVEL + index,
);

/* =========================================================
 * RELATIONSHIP MILESTONES
 * ========================================================= */

export const EXPERT_RELATIONSHIP_MILESTONES = Array.from(
	{
		length: EXPERT_RELATIONSHIP_MAX_LEVEL / EXPERT_RELATIONSHIP_STEP,
	},
	(_, index) => (index + 1) * EXPERT_RELATIONSHIP_STEP,
);

/* =========================================================
 * DEFAULT RELATIONSHIP
 *
 * null means the user has not selected the field yet.
 * ========================================================= */

export const DEFAULT_EXPERT_RELATIONSHIP = {
	currentLevel: null,
	targetLevel: null,
	currentAffinity: EXPERT_DEFAULT_CURRENT_AFFINITY,
	currentSigils: EXPERT_DEFAULT_CURRENT_SIGILS,
};

/* =========================================================
 * DEFAULT SKILL
 *
 * null means the user has not selected the level.
 * ========================================================= */

export const DEFAULT_EXPERT_SKILL = {
	currentLevel: null,
	targetLevel: null,
	currentXp: EXPERT_DEFAULT_CURRENT_XP,
};
