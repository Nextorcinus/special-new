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

	onCurrentLevelChange: (
		level: number | null,
	) => void;

	onTargetLevelChange: (
		level: number | null,
	) => void;

	onXpChange: (xp: number) => void;
}

function clampLevel(
	value: number,
	max: number,
): number {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.max(
		0,
		Math.min(max, Math.floor(value)),
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
	/* =====================================================
	 * SKILL CAP
	 * ===================================================== */

	const skillCap = Math.max(
		0,
		Math.min(
			skill.maxLevel,
			calculateSkillCap(
				expert,
				skill,
				relationshipLevel,
			),
		),
	);

	const requiredRelationship =
		getSkillRequirement(
			expert,
			skill.id,
		);

	const isLocked =
		relationshipLevel <
		requiredRelationship;

	/* =====================================================
	 * CURRENT LEVEL
	 *
	 * null means not selected yet.
	 * ===================================================== */

	const currentLevel =
		state.currentLevel !== null
			? clampLevel(
					state.currentLevel,
					skill.maxLevel,
				)
			: null;

	/* =====================================================
	 * TARGET LEVEL
	 *
	 * null means not selected yet.
	 *
	 * Target MUST be greater than Current.
	 * ===================================================== */

	let targetLevel: number | null =
		null;

	if (
		state.targetLevel !== null
	) {
		targetLevel = clampLevel(
			state.targetLevel,
			skillCap,
		);

		/*
		 * Never allow target <= current.
		 */
		if (
			currentLevel !== null &&
			targetLevel <= currentLevel
		) {
			targetLevel = null;
		}
	}

	/* =====================================================
	 * CURRENT LEVEL OPTIONS
	 * ===================================================== */

	const currentLevels = Array.from(
		{
			length:
				skill.maxLevel + 1,
		},
		(_, level) => level,
	);

	/* =====================================================
	 * TARGET LEVEL OPTIONS
	 *
	 * Only levels ABOVE Selected
	 * ===================================================== */

	const targetLevels =
		currentLevel !== null
			? Array.from(
					{
						length:
							Math.max(
								0,
								skillCap -
									currentLevel,
							),
					},
					(_, index) =>
						currentLevel +
						index +
						1,
				)
			: [];

	const hasCurrentLevel =
		currentLevel !== null;

	const hasTargetOptions =
		targetLevels.length > 0;

	const targetDisabled =
		!hasCurrentLevel ||
		!hasTargetOptions;

	/* =====================================================
	 * CURRENT LEVEL CHANGE
	 * ===================================================== */

	const handleCurrentLevelChange = (
		value: string,
	) => {
		if (value === "") {
			onCurrentLevelChange(null);
			onTargetLevelChange(null);

			return;
		}

		const nextLevel = clampLevel(
			Number(value),
			skill.maxLevel,
		);

		onCurrentLevelChange(
			nextLevel,
		);

		/*
		 * Existing target is only valid if
		 * it remains higher than the new current.
		 */
		if (
			state.targetLevel !== null &&
			state.targetLevel <= nextLevel
		) {
			onTargetLevelChange(
				null,
			);
		}
	};

	/* =====================================================
	 * TARGET LEVEL CHANGE
	 * ===================================================== */

	const handleTargetLevelChange = (
		value: string,
	) => {
		if (value === "") {
			onTargetLevelChange(null);

			return;
		}

		if (currentLevel === null) {
			onTargetLevelChange(null);

			return;
		}

		const nextLevel = clampLevel(
			Number(value),
			skillCap,
		);

		/*
		 * Target must be greater than Current.
		 */
		if (
			nextLevel <= currentLevel
		) {
			onTargetLevelChange(null);

			return;
		}

		onTargetLevelChange(
			nextLevel,
		);
	};

	/* =====================================================
	 * LOCKED STATE
	 * ===================================================== */

	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
			{/* =================================================
			    HEADER
			    ================================================= */}

			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate text-sm font-medium text-white">
						{skill.name}
					</p>

					<p className="mt-1 text-xs text-white/40">
						Required Relationship
						Lv.{" "}
						{requiredRelationship}
					</p>
				</div>

				<div className="shrink-0 rounded-lg bg-white/5 px-2 py-1 text-xs text-white/50">
					Max Lv.{" "}
					{skill.maxLevel}
				</div>
			</div>

			{/* =================================================
			    LOCKED
			    ================================================= */}

			{isLocked ? (
				<div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/40">
					Unlocks at Relationship
					Lv.{" "}
					{requiredRelationship}
				</div>
			) : (
				<>
					{/* =========================================
					    LEVEL SELECTORS
					    ========================================= */}

					<div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
						{/* =====================================
						    CURRENT LEVEL
						    ===================================== */}

						<div className="space-y-1.5">
							<label
								htmlFor={`${expert.id}-${skill.id}-current`}
								className="text-xs font-medium text-white/50"
							>
								Current Level
							</label>

							<select
								id={`${expert.id}-${skill.id}-current`}
								value={
									currentLevel ===
									null
										? ""
										: currentLevel
								}
								onChange={(
									event,
								) =>
									handleCurrentLevelChange(
										event
											.target
											.value,
									)
								}
								className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
							>
								<option
									value=""
									className="bg-zinc-900 text-white"
								>
									Select
									Current
									Level
								</option>

								{currentLevels.map(
									(
										level,
									) => (
										<option
											key={
												level
											}
											value={
												level
											}
											className="bg-zinc-900 text-white"
										>
											Level{" "}
											{
												level
											}
										</option>
									),
								)}
							</select>
						</div>

						{/* =====================================
						    TARGET LEVEL
						    ===================================== */}

						<div className="space-y-1.5">
							<label
								htmlFor={`${expert.id}-${skill.id}-target`}
								className="text-xs font-medium text-white/50"
							>
								Target Level
							</label>

							<select
								id={`${expert.id}-${skill.id}-target`}
								value={
									targetLevel ===
									null
										? ""
										: targetLevel
								}
								disabled={
									targetDisabled
								}
								onChange={(
									event,
								) =>
									handleTargetLevelChange(
										event
											.target
											.value,
									)
								}
								className={[
									"h-11 w-full rounded-xl border px-3 text-sm outline-none transition",

									targetDisabled
										? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20"
										: "border-white/10 bg-white/5 text-white focus:border-white/20 focus:bg-white/10",
								].join(
									" ",
								)}
							>
								<option
									value=""
									className="bg-zinc-900 text-white"
								>
									{!hasCurrentLevel
										? "Select Current Level First"
										: !hasTargetOptions
											? "No Higher Level Available"
											: "Select Target Level"}
								</option>

								{targetLevels.map(
									(
										level,
									) => (
										<option
											key={
												level
											}
											value={
												level
											}
											className="bg-zinc-900 text-white"
										>
											Level{" "}
											{
												level
											}
										</option>
									),
								)}
							</select>
						</div>
					</div>

					{/* =========================================
					    CURRENT LEARNING XP
					    ========================================= */}

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
							value={
								state.currentXp
							}
							disabled={
								!hasCurrentLevel
							}
							onChange={(
								event,
							) => {
								const value =
									Number(
										event
											.target
											.value,
									);

								onXpChange(
									Number.isFinite(
										value,
									)
										? Math.max(
												0,
												value,
											)
										: 0,
								);
							}}
							className={[
								"h-11 w-full rounded-xl border px-3 text-sm outline-none transition",

								!hasCurrentLevel
									? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20"
									: "border-white/10 bg-white/5 text-white focus:border-white/20 focus:bg-white/10",
							].join(
								" ",
							)}
						/>
					</div>
				</>
			)}
		</div>
	);
}