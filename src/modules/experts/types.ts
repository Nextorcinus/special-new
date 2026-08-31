export interface ExpertSkill {
	id: string;
	name: string;
	nameKey?: string;
	maxLevel: number;
	bookCosts: number[];
	learningTimeMinutes: number[];
	isTalent: boolean;
	description?: string;
	relLevelCaps?: Record<number, number>;
}

export interface Expert {
	id: string;
	name: string;
	nameKey?: string;
	generation: number;
	focus: string;
	focusKey?: string;
	image?: string;
	affinityCosts: number[];
	sigilCosts: number[];
	totalSigils: number;
	skills: ExpertSkill[];
	estimated?: boolean;
}

/* =========================================================
 * RELATIONSHIP STATE
 * ========================================================= */

export interface ExpertRelationshipState {
	/**
	 * null = user has not selected a current level yet.
	 */
	currentLevel: number | null;

	/**
	 * null = user has not selected a target level yet.
	 */
	targetLevel: number | null;

	currentAffinity: number;
	currentSigils: number;
}

/* =========================================================
 * SKILL STATE
 * ========================================================= */

export interface ExpertSkillState {
	/**
	 * null = user has not selected a current skill level yet.
	 */
	currentLevel: number | null;

	/**
	 * null = user has not selected a target skill level yet.
	 */
	targetLevel: number | null;

	currentXp: number;
}

/* =========================================================
 * INVENTORY
 * ========================================================= */

export interface ExpertInventoryState {
	compassGifts: number;
	fieryHeartGifts: number;
	sailConquestGifts: number;
	generalSigils: number;
	booksOfKnowledge: number;
	learningSpeedupMinutes: number;
}

/* =========================================================
 * MAIN STATE
 * ========================================================= */

export interface ExpertsState {
	relationships: Record<string, ExpertRelationshipState>;

	skills: Record<string, Record<string, ExpertSkillState>>;

	inventory: ExpertInventoryState;

	valeriaLevel: number;
	baldurLevel: number;
}

/* =========================================================
 * CALCULATION RESULT
 * ========================================================= */

export interface ExpertSkillResult {
	skillId: string;
	skillName?: string;
	currentLevel: number;
	targetLevel: number;
	maxLevel: number;
	books: number;
	learningMinutes: number;
}

export interface ExpertResult {
	expertId: string;
	name: string;
	generation: number;
	focus: string;

	relationship: {
		currentLevel: number;
		targetLevel: number;
		affinity: number;
		sigils: number;
	};

	skills: ExpertSkillResult[];

	totalBooks: number;
	totalLearningMinutes: number;
}

export interface ExpertsResourceResult {
	need: number;
	have: number;
	short: number;
}

export interface ExpertsCalculationResult {
	affinity: ExpertsResourceResult;
	generalSigils: ExpertsResourceResult;
	booksOfKnowledge: ExpertsResourceResult;
	learningSpeedup: ExpertsResourceResult;

	totalAffinity: number;
	totalSigils: number;
	totalBooks: number;
	totalLearningMinutes: number;

	experts: ExpertResult[];

	valeriaLevel: number;
	baldurLevel: number;

	baseSvsPoints: number;
	svsPoints: number;

	baseShowdownPoints: number;
	showdownPoints: number;

	valeriaBonus: number;
	baldurBonus: number;
}
