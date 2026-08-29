"use client";

import {
	useCallback,
	useMemo,
	useState,
} from "react";

import {
	DEFAULT_EXPERT_RELATIONSHIP,
	DEFAULT_EXPERT_SKILL,
} from "../constants";
import { EXPERTS } from "../data";
import { calculateExpertsTotal } from "../calculator";

import type {
	ExpertInventoryState,
	ExpertRelationshipState,
	ExpertSkillState,
	ExpertsState,
} from "../types";

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

function createInitialState(): ExpertsState {
	const relationships: ExpertsState["relationships"] =
		{};

	const skills: ExpertsState["skills"] =
		{};

	for (const expert of EXPERTS) {
		relationships[expert.id] =
			createRelationshipState();

		skills[expert.id] = {};

		for (const skill of expert.skills) {
			skills[expert.id][skill.id] =
				createSkillState();
		}
	}

	return {
		relationships,
		skills,
		inventory: createInventoryState(),
	};
}

export function useExpertsCalculator() {
	const [state, setState] =
		useState<ExpertsState>(
			createInitialState,
		);

	const setInventory = useCallback(
		(
			key: keyof ExpertInventoryState,
			value: number,
		) => {
			setState((current) => ({
				...current,
				inventory: {
					...current.inventory,
					[key]: Math.max(0, value),
				},
			}));
		},
		[],
	);

	const setRelationship = useCallback(
		(
			expertId: string,
			value: Partial<ExpertRelationshipState>,
		) => {
			setState((current) => ({
				...current,
				relationships: {
					...current.relationships,
					[expertId]: {
						...current.relationships[
							expertId
						],
						...value,
					},
				},
			}));
		},
		[],
	);

	const setRelationshipCurrentLevel =
		useCallback(
			(
				expertId: string,
				level: number,
			) => {
				setRelationship(
					expertId,
					{
						currentLevel: Math.max(
							0,
							Math.min(100, level),
						),
					},
				);
			},
			[setRelationship],
		);

	const setRelationshipTargetLevel =
		useCallback(
			(
				expertId: string,
				level: number,
			) => {
				setRelationship(
					expertId,
					{
						targetLevel: Math.max(
							0,
							Math.min(100, level),
						),
					},
				);
			},
			[setRelationship],
		);

	const setCurrentAffinity =
		useCallback(
			(
				expertId: string,
				value: number,
			) => {
				setRelationship(
					expertId,
					{
						currentAffinity:
							Math.max(0, value),
					},
				);
			},
			[setRelationship],
		);

	const setCurrentSigils =
		useCallback(
			(
				expertId: string,
				value: number,
			) => {
				setRelationship(
					expertId,
					{
						currentSigils:
							Math.max(0, value),
					},
				);
			},
			[setRelationship],
		);

	const setSkill = useCallback(
		(
			expertId: string,
			skillId: string,
			value: Partial<ExpertSkillState>,
		) => {
			setState((current) => ({
				...current,
				skills: {
					...current.skills,
					[expertId]: {
						...current.skills[
							expertId
						],
						[skillId]: {
							...current.skills[
								expertId
							]?.[skillId],
							...value,
						},
					},
				},
			}));
		},
		[],
	);

	const setSkillCurrentLevel =
		useCallback(
			(
				expertId: string,
				skillId: string,
				level: number,
			) => {
				setSkill(
					expertId,
					skillId,
					{
						currentLevel: Math.max(
							0,
							level,
						),
					},
				);
			},
			[setSkill],
		);

	const setSkillTargetLevel =
		useCallback(
			(
				expertId: string,
				skillId: string,
				level: number,
			) => {
				setSkill(
					expertId,
					skillId,
					{
						targetLevel: Math.max(
							0,
							level,
						),
					},
				);
			},
			[setSkill],
		);

	const setSkillCurrentXp =
		useCallback(
			(
				expertId: string,
				skillId: string,
				xp: number,
			) => {
				setSkill(
					expertId,
					skillId,
					{
						currentXp: Math.max(
							0,
							xp,
						),
					},
				);
			},
			[setSkill],
		);

	const reset = useCallback(() => {
		setState(createInitialState());
	}, []);

	const result = useMemo(
		() =>
			calculateExpertsTotal(
				EXPERTS,
				state,
			),
		[state],
	);

	return {
		state,
		result,
		experts: EXPERTS,

		setInventory,

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