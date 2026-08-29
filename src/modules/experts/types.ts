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

export interface ExpertRelationshipState {
	currentLevel: number;
	targetLevel: number;
	currentAffinity: number;
	currentSigils: number;
}

export interface ExpertSkillState {
	currentLevel: number;
	targetLevel: number;
	currentXp: number;
}

export interface ExpertInventoryState {
	compassGifts: number;
	fieryHeartGifts: number;
	sailConquestGifts: number;
	generalSigils: number;
	booksOfKnowledge: number;
	learningSpeedupMinutes: number;
}

export interface ExpertsState {
	relationships: Record<
		string,
		ExpertRelationshipState
	>;
	skills: Record<
		string,
		Record<string, ExpertSkillState>
	>;
	inventory: ExpertInventoryState;
}

export interface ExpertSkillResult {
	skillId: string;
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
}