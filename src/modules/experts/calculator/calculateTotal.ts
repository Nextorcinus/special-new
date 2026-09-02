import type {
	Expert,
	ExpertInventoryState,
	ExpertRelationshipState,
	ExpertSkillState,
} from "../types";

import { calculateAffinity } from "./calculateAffinity";
import { calculateBooks } from "./calculateBooks";
import { calculateLearningTime } from "./calculateLearningTime";
import { calculateSigils } from "./calculateSigils";
import { calculateSkillCap } from "./calculateSkillCap";

export interface ExpertSkillResult {
	skillId: string;
	skillName: string;
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

	baseSvsPoints: number;
	valeriaLevel: number;
	valeriaBonus: number;
	valeriaBonusPoints: number;
	svsPoints: number;

	baseShowdownPoints: number;
	baldurLevel: number;
	baldurBonus: number;
	baldurBonusPoints: number;
	showdownPoints: number;
}

const EXPERT_SIGIL_SVS_POINTS = 6000;
const BOOK_SVS_POINTS = 60;
const LEARNING_MINUTE_SVS_POINTS = 30;

const VALERIA_BONUS_PER_LEVEL = 2;
const VALERIA_MAX_BONUS = 20;

const BALDUR_BONUS_PER_LEVEL = 5;
const BALDUR_MAX_BONUS = 50;

function toNumber(value: unknown, fallback = 0): number {
	const number = typeof value === "number" ? value : Number(value);

	return Number.isFinite(number) ? number : fallback;
}

function normalizeLevel(value: number | null, maxLevel: number): number | null {
	if (value === null) {
		return null;
	}

	const normalized = toNumber(value, NaN);

	if (!Number.isFinite(normalized)) {
		return null;
	}

	return Math.max(0, Math.min(maxLevel, Math.floor(normalized)));
}

function createResourceResult(
	need: number,
	have: number,
): ExpertsResourceResult {
	const normalizedNeed = Math.max(0, toNumber(need));

	const normalizedHave = Math.max(0, toNumber(have));

	return {
		need: normalizedNeed,
		have: normalizedHave,
		short: Math.max(0, normalizedNeed - normalizedHave),
	};
}

function calculateExpertRelationship(
	expert: Expert,
	relationship: ExpertRelationshipState,
): {
	currentLevel: number;
	targetLevel: number;
	affinity: number;
	sigils: number;
} {
	const currentLevel = normalizeLevel(relationship.currentLevel, 100);

	const targetLevel = normalizeLevel(relationship.targetLevel, 100);

	if (
		currentLevel === null ||
		targetLevel === null ||
		targetLevel <= currentLevel
	) {
		return {
			currentLevel: currentLevel ?? 0,
			targetLevel: targetLevel ?? 0,
			affinity: 0,
			sigils: 0,
		};
	}

	const requiredAffinity = toNumber(
		calculateAffinity(expert, currentLevel, targetLevel),
	);

	const requiredSigils = toNumber(
		calculateSigils(expert, currentLevel, targetLevel),
	);

	const currentAffinity = Math.max(0, toNumber(relationship.currentAffinity));

	const currentSigils = Math.max(0, toNumber(relationship.currentSigils));

	return {
		currentLevel,
		targetLevel,
		affinity: Math.max(0, requiredAffinity - currentAffinity),
		sigils: Math.max(0, requiredSigils - currentSigils),
	};
}

function calculateExpertSkills(
	expert: Expert,
	relationshipTargetLevel: number,
	skillStates: Record<string, ExpertSkillState>,
): {
	skills: ExpertSkillResult[];
	totalBooks: number;
	totalLearningMinutes: number;
} {
	const skills: ExpertSkillResult[] = [];

	let totalBooks = 0;
	let totalLearningMinutes = 0;

	for (const skill of expert.skills) {
		if (skill.isTalent) {
			continue;
		}

		const state = skillStates[skill.id];

		if (!state) {
			continue;
		}

		const calculatedSkillCap = toNumber(
			calculateSkillCap(expert, skill, relationshipTargetLevel),
		);

		const skillCap = Math.max(
			0,
			Math.min(skill.maxLevel, Math.floor(calculatedSkillCap)),
		);

		const currentLevel = normalizeLevel(state.currentLevel, skillCap);

		const targetLevel = normalizeLevel(state.targetLevel, skillCap);

		if (
			currentLevel === null ||
			targetLevel === null ||
			targetLevel <= currentLevel
		) {
			continue;
		}

		const books = Math.max(
			0,
			toNumber(calculateBooks(skill, currentLevel, targetLevel)),
		);

		const currentXp = Math.max(0, toNumber(state.currentXp));

		const learningMinutes = Math.max(
			0,
			toNumber(
				calculateLearningTime(skill, currentLevel, targetLevel, currentXp),
			),
		);

		if (books <= 0 && learningMinutes <= 0) {
			continue;
		}

		skills.push({
			skillId: skill.id,
			skillName: skill.name,
			currentLevel,
			targetLevel,
			maxLevel: skillCap,
			books,
			learningMinutes,
		});

		totalBooks += books;
		totalLearningMinutes += learningMinutes;
	}

	return {
		skills,
		totalBooks,
		totalLearningMinutes,
	};
}

export function calculateExpertTotal(
	expert: Expert,
	relationship: ExpertRelationshipState,
	skillStates: Record<string, ExpertSkillState>,
): ExpertResult {
	const relationshipResult = calculateExpertRelationship(expert, relationship);

	const skillResult = calculateExpertSkills(
		expert,
		relationshipResult.targetLevel,
		skillStates,
	);

	return {
		expertId: expert.id,
		name: expert.name,
		generation: expert.generation,
		focus: expert.focus,
		relationship: {
			currentLevel: relationshipResult.currentLevel,
			targetLevel: relationshipResult.targetLevel,
			affinity: relationshipResult.affinity,
			sigils: relationshipResult.sigils,
		},
		skills: skillResult.skills,
		totalBooks: skillResult.totalBooks,
		totalLearningMinutes: skillResult.totalLearningMinutes,
	};
}

export function calculateExpertsTotal(
	experts: Expert[],
	state: {
		relationships: Record<string, ExpertRelationshipState>;
		skills: Record<string, Record<string, ExpertSkillState>>;
		inventory: ExpertInventoryState;
		valeriaLevel: number;
		baldurLevel: number;
	},
): ExpertsCalculationResult {
	const expertResults: ExpertResult[] = [];

	for (const expert of experts) {
		const relationship = state.relationships[expert.id];

		if (!relationship) {
			continue;
		}

		const expertSkills = state.skills[expert.id] ?? {};

		const hasRelationshipSelection =
			relationship.currentLevel !== null &&
			relationship.targetLevel !== null &&
			toNumber(relationship.targetLevel) > toNumber(relationship.currentLevel);

		const hasSkillSelection = expert.skills.some((skill) => {
			if (skill.isTalent) {
				return false;
			}

			const skillState = expertSkills[skill.id];

			if (!skillState) {
				return false;
			}

			if (skillState.currentLevel === null || skillState.targetLevel === null) {
				return false;
			}

			return (
				toNumber(skillState.targetLevel) > toNumber(skillState.currentLevel)
			);
		});

		if (!hasRelationshipSelection && !hasSkillSelection) {
			continue;
		}

		expertResults.push(
			calculateExpertTotal(expert, relationship, expertSkills),
		);
	}

	const totalAffinity = expertResults.reduce(
		(total, expert) => total + expert.relationship.affinity,
		0,
	);

	const totalSigils = expertResults.reduce(
		(total, expert) => total + expert.relationship.sigils,
		0,
	);

	const totalBooks = expertResults.reduce(
		(total, expert) => total + expert.totalBooks,
		0,
	);

	const totalLearningMinutes = expertResults.reduce(
		(total, expert) => total + expert.totalLearningMinutes,
		0,
	);

	const inventory = state.inventory;

	const compassGifts = Math.max(0, toNumber(inventory.compassGifts));

	const fieryHeartGifts = Math.max(0, toNumber(inventory.fieryHeartGifts));

	const sailConquestGifts = Math.max(0, toNumber(inventory.sailConquestGifts));

	const affinityHave =
		compassGifts * 10 + fieryHeartGifts * 100 + sailConquestGifts * 1000;

	const generalSigilsHave = Math.max(0, toNumber(inventory.generalSigils));

	const booksHave = Math.max(0, toNumber(inventory.booksOfKnowledge));

	const learningSpeedupHave = Math.max(
		0,
		toNumber(inventory.learningSpeedupMinutes),
	);

	const baseSvsPoints =
		totalSigils * EXPERT_SIGIL_SVS_POINTS +
		totalBooks * BOOK_SVS_POINTS +
		totalLearningMinutes * LEARNING_MINUTE_SVS_POINTS;

	const valeriaLevel = Math.max(
		0,
		Math.min(10, Math.floor(toNumber(state.valeriaLevel))),
	);

	const valeriaBonus = Math.min(
		VALERIA_MAX_BONUS,
		valeriaLevel * VALERIA_BONUS_PER_LEVEL,
	);

	const valeriaBonusPoints = Math.floor(baseSvsPoints * (valeriaBonus / 100));

	const svsPoints = baseSvsPoints + valeriaBonusPoints;

	const baldurLevel = Math.max(
		0,
		Math.min(10, Math.floor(toNumber(state.baldurLevel))),
	);

	const baldurBonus = Math.min(
		BALDUR_MAX_BONUS,
		baldurLevel * BALDUR_BONUS_PER_LEVEL,
	);

	const baldurBonusPoints = Math.floor(baseSvsPoints * (baldurBonus / 100));

	const showdownPoints = baseSvsPoints + baldurBonusPoints;

	return {
		affinity: createResourceResult(totalAffinity, affinityHave),

		generalSigils: createResourceResult(totalSigils, generalSigilsHave),

		booksOfKnowledge: createResourceResult(totalBooks, booksHave),

		learningSpeedup: createResourceResult(
			totalLearningMinutes,
			learningSpeedupHave,
		),

		totalAffinity,
		totalSigils,
		totalBooks,
		totalLearningMinutes,

		experts: expertResults,

		baseSvsPoints,
		valeriaLevel,
		valeriaBonus,
		valeriaBonusPoints,
		svsPoints,

		baseShowdownPoints: baseSvsPoints,
		baldurLevel,
		baldurBonus,
		baldurBonusPoints,
		showdownPoints,
	};
}
