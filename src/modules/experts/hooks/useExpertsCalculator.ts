"use client";

import { useCallback, useMemo, useState } from "react";
import { calculateExpertsTotal } from "../calculator";
import {
	DEFAULT_EXPERT_RELATIONSHIP,
	DEFAULT_EXPERT_SKILL,
} from "../constants";
import { EXPERTS } from "../data";

import type {
	ExpertInventoryState,
	ExpertRelationshipState,
	ExpertSkillState,
	ExpertsState,
} from "../types";

/* =========================================================
 * STATE FACTORIES
 * ========================================================= */

function createRelationshipState(): ExpertRelationshipState {
	return {
		...DEFAULT_EXPERT_RELATIONSHIP,
	};
}

function createSkillState(): ExpertSkillState {
	return {
		...DEFAULT_EXPERT_SKILL,
	};
}

function createInventoryState(): ExpertInventoryState {
	return {
		compassGifts: 0,
		fieryHeartGifts: 0,
		sailConquestGifts: 0,
		generalSigils: 0,
		booksOfKnowledge: 0,
		learningSpeedupMinutes: 0,
	};
}

/* =========================================================
 * INITIAL STATE
 * ========================================================= */

function createInitialState(): ExpertsState {
	const relationships: ExpertsState["relationships"] = {};

	const skills: ExpertsState["skills"] = {};

	for (const expert of EXPERTS) {
		relationships[expert.id] = createRelationshipState();

		skills[expert.id] = {};

		for (const skill of expert.skills) {
			skills[expert.id][skill.id] = createSkillState();
		}
	}

	return {
		relationships,
		skills,
		inventory: createInventoryState(),
		valeriaLevel: 0,
		baldurLevel: 0,
	};
}

/* =========================================================
 * HELPERS
 * ========================================================= */

function clampRelationshipLevel(value: number | null | undefined) {
	if (value === null || value === undefined || !Number.isFinite(value)) {
		return null;
	}

	return Math.max(0, Math.min(100, Math.floor(value)));
}

function clampSkillLevel(value: number | null | undefined) {
	if (value === null || value === undefined || !Number.isFinite(value)) {
		return null;
	}

	return Math.max(0, Math.floor(value));
}

function clampResource(value: number | null | undefined) {
	if (value === null || value === undefined || !Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, value);
}

function clampEventLevel(value: number | null | undefined) {
	if (value === null || value === undefined || !Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, Math.min(10, Math.floor(value)));
}

/* =========================================================
 * NORMALIZE HISTORY STATE
 * ========================================================= */

function normalizeState(input: ExpertsState): ExpertsState {
	const initial = createInitialState();

	const relationships: ExpertsState["relationships"] = {};

	const skills: ExpertsState["skills"] = {};

	for (const expert of EXPERTS) {
		const savedRelationship = input.relationships?.[expert.id];

		relationships[expert.id] = {
			...initial.relationships[expert.id],
			currentLevel: clampRelationshipLevel(savedRelationship?.currentLevel),
			targetLevel: clampRelationshipLevel(savedRelationship?.targetLevel),
			currentAffinity: clampResource(savedRelationship?.currentAffinity),
			currentSigils: clampResource(savedRelationship?.currentSigils),
		};

		skills[expert.id] = {};

		for (const skill of expert.skills) {
			const savedSkill = input.skills?.[expert.id]?.[skill.id];

			skills[expert.id][skill.id] = {
				...initial.skills[expert.id][skill.id],
				currentLevel: clampSkillLevel(savedSkill?.currentLevel),
				targetLevel: clampSkillLevel(savedSkill?.targetLevel),
				currentXp: clampResource(savedSkill?.currentXp),
			};
		}
	}

	return {
		relationships,
		skills,

		inventory: {
			compassGifts: clampResource(input.inventory?.compassGifts),

			fieryHeartGifts: clampResource(input.inventory?.fieryHeartGifts),

			sailConquestGifts: clampResource(input.inventory?.sailConquestGifts),

			generalSigils: clampResource(input.inventory?.generalSigils),

			booksOfKnowledge: clampResource(input.inventory?.booksOfKnowledge),

			learningSpeedupMinutes: clampResource(
				input.inventory?.learningSpeedupMinutes,
			),
		},

		valeriaLevel: clampEventLevel(input.valeriaLevel),

		baldurLevel: clampEventLevel(input.baldurLevel),
	};
}

/* =========================================================
 * HOOK
 * ========================================================= */

export function useExpertsCalculator() {
	const [state, setState] = useState<ExpertsState>(createInitialState);

	/* =======================================================
	 * LOAD STATE
	 * ======================================================= */

	const loadState = useCallback((savedState: ExpertsState) => {
		setState(normalizeState(savedState));
	}, []);

	/* =======================================================
	 * INVENTORY
	 * ======================================================= */

	const setInventory = useCallback(
		(key: keyof ExpertInventoryState, value: number) => {
			setState((current) => ({
				...current,

				inventory: {
					...current.inventory,

					[key]: clampResource(value),
				},
			}));
		},
		[],
	);

	/* =======================================================
	 * EVENT BONUS
	 * ======================================================= */

	const setValeriaLevel = useCallback((level: number) => {
		setState((current) => ({
			...current,

			valeriaLevel: clampEventLevel(level),
		}));
	}, []);

	const setBaldurLevel = useCallback((level: number) => {
		setState((current) => ({
			...current,

			baldurLevel: clampEventLevel(level),
		}));
	}, []);

	/* =======================================================
	 * RELATIONSHIP
	 * ======================================================= */

	const setRelationship = useCallback(
		(expertId: string, value: Partial<ExpertRelationshipState>) => {
			setState((current) => ({
				...current,

				relationships: {
					...current.relationships,

					[expertId]: {
						...current.relationships[expertId],
						...value,
					},
				},
			}));
		},
		[],
	);

	const setRelationshipCurrentLevel = useCallback(
		(expertId: string, level: number | null) => {
			setRelationship(expertId, {
				currentLevel: clampRelationshipLevel(level),
			});
		},
		[setRelationship],
	);

	const setRelationshipTargetLevel = useCallback(
		(expertId: string, level: number | null) => {
			setRelationship(expertId, {
				targetLevel: clampRelationshipLevel(level),
			});
		},
		[setRelationship],
	);

	const setCurrentAffinity = useCallback(
		(expertId: string, value: number) => {
			setRelationship(expertId, {
				currentAffinity: clampResource(value),
			});
		},
		[setRelationship],
	);

	const setCurrentSigils = useCallback(
		(expertId: string, value: number) => {
			setRelationship(expertId, {
				currentSigils: clampResource(value),
			});
		},
		[setRelationship],
	);

	/* =======================================================
	 * SKILLS
	 * ======================================================= */

	const setSkill = useCallback(
		(expertId: string, skillId: string, value: Partial<ExpertSkillState>) => {
			setState((current) => ({
				...current,

				skills: {
					...current.skills,

					[expertId]: {
						...current.skills[expertId],

						[skillId]: {
							...current.skills[expertId]?.[skillId],

							...value,
						},
					},
				},
			}));
		},
		[],
	);

	const setSkillCurrentLevel = useCallback(
		(expertId: string, skillId: string, level: number | null) => {
			setSkill(expertId, skillId, {
				currentLevel: clampSkillLevel(level),
			});
		},
		[setSkill],
	);

	const setSkillTargetLevel = useCallback(
		(expertId: string, skillId: string, level: number | null) => {
			setSkill(expertId, skillId, {
				targetLevel: clampSkillLevel(level),
			});
		},
		[setSkill],
	);

	const setSkillCurrentXp = useCallback(
		(expertId: string, skillId: string, xp: number) => {
			setSkill(expertId, skillId, {
				currentXp: clampResource(xp),
			});
		},
		[setSkill],
	);

	/* =======================================================
	 * RESET
	 * ======================================================= */

	const reset = useCallback(() => {
		setState(createInitialState());
	}, []);

	/* =======================================================
	 * RESULT
	 * ======================================================= */

	const result = useMemo(() => calculateExpertsTotal(EXPERTS, state), [state]);

	return {
		state,
		result,
		experts: EXPERTS,

		loadState,

		setInventory,

		setValeriaLevel,
		setBaldurLevel,

		setRelationship,
		setRelationshipCurrentLevel,
		setRelationshipTargetLevel,
		setCurrentAffinity,
		setCurrentSigils,

		setSkill,
		setSkillCurrentLevel,
		setSkillTargetLevel,
		setSkillCurrentXp,

		reset,
	};
}
