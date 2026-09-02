"use client";

import { calculateSkillCap, getSkillRequirement } from "../calculator";

import type { Expert, ExpertSkill, ExpertSkillState } from "../types";

interface ExpertSkillCardProps {
	expert: Expert;
	skill: ExpertSkill;
	relationshipLevel: number;
	state: ExpertSkillState;
	onCurrentLevelChange: (level: number | null) => void;
	onTargetLevelChange: (level: number | null) => void;
	onXpChange: (xp: number) => void;
}

function clampLevel(value: number, max: number): number {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, Math.min(max, Math.floor(value)));
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
	const skillCap = Math.max(
		0,
		Math.min(
			skill.maxLevel,
			calculateSkillCap(expert, skill, relationshipLevel),
		),
	);

	const requiredRelationship = getSkillRequirement(expert, skill.id);

	const isLocked = relationshipLevel < requiredRelationship;

	const currentLevel =
		state.currentLevel !== null
			? clampLevel(state.currentLevel, skill.maxLevel)
			: null;

	let targetLevel: number | null = null;

	if (state.targetLevel !== null) {
		const normalizedTarget = clampLevel(state.targetLevel, skillCap);

		if (currentLevel !== null && normalizedTarget > currentLevel) {
			targetLevel = normalizedTarget;
		}
	}

	const currentLevels = Array.from(
		{
			length: skill.maxLevel + 1,
		},
		(_, level) => level,
	);

	const targetLevels =
		currentLevel !== null
			? Array.from(
					{
						length: Math.max(0, skillCap - currentLevel),
					},
					(_, index) => currentLevel + index + 1,
				)
			: [];

	const hasCurrentLevel = currentLevel !== null;

	const hasTargetOptions = targetLevels.length > 0;

	const targetDisabled = !hasCurrentLevel || !hasTargetOptions;

	function handleCurrentLevelChange(value: string) {
		if (value === "") {
			onCurrentLevelChange(null);
			onTargetLevelChange(null);
			onXpChange(0);

			return;
		}

		const nextLevel = clampLevel(Number(value), skill.maxLevel);

		onCurrentLevelChange(nextLevel);

		if (state.targetLevel !== null && state.targetLevel <= nextLevel) {
			onTargetLevelChange(null);
		}
	}

	function handleTargetLevelChange(value: string) {
		if (value === "") {
			onTargetLevelChange(null);

			return;
		}

		if (currentLevel === null) {
			onTargetLevelChange(null);

			return;
		}

		const nextLevel = clampLevel(Number(value), skillCap);

		if (nextLevel <= currentLevel) {
			onTargetLevelChange(null);

			return;
		}

		onTargetLevelChange(nextLevel);
	}

	function handleXpChange(value: string) {
		const xp = Number(value);

		onXpChange(Number.isFinite(xp) ? Math.max(0, xp) : 0);
	}

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
				<>
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
								value={currentLevel === null ? "" : currentLevel}
								onChange={(event) =>
									handleCurrentLevelChange(event.target.value)
								}
								className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
							>
								<option value="" className="bg-zinc-900 text-white">
									Select Current Level
								</option>

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

						<div className="space-y-1.5">
							<label
								htmlFor={`${expert.id}-${skill.id}-target`}
								className="text-xs font-medium text-white/50"
							>
								Target Level
							</label>

							<select
								id={`${expert.id}-${skill.id}-target`}
								value={targetLevel === null ? "" : targetLevel}
								disabled={targetDisabled}
								onChange={(event) =>
									handleTargetLevelChange(event.target.value)
								}
								className={[
									"h-11 w-full rounded-xl border px-3 text-sm outline-none transition",
									targetDisabled
										? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20"
										: "border-white/10 bg-white/5 text-white focus:border-white/20 focus:bg-white/10",
								].join(" ")}
							>
								<option value="" className="bg-zinc-900 text-white">
									{!hasCurrentLevel
										? "Select Current Level First"
										: !hasTargetOptions
											? "No Higher Level Available"
											: "Select Target Level"}
								</option>

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
						</div>
					</div>

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
							disabled={!hasCurrentLevel}
							onChange={(event) => handleXpChange(event.target.value)}
							className={[
								"h-11 w-full rounded-xl border px-3 text-sm outline-none transition",
								!hasCurrentLevel
									? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20"
									: "border-white/10 bg-white/5 text-white focus:border-white/20 focus:bg-white/10",
							].join(" ")}
						/>
					</div>
				</>
			)}
		</div>
	);
}
