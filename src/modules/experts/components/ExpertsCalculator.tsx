"use client";

import { useMemo } from "react";

import {
	EXPERT_GENERATIONS,
	getExpertsByGeneration,
} from "../data";
import { useExpertsCalculator } from "../hooks/useExpertsCalculator";

import { ExpertGeneration } from "./ExpertGeneration";
import { ExpertInventory } from "./ExpertInventory";
import { ExpertsResult } from "./ExpertsResult";

export function ExpertsCalculator() {
	const {
		state,
		result,
		setInventory,
		setRelationshipCurrentLevel,
		setRelationshipTargetLevel,
		setCurrentAffinity,
		setCurrentSigils,
		setSkillCurrentLevel,
		setSkillTargetLevel,
		setSkillCurrentXp,
		reset,
	} = useExpertsCalculator();

	const generations = useMemo(
		() =>
			EXPERT_GENERATIONS.map(
				(generation) => ({
					generation,
					experts:
						getExpertsByGeneration(
							generation,
						),
				}),
			),
		[],
	);

	return (
		<div className="w-full space-y-6 p-4 sm:p-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-xl font-semibold text-white">
						Experts Calculator
					</h1>

					<p className="mt-1 text-sm text-white/50">
						Plan Expert relationship and
						skill upgrades.
					</p>
				</div>

				<button
					type="button"
					onClick={reset}
					className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
				>
					Reset
				</button>
			</div>

			<ExpertInventory
				inventory={state.inventory}
				onChange={setInventory}
			/>

			<div className="space-y-6">
				{generations.map(
					({
						generation,
						experts,
					}) => (
						<ExpertGeneration
							key={generation}
							generation={generation}
							experts={experts}
							relationships={
								state.relationships
							}
							skills={state.skills}
							onCurrentRelationshipChange={
								setRelationshipCurrentLevel
							}
							onTargetRelationshipChange={
								setRelationshipTargetLevel
							}
							onCurrentAffinityChange={
								setCurrentAffinity
							}
							onCurrentSigilsChange={
								setCurrentSigils
							}
							onCurrentSkillLevelChange={
								setSkillCurrentLevel
							}
							onTargetSkillLevelChange={
								setSkillTargetLevel
							}
							onSkillXpChange={
								setSkillCurrentXp
							}
						/>
					),
				)}
			</div>

			<ExpertsResult result={result} />
		</div>
	);
}