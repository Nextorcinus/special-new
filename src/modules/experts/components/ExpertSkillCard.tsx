"use client";

import {
	calculateSkillCap,
	getSkillRequirement,
} from "../calculator";

import type {
	Expert,
	ExpertSkill,
	ExpertSkillState,
} from "../types";

interface ExpertSkillCardProps {
	expert: Expert;
	skill: ExpertSkill;
	relationshipLevel: number;
	state: ExpertSkillState;
	onCurrentLevelChange: (level: number) => void;
	onTargetLevelChange: (level: number) => void;
	onXpChange: (xp: number) => void;
}

function clampLevel(
	value: number,
	max: number,
) {
	return Math.max(
		0,
		Math.min(max, value),
	);
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
	const skillCap = calculateSkillCap(
		expert,
		skill,
		relationshipLevel,
	);

	const requiredRelationship =
		getSkillRequirement(
			expert,
			skill.id,
		);

	const currentLevel = clampLevel(
		state.currentLevel,
		skill.maxLevel,
	);

	const targetLevel = clampLevel(
		state.targetLevel,
		skillCap,
	);

	const availableLevels = Array.from(
		{
			length: skillCap + 1,
		},
		(_, index) => index,
	);

	const isLocked =
		relationshipLevel <
		requiredRelationship;

	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate text-sm font-medium text-white">
						{skill.name}
					</p>

					<p className="mt-1 text-xs text-white/40">
						Required Relationship Lv.{" "}
						{requiredRelationship}
					</p>
				</div>

				<div className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs text-white/50">
					Max Lv. {skill.maxLevel}
				</div>
			</div>

			{isLocked ? (
				<div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/40">
					Unlocks at Relationship Lv.{" "}
					{requiredRelationship}
				</div>
			) : (
				<div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
								const level =
									Number(
										event.target
											.value,
									);

								onCurrentLevelChange(
									level,
								);

								if (
									state.targetLevel <
									level
								) {
									onTargetLevelChange(
										level,
									);
								}
							}}
							className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
						>
							{Array.from(
								{
									length:
										skill.maxLevel +
										1,
								},
								(_, level) => (
									<option
										key={level}
										value={level}
										className="bg-zinc-900 text-white"
									>
										Level{" "}
										{level}
									</option>
								),
							)}
						</select>
					</div>

					<div className="space-y-1.5">
						<label
							htmlFor={`${expert.id}-${skill.id}-target`}
							className="text-xs font-medium text-white/50"
						>
							Target Level
						</label>

						<select
							id={`${expert.id}-${skill.id}-target`}
							value={targetLevel}
							onChange={(event) =>
								onTargetLevelChange(
									Number(
										event.target
											.value,
									),
								)
							}
							className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
						>
							{availableLevels.map(
								(level) => (
									<option
										key={level}
										value={level}
										className="bg-zinc-900 text-white"
									>
										Level{" "}
										{level}
									</option>
								),
							)}
						</select>
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
							onXpChange(
								Math.max(
									0,
									Number(
										event.target
											.value,
									),
								),
							)
						}
						className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
					/>
				</div>
			)}
		</div>
	);
}