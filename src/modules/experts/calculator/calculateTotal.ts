import {
	calculateBooks,
} from "./calculateBooks";
import {
	calculateLearningTime,
} from "./calculateLearningTime";
import {
	calculateSigils,
} from "./calculateSigils";
import {
	calculateSkillCap,
} from "./calculateSkillCap";

import type {
	Expert,
	ExpertInventoryState,
	ExpertRelationshipState,
	ExpertSkillState,
	ExpertsState,
} from "../types";

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
}

export function calculateExpertTotal(
	expert: Expert,
	relationship: ExpertRelationshipState,
	skillStates: Record<string, ExpertSkillState>,
): ExpertResult {
	const currentRelationship = Math.max(
		0,
		relationship.currentLevel,
	);

	const targetRelationship = Math.max(
		currentRelationship,
		relationship.targetLevel,
	);

	const affinity = calculateAffinityCost(
		expert,
		currentRelationship,
		targetRelationship,
	);

	const sigils = calculateSigils(
		expert,
		currentRelationship,
		targetRelationship,
		relationship.currentSigils,
		0,
	);

	const skills: ExpertSkillResult[] = [];

	let totalBooks = 0;
	let totalLearningMinutes = 0;

	for (const skill of expert.skills) {
		if (skill.isTalent) {
			continue;
		}

		const skillState =
			skillStates[skill.id] ?? {
				currentLevel: 0,
				targetLevel: 0,
				currentXp: 0,
			};

		const currentLevel = Math.max(
			0,
			Math.min(
				skill.maxLevel,
				skillState.currentLevel,
			),
		);

		const targetLevel = Math.max(
			currentLevel,
			Math.min(
				skill.maxLevel,
				skillState.targetLevel,
			),
		);

		const maxLevel = calculateSkillCap(
			expert,
			skill,
			targetRelationship,
		);

		const validTargetLevel = Math.min(
			targetLevel,
			maxLevel,
		);

		const books = calculateBooks(
			skill,
			currentLevel,
			validTargetLevel,
		);

		const learningMinutes =
			calculateLearningTime(
				skill,
				currentLevel,
				validTargetLevel,
				skillState.currentXp,
			);

		if (
			books > 0 ||
			learningMinutes > 0
		) {
			skills.push({
				skillId: skill.id,
				skillName: skill.name,
				currentLevel,
				targetLevel: validTargetLevel,
				maxLevel,
				books,
				learningMinutes,
			});
		}

		totalBooks += books;
		totalLearningMinutes +=
			learningMinutes;
	}

	return {
		expertId: expert.id,
		name: expert.name,
		generation: expert.generation,
		focus: expert.focus,
		relationship: {
			currentLevel: currentRelationship,
			targetLevel: targetRelationship,
			affinity,
			sigils: sigils.required,
		},
		skills,
		totalBooks,
		totalLearningMinutes,
	};
}

export function calculateExpertsTotal(
	experts: Expert[],
	state: ExpertsState,
): ExpertsCalculationResult {
	let totalAffinity = 0;
	let totalSigils = 0;
	let totalBooks = 0;
	let totalLearningMinutes = 0;

	const expertResults: ExpertResult[] = [];

	for (const expert of experts) {
		const relationship =
			state.relationships[expert.id] ?? {
				currentLevel: 0,
				targetLevel: 0,
				currentAffinity: 0,
				currentSigils: 0,
			};

		const skillStates =
			state.skills[expert.id] ?? {};

		const result = calculateExpertTotal(
			expert,
			relationship,
			skillStates,
		);

		totalAffinity +=
			result.relationship.affinity;

		totalSigils +=
			result.relationship.sigils;

		totalBooks +=
			result.totalBooks;

		totalLearningMinutes +=
			result.totalLearningMinutes;

		if (
			result.relationship.affinity > 0 ||
			result.relationship.sigils > 0 ||
			result.totalBooks > 0 ||
			result.totalLearningMinutes > 0
		) {
			expertResults.push(result);
		}
	}

	return {
		affinity: createResourceResult(
			totalAffinity,
			state.inventory,
			"affinity",
		),
		generalSigils: createResourceResult(
			totalSigils,
			state.inventory,
			"generalSigils",
		),
		booksOfKnowledge: createResourceResult(
			totalBooks,
			state.inventory,
			"booksOfKnowledge",
		),
		learningSpeedup: createResourceResult(
			totalLearningMinutes,
			state.inventory,
			"learningSpeedupMinutes",
		),
		totalAffinity,
		totalSigils,
		totalBooks,
		totalLearningMinutes,
		experts: expertResults,
	};
}

function createResourceResult(
	need: number,
	inventory: ExpertInventoryState,
	resource:
		| "affinity"
		| "generalSigils"
		| "booksOfKnowledge"
		| "learningSpeedupMinutes",
): ExpertsResourceResult {
	const have = getInventoryValue(
		inventory,
		resource,
	);

	return {
		need,
		have,
		short: Math.max(
			0,
			need - have,
		),
	};
}

function getInventoryValue(
	inventory: ExpertInventoryState,
	resource:
		| "affinity"
		| "generalSigils"
		| "booksOfKnowledge"
		| "learningSpeedupMinutes",
): number {
	switch (resource) {
		case "affinity":
			return (
				inventory.compassGifts * 10 +
				inventory.fieryHeartGifts * 100 +
				inventory.sailConquestGifts *
					1000
			);

		case "generalSigils":
			return inventory.generalSigils;

		case "booksOfKnowledge":
			return inventory.booksOfKnowledge;

		case "learningSpeedupMinutes":
			return inventory.learningSpeedupMinutes;
	}
}

function calculateAffinityCost(
	expert: Expert,
	fromLevel: number,
	toLevel: number,
): number {
	if (toLevel <= fromLevel) {
		return 0;
	}

	return expert.affinityCosts
		.slice(
			Math.max(0, fromLevel),
			Math.min(
				expert.affinityCosts.length,
				toLevel,
			),
		)
		.reduce(
			(total, cost) =>
				total + cost,
			0,
		);
}