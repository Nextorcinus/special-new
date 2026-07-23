"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import defaultRecommendationJson from "../data/bear-recommendation.json";

import {
	addJoiningPriorityItem,
	addOpeningHeroId,
	cloneBearRecommendationData,
	normalizeBearRecommendationData,
	reindexJoiningPriority,
	removeJoiningPriorityItem,
	removeOpeningHeroId,
	reorderJoiningPriority,
	updateJoiningHero,
} from "../helpers/bear.helpers";

import type {
	BearJoiningPriorityItem,
	BearOpeningGroup,
	BearRecommendationData,
	BearRecommendationState,
} from "../type";

const STORAGE_KEY = "special-lazyness-bear-recommendation";

const defaultRecommendation = normalizeBearRecommendationData(
	defaultRecommendationJson as BearRecommendationData,
);

function createDefaultRecommendation(): BearRecommendationData {
	return cloneBearRecommendationData(defaultRecommendation);
}

export const useBearRecommendationStore = create<BearRecommendationState>()(
	persist(
		(set, get) => ({
			data: createDefaultRecommendation(),
			isLoaded: false,

			loadRecommendation: () => {
				set({
					isLoaded: true,
				});
			},

			setOpeningHeroes: (group: BearOpeningGroup, heroIds: string[]) => {
				set((state) => ({
					data: {
						...state.data,
						openingRallies: {
							...state.data.openingRallies,
							[group]: Array.from(
								new Set(
									heroIds
										.map((heroId) =>
											String(heroId ?? "")
												.trim()
												.toLowerCase(),
										)
										.filter(Boolean),
								),
							),
						},
					},
				}));
			},

			addOpeningHero: (group: BearOpeningGroup, heroId: string) => {
				set((state) => ({
					data: {
						...state.data,
						openingRallies: {
							...state.data.openingRallies,
							[group]: addOpeningHeroId(
								state.data.openingRallies[group],
								heroId,
							),
						},
					},
				}));
			},

			removeOpeningHero: (group: BearOpeningGroup, heroId: string) => {
				set((state) => ({
					data: {
						...state.data,
						openingRallies: {
							...state.data.openingRallies,
							[group]: removeOpeningHeroId(
								state.data.openingRallies[group],
								heroId,
							),
						},
					},
				}));
			},

			setJoiningPriority: (items: BearJoiningPriorityItem[]) => {
				set((state) => ({
					data: {
						...state.data,
						joiningPriority: reindexJoiningPriority(items),
					},
				}));
			},

			setJoiningHero: (itemId: string, heroId: string | null) => {
				set((state) => ({
					data: {
						...state.data,
						joiningPriority: updateJoiningHero(
							state.data.joiningPriority,
							itemId,
							heroId,
						),
					},
				}));
			},

			addJoiningHero: (heroId: string | null = null) => {
				set((state) => ({
					data: {
						...state.data,
						joiningPriority: addJoiningPriorityItem(
							state.data.joiningPriority,
							heroId,
						),
					},
				}));
			},

			removeJoiningHero: (itemId: string) => {
				set((state) => ({
					data: {
						...state.data,
						joiningPriority: removeJoiningPriorityItem(
							state.data.joiningPriority,
							itemId,
						),
					},
				}));
			},

			moveJoiningHero: (itemId: string, direction: "up" | "down") => {
				set((state) => ({
					data: {
						...state.data,
						joiningPriority: reorderJoiningPriority(
							state.data.joiningPriority,
							itemId,
							direction,
						),
					},
				}));
			},

			setWarning: (warning: string) => {
				set((state) => ({
					data: {
						...state.data,
						warning: String(warning ?? "").trim(),
					},
				}));
			},

			resetRecommendation: () => {
				set({
					data: createDefaultRecommendation(),
				});
			},
		}),
		{
			name: STORAGE_KEY,

			partialize: (state) => ({
				data: state.data,
			}),

			merge: (persistedState, currentState) => {
				const persisted = persistedState as Partial<BearRecommendationState>;

				const persistedData = persisted.data
					? normalizeBearRecommendationData(persisted.data)
					: createDefaultRecommendation();

				return {
					...currentState,
					data: persistedData,
				};
			},

			onRehydrateStorage: () => {
				return (state) => {
					state?.loadRecommendation();
				};
			},
		},
	),
);

export function getBearRecommendationState(): BearRecommendationState {
	return useBearRecommendationStore.getState();
}

export function resetBearRecommendation(): void {
	useBearRecommendationStore.getState().resetRecommendation();
}
