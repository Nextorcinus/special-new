"use client";

import { useMemo } from "react";

import { EXPERT_GENERATIONS, getExpertsByGeneration } from "../data";
import { useExpertsCalculator } from "../hooks/useExpertsCalculator";

import { ExpertGeneration } from "./ExpertGeneration";
import { ExpertInventory } from "./ExpertInventory";
import { ExpertsResult } from "./ExpertsResult";

const EVENT_LEVELS = Array.from({ length: 11 }, (_, level) => level);

export function ExpertsCalculator() {
	const {
		state,
		result,
		setInventory,
		setValeriaLevel,
		setBaldurLevel,
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
			EXPERT_GENERATIONS.map((generation) => ({
				generation,
				experts: getExpertsByGeneration(generation),
			})),
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
						Plan Expert relationship and skill upgrades.
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

			<ExpertInventory inventory={state.inventory} onChange={setInventory} />

			<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
				<div>
					<h2 className="text-sm font-semibold text-white">Event Bonus</h2>

					<p className="mt-1 text-xs text-white/40">
						Set Valeria and Baldur levels used for SvS and Alliance Showdown
						calculation.
					</p>
				</div>

				<div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
					<div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-white">Valeria</p>

								<p className="mt-0.5 text-xs text-white/40">SvS Bonus</p>
							</div>

							<div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-right">
								<p className="text-[10px] uppercase tracking-wide text-white/30">
									Bonus
								</p>

								<p className="mt-0.5 text-sm font-semibold text-white">
									+{state.valeriaLevel * 2}%
								</p>
							</div>
						</div>

						<div className="mt-3">
							<label
								htmlFor="experts-valeria-level"
								className="mb-1.5 block text-xs font-medium text-white/50"
							>
								Valeria Level
							</label>

							<select
								id="experts-valeria-level"
								value={state.valeriaLevel}
								onChange={(event) =>
									setValeriaLevel(Number(event.target.value))
								}
								className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition hover:bg-white/10 focus:border-white/20 focus:bg-white/10"
							>
								{EVENT_LEVELS.map((level) => (
									<option
										key={level}
										value={level}
										className="bg-zinc-900 text-white"
									>
										{level === 0
											? "Level 0"
											: `Level ${level} (+${level * 2}% SvS)`}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-white">Baldur</p>

								<p className="mt-0.5 text-xs text-white/40">
									Alliance Showdown
								</p>
							</div>

							<div className="rounded-lg bg-white/5 px-2.5 py-1.5 text-right">
								<p className="text-[10px] uppercase tracking-wide text-white/30">
									Bonus
								</p>

								<p className="mt-0.5 text-sm font-semibold text-white">
									+{state.baldurLevel * 5}%
								</p>
							</div>
						</div>

						<div className="mt-3">
							<label
								htmlFor="experts-baldur-level"
								className="mb-1.5 block text-xs font-medium text-white/50"
							>
								Baldur Level
							</label>

							<select
								id="experts-baldur-level"
								value={state.baldurLevel}
								onChange={(event) => setBaldurLevel(Number(event.target.value))}
								className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition hover:bg-white/10 focus:border-white/20 focus:bg-white/10"
							>
								{EVENT_LEVELS.map((level) => (
									<option
										key={level}
										value={level}
										className="bg-zinc-900 text-white"
									>
										{level === 0
											? "Level 0"
											: `Level ${level} (+${level * 5}% Showdown)`}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
			</section>

			<div className="space-y-6">
				{generations.map(({ generation, experts }) => (
					<ExpertGeneration
						key={generation}
						generation={generation}
						experts={experts}
						relationships={state.relationships}
						skills={state.skills}
						onCurrentRelationshipChange={setRelationshipCurrentLevel}
						onTargetRelationshipChange={setRelationshipTargetLevel}
						onCurrentAffinityChange={setCurrentAffinity}
						onCurrentSigilsChange={setCurrentSigils}
						onCurrentSkillLevelChange={setSkillCurrentLevel}
						onTargetSkillLevelChange={setSkillTargetLevel}
						onSkillXpChange={setSkillCurrentXp}
					/>
				))}
			</div>

			<ExpertsResult result={result} />
		</div>
	);
}
