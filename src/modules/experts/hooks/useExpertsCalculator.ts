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

		currentLevel: null,
		targetLevel: null,

		currentAffinity: 0,
		currentSigils: 0,
	};
}

function createSkillState(): ExpertSkillState {
	return {
		...DEFAULT_EXPERT_SKILL,

		currentLevel: null,
		targetLevel: null,

		currentXp: 0,
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

function clampRelationshipLevel(value: number): number {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, Math.min(100, Math.floor(value)));
}

function clampSkillLevel(value: number): number {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, Math.floor(value));
}

function clampResource(value: number): number {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, value);
}

function clampEventLevel(value: number): number {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, Math.min(10, Math.floor(value)));
}

/* =========================================================
 * HOOK
 * ========================================================= */

export function useExpertsCalculator() {
	const [state, setState] = useState<ExpertsState>(createInitialState);

	/* =====================================================
	 * INVENTORY
	 * ===================================================== */

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

	/* =====================================================
	 * VALERIA
	 * ===================================================== */

	const setValeriaLevel = useCallback((level: number) => {
		setState((current) => ({
			...current,

			valeriaLevel: clampEventLevel(level),
		}));
	}, []);

	/* =====================================================
	 * BALDUR
	 * ===================================================== */

	const setBaldurLevel = useCallback((level: number) => {
		setState((current) => ({
			...current,

			baldurLevel: clampEventLevel(level),
		}));
	}, []);

	/* =====================================================
	 * RELATIONSHIP
	 * ===================================================== */

	const setRelationship = useCallback(
		(expertId: string, value: Partial<ExpertRelationshipState>) => {
			setState((current) => {
				const previous =
					current.relationships[expertId] ?? createRelationshipState();

				return {
					...current,

					relationships: {
						...current.relationships,

						[expertId]: {
							...previous,
							...value,
						},
					},
				};
			});
		},
		[],
	);

	const setRelationshipCurrentLevel = useCallback(
		(expertId: string, level: number | null) => {
			if (level === null) {
				setRelationship(expertId, {
					currentLevel: null,
					targetLevel: null,
				});

				return;
			}

			const nextLevel = clampRelationshipLevel(level);

			setState((current) => {
				const previous =
					current.relationships[expertId] ?? createRelationshipState();

				const currentTarget = previous.targetLevel;

				const validTarget =
					currentTarget !== null && currentTarget > nextLevel
						? currentTarget
						: null;

				return {
					...current,

					relationships: {
						...current.relationships,

						[expertId]: {
							...previous,

							currentLevel: nextLevel,

							targetLevel: validTarget,
						},
					},
				};
			});
		},
		[setRelationship],
	);

	const setRelationshipTargetLevel = useCallback(
		(expertId: string, level: number | null) => {
			if (level === null) {
				setRelationship(expertId, {
					targetLevel: null,
				});

				return;
			}

			setState((current) => {
				const relationship =
					current.relationships[expertId] ?? createRelationshipState();

				const currentLevel = relationship.currentLevel;

				if (currentLevel === null) {
					return current;
				}

				const nextLevel = clampRelationshipLevel(level);

				/*
				 * Target harus selalu lebih
				 * tinggi daripada Current.
				 */
				if (nextLevel <= currentLevel) {
					return current;
				}

				return {
					...current,

					relationships: {
						...current.relationships,

						[expertId]: {
							...relationship,

							targetLevel: nextLevel,
						},
					},
				};
			});
		},
		[],
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

	/* =====================================================
	 * SKILLS
	 * ===================================================== */

	const setSkill = useCallback(
		(expertId: string, skillId: string, value: Partial<ExpertSkillState>) => {
			setState((current) => {
				const previous =
					current.skills[expertId]?.[skillId] ?? createSkillState();

				return {
					...current,

					skills: {
						...current.skills,

						[expertId]: {
							...current.skills[expertId],

							[skillId]: {
								...previous,
								...value,
							},
						},
					},
				};
			});
		},
		[],
	);

	const setSkillCurrentLevel = useCallback(
		(expertId: string, skillId: string, level: number | null) => {
			if (level === null) {
				setSkill(expertId, skillId, {
					currentLevel: null,
					targetLevel: null,
				});

				return;
			}

			const nextLevel = clampSkillLevel(level);

			setState((current) => {
				const previous =
					current.skills[expertId]?.[skillId] ?? createSkillState();

				const currentTarget = previous.targetLevel;

				const validTarget =
					currentTarget !== null && currentTarget > nextLevel
						? currentTarget
						: null;

				return {
					...current,

					skills: {
						...current.skills,

						[expertId]: {
							...current.skills[expertId],

							[skillId]: {
								...previous,

								currentLevel: nextLevel,

								targetLevel: validTarget,
							},
						},
					},
				};
			});
		},
		[setSkill],
	);

	const setSkillTargetLevel = useCallback(
		(expertId: string, skillId: string, level: number | null) => {
			if (level === null) {
				setSkill(expertId, skillId, {
					targetLevel: null,
				});

				return;
			}

			setState((current) => {
				const skill = current.skills[expertId]?.[skillId] ?? createSkillState();

				const currentLevel = skill.currentLevel;

				if (currentLevel === null) {
					return current;
				}

				const nextLevel = clampSkillLevel(level);

				/*
				 * Target skill harus lebih
				 * tinggi daripada Current.
				 */
				if (nextLevel <= currentLevel) {
					return current;
				}

				return {
					...current,

					skills: {
						...current.skills,

						[expertId]: {
							...current.skills[expertId],

							[skillId]: {
								...skill,

								targetLevel: nextLevel,
							},
						},
					},
				};
			});
		},
		[],
	);

	const setSkillCurrentXp = useCallback(
		(expertId: string, skillId: string, xp: number) => {
			setSkill(expertId, skillId, {
				currentXp: clampResource(xp),
			});
		},
		[setSkill],
	);

	/* =====================================================
	 * RESET
	 * ===================================================== */

	const reset = useCallback(() => {
		setState(createInitialState());
	}, []);

	/* =====================================================
	 * CALCULATION
	 * ===================================================== */

	const result = useMemo(() => calculateExpertsTotal(EXPERTS, state), [state]);

	/* =====================================================
	 * RETURN
	 * ===================================================== */

	return {
		state,

		result,

		experts: EXPERTS,

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
