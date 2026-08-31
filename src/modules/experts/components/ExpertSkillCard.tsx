"use client";

import { calculateSkillCap, getSkillRequirement } from "../calculator";

import type { Expert, ExpertSkill, ExpertSkillState } from "../types";

interface ExpertSkillCardProps {
	expert: Expert;
	skill: ExpertSkill;
	relationshipLevel: number;
	state: ExpertSkillState;
	onCurrentLevelChange: (level: number) => void;
	onTargetLevelChange: (level: number) => void;
	onXpChange: (xp: number) => void;
}

function clampLevel(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

export function ExpertSkillCard({
	expert,
	skill,
	relationshipLevel,
	state,
	onCurrentLevelChange,
	onTargetLevelChange,
	onXpChange,
}: ExpertSkillCardProps) {
	/*
	 * Skill cap berdasarkan relationship.
	 *
	 * Contoh:
	 * Relationship Lv.10
	 * Entrapment Max Lv.10
	 *
	 * Relationship Lv.20
	 * Scavenging Max Lv.5
	 */
	const calculatedSkillCap = calculateSkillCap(
		expert,
		skill,
		relationshipLevel,
	);

	const skillCap = clampLevel(calculatedSkillCap, 0, skill.maxLevel);

	const requiredRelationship = getSkillRequirement(expert, skill.id);

	const isLocked = relationshipLevel < requiredRelationship;

	/*
	 * Current level tidak boleh melebihi
	 * skill cap yang sedang terbuka.
	 */
	const currentLevel = clampLevel(state.currentLevel, 0, skillCap);

	/*
	 * Target harus:
	 *
	 * 1. Lebih tinggi dari Current Level
	 * 2. Tidak boleh melebihi Skill Cap
	 *
	 * Jika Current = 6
	 * Target minimal = 7
	 */
	const minimumTargetLevel = currentLevel + 1;

	const hasUpgradeAvailable = minimumTargetLevel <= skillCap;

	const targetLevel = hasUpgradeAvailable
		? clampLevel(state.targetLevel, minimumTargetLevel, skillCap)
		: currentLevel;

	/*
	 * Current Level options.
	 */
	const currentLevels = Array.from(
		{
			length: skillCap + 1,
		},
		(_, index) => index,
	);

	/*
	 * Target Level options.
	 *
	 * Sengaja dimulai dari Current + 1.
	 *
	 * Contoh:
	 *
	 * Current Lv.6
	 * Skill Cap Lv.10
	 *
	 * Target:
	 * Lv.7
	 * Lv.8
	 * Lv.9
	 * Lv.10
	 */
	const targetLevels = hasUpgradeAvailable
		? Array.from(
				{
					length: skillCap - currentLevel,
				},
				(_, index) => currentLevel + 1 + index,
			)
		: [];

	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate text-sm font-medium text-white">
						{skill.name}
					</p>

					<p className="mt-1 text-xs text-white/40">
						Required Relationship Lv. {requiredRelationship}
					</p>
				</div>

				<div className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs text-white/50">
					Max Lv. {skill.maxLevel}
				</div>
			</div>

			{isLocked ? (
				<div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/40">
					Unlocks at Relationship Lv. {requiredRelationship}
				</div>
			) : (
				<div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
					{/* CURRENT LEVEL */}
					<div className="space-y-1.5">
						<label
							htmlFor={`${expert.id}-${skill.id}-current`}
							className="text-xs font-medium text-white/50"
						>
							Current Level
						</label>

						<select
							id={`${expert.id}-${skill.id}-current`}
							value={currentLevel}
							onChange={(event) => {
								const nextLevel = clampLevel(
									Number(event.target.value),
									0,
									skillCap,
								);

								onCurrentLevelChange(nextLevel);

								/*
								 * Target harus selalu lebih tinggi
								 * dari Current.
								 *
								 * Jika Current naik melewati
								 * Target sebelumnya, otomatis
								 * pindahkan Target ke Current + 1.
								 */
								const nextMinimumTarget = nextLevel + 1;

								if (nextMinimumTarget <= skillCap) {
									const nextTarget = Math.max(nextMinimumTarget, targetLevel);

									onTargetLevelChange(Math.min(nextTarget, skillCap));
								} else {
									/*
									 * Current sudah mencapai
									 * skill cap.
									 *
									 * Tidak ada target upgrade
									 * lagi.
									 */
									onTargetLevelChange(nextLevel);
								}
							}}
							className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
						>
							{currentLevels.map((level) => (
								<option
									key={level}
									value={level}
									className="bg-zinc-900 text-white"
								>
									Level {level}
								</option>
							))}
						</select>
					</div>

					{/* TARGET LEVEL */}
					<div className="space-y-1.5">
						<label
							htmlFor={`${expert.id}-${skill.id}-target`}
							className="text-xs font-medium text-white/50"
						>
							Target Level
						</label>

						{hasUpgradeAvailable ? (
							<select
								id={`${expert.id}-${skill.id}-target`}
								value={targetLevel}
								onChange={(event) => {
									const nextLevel = clampLevel(
										Number(event.target.value),
										minimumTargetLevel,
										skillCap,
									);

									onTargetLevelChange(nextLevel);
								}}
								className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
							>
								{targetLevels.map((level) => (
									<option
										key={level}
										value={level}
										className="bg-zinc-900 text-white"
									>
										Level {level}
									</option>
								))}
							</select>
						) : (
							<div className="flex h-11 w-full items-center rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white/50">
								Level {currentLevel}{" "}
								<span className="ml-2 text-xs text-white/30">Max</span>
							</div>
						)}
					</div>
				</div>
			)}

			{!isLocked && (
				<div className="mt-3">
					<label
						htmlFor={`${expert.id}-${skill.id}-xp`}
						className="text-xs font-medium text-white/50"
					>
						Current Learning XP
					</label>

					<input
						id={`${expert.id}-${skill.id}-xp`}
						type="number"
						min={0}
						value={state.currentXp}
						onChange={(event) =>
							onXpChange(Math.max(0, Number(event.target.value) || 0))
						}
						className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
					/>
				</div>
			)}

			{!isLocked && !hasUpgradeAvailable && (
				<div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/40">
					Skill is already at the current maximum level unlocked by this
					relationship.
				</div>
			)}
		</div>
	);
}
