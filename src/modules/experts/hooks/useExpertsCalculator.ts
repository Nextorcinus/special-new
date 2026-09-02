"use client";

import { useCallback, useMemo, useState } from "react";

import { calculateExpertsTotal } from "../calculator";
import { EXPERTS } from "../data";

import type {
	ExpertInventoryState,
	ExpertRelationshipState,
	ExpertSkillState,
	ExpertsState,
} from "../types";

function createRelationshipState(): ExpertRelationshipState {
	return {
		currentLevel: null,
		targetLevel: null,
		currentAffinity: 0,
		currentSigils: 0,
	};
}

function createSkillState(): ExpertSkillState {
	return {
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

function clampRelationshipLevel(value: number): number {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, Math.min(100, Math.floor(value)));
}

function clampSkillLevel(value: number, max = 10): number {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, Math.min(max, Math.floor(value)));
}

function normalizeRelationship(value: unknown): ExpertRelationshipState {
	const source =
		value && typeof value === "object"
			? (value as Partial<ExpertRelationshipState>)
			: {};

	const currentLevel =
		source.currentLevel === null || source.currentLevel === undefined
			? null
			: clampRelationshipLevel(Number(source.currentLevel));

	const rawTarget =
		source.targetLevel === null || source.targetLevel === undefined
			? null
			: clampRelationshipLevel(Number(source.targetLevel));

	const targetLevel =
		currentLevel === null
			? null
			: rawTarget === null
				? null
				: Math.max(currentLevel, rawTarget);

	const currentAffinity = Number.isFinite(Number(source.currentAffinity))
		? Math.max(0, Number(source.currentAffinity))
		: 0;

	const currentSigils = Number.isFinite(Number(source.currentSigils))
		? Math.max(0, Number(source.currentSigils))
		: 0;

	return {
		currentLevel,
		targetLevel,
		currentAffinity,
		currentSigils,
	};
}

function normalizeSkill(value: unknown): ExpertSkillState {
	const source =
		value && typeof value === "object"
			? (value as Partial<ExpertSkillState>)
			: {};

	const currentLevel =
		source.currentLevel === null || source.currentLevel === undefined
			? null
			: clampSkillLevel(Number(source.currentLevel));

	const rawTarget =
		source.targetLevel === null || source.targetLevel === undefined
			? null
			: clampSkillLevel(Number(source.targetLevel));

	const targetLevel =
		currentLevel === null
			? null
			: rawTarget === null
				? null
				: Math.max(currentLevel, rawTarget);

	const currentXp = Number.isFinite(Number(source.currentXp))
		? Math.max(0, Number(source.currentXp))
		: 0;

	return {
		currentLevel,
		targetLevel,
		currentXp,
	};
}

function normalizeInventory(value: unknown): ExpertInventoryState {
	const source =
		value && typeof value === "object"
			? (value as Partial<ExpertInventoryState>)
			: {};

	return {
		compassGifts: normalizeNumber(source.compassGifts),
		fieryHeartGifts: normalizeNumber(source.fieryHeartGifts),
		sailConquestGifts: normalizeNumber(source.sailConquestGifts),
		generalSigils: normalizeNumber(source.generalSigils),
		booksOfKnowledge: normalizeNumber(source.booksOfKnowledge),
		learningSpeedupMinutes: normalizeNumber(source.learningSpeedupMinutes),
	};
}

function normalizeNumber(value: unknown): number {
	const number = Number(value);

	if (!Number.isFinite(number)) {
		return 0;
	}

	return Math.max(0, number);
}

function normalizeEventLevel(value: unknown): number {
	const number = Number(value);

	if (!Number.isFinite(number)) {
		return 0;
	}

	return Math.max(0, Math.min(10, Math.floor(number)));
}

function normalizeState(value: unknown): ExpertsState {
	const source =
		value && typeof value === "object" ? (value as Partial<ExpertsState>) : {};

	const initial = createInitialState();

	const relationships: ExpertsState["relationships"] = {
		...initial.relationships,
	};

	const skills: ExpertsState["skills"] = {};

	for (const expert of EXPERTS) {
		const savedRelationship = source.relationships?.[expert.id];

		relationships[expert.id] = normalizeRelationship(savedRelationship);

		const savedSkills = source.skills?.[expert.id];

		skills[expert.id] = {};

		for (const skill of expert.skills) {
			skills[expert.id][skill.id] = normalizeSkill(savedSkills?.[skill.id]);
		}
	}

	return {
		relationships,
		skills,
		inventory: normalizeInventory(source.inventory),
		valeriaLevel: normalizeEventLevel(source.valeriaLevel),
		baldurLevel: normalizeEventLevel(source.baldurLevel),
	};
}

export function useExpertsCalculator() {
	const [state, setState] = useState<ExpertsState>(createInitialState);

	const setInventory = useCallback(
		(key: keyof ExpertInventoryState, value: number) => {
			setState((current) => ({
				...current,
				inventory: {
					...current.inventory,
					[key]: Math.max(0, Number.isFinite(value) ? value : 0),
				},
			}));
		},
		[],
	);

	const setValeriaLevel = useCallback((level: number) => {
		setState((current) => ({
			...current,
			valeriaLevel: Math.max(
				0,
				Math.min(10, Math.floor(Number.isFinite(level) ? level : 0)),
			),
		}));
	}, []);

	const setBaldurLevel = useCallback((level: number) => {
		setState((current) => ({
			...current,
			baldurLevel: Math.max(
				0,
				Math.min(10, Math.floor(Number.isFinite(level) ? level : 0)),
			),
		}));
	}, []);

	const setRelationship = useCallback(
		(expertId: string, value: Partial<ExpertRelationshipState>) => {
			setState((current) => {
				const previous =
					current.relationships[expertId] ?? createRelationshipState();

				const next = {
					...previous,
					...value,
				};

				return {
					...current,
					relationships: {
						...current.relationships,
						[expertId]: normalizeRelationship(next),
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

				const targetLevel =
					previous.targetLevel !== null && previous.targetLevel > nextLevel
						? previous.targetLevel
						: null;

				return {
					...current,
					relationships: {
						...current.relationships,
						[expertId]: {
							...previous,
							currentLevel: nextLevel,
							targetLevel,
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

				if (relationship.currentLevel === null) {
					return current;
				}

				const nextLevel = Math.max(
					relationship.currentLevel,
					clampRelationshipLevel(level),
				);

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
		[setRelationship],
	);

	const setCurrentAffinity = useCallback(
		(expertId: string, value: number) => {
			setRelationship(expertId, {
				currentAffinity: normalizeNumber(value),
			});
		},
		[setRelationship],
	);

	const setCurrentSigils = useCallback(
		(expertId: string, value: number) => {
			setRelationship(expertId, {
				currentSigils: normalizeNumber(value),
			});
		},
		[setRelationship],
	);

	const setSkill = useCallback(
		(expertId: string, skillId: string, value: Partial<ExpertSkillState>) => {
			setState((current) => {
				const previous =
					current.skills[expertId]?.[skillId] ?? createSkillState();

				const next = {
					...previous,
					...value,
				};

				return {
					...current,
					skills: {
						...current.skills,
						[expertId]: {
							...current.skills[expertId],
							[skillId]: normalizeSkill(next),
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

				const targetLevel =
					previous.targetLevel !== null && previous.targetLevel > nextLevel
						? previous.targetLevel
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
								targetLevel,
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

				if (skill.currentLevel === null) {
					return current;
				}

				const nextLevel = Math.max(skill.currentLevel, clampSkillLevel(level));

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
		[setSkill],
	);

	const setSkillCurrentXp = useCallback(
		(expertId: string, skillId: string, xp: number) => {
			setSkill(expertId, skillId, {
				currentXp: normalizeNumber(xp),
			});
		},
		[setSkill],
	);

	const loadState = useCallback((savedState: ExpertsState) => {
		setState(normalizeState(savedState));
	}, []);

	const reset = useCallback(() => {
		setState(createInitialState());
	}, []);

	const result = useMemo(() => calculateExpertsTotal(EXPERTS, state), [state]);

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
		loadState,
		reset,
	};
}
