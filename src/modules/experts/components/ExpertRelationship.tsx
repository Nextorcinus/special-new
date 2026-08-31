"use client";

import type { ExpertRelationshipState } from "../types";

interface ExpertRelationshipProps {
	relationship: ExpertRelationshipState;

	onCurrentLevelChange: (level: number | null) => void;

	onTargetLevelChange: (level: number | null) => void;

	onCurrentAffinityChange: (value: number) => void;

	onCurrentSigilsChange: (value: number) => void;
}

const LEVELS = Array.from({ length: 101 }, (_, index) => index);

function clampLevel(value: number): number {
	return Math.max(0, Math.min(100, Math.floor(value)));
}

function clampResource(value: number): number {
	if (!Number.isFinite(value)) {
		return 0;
	}

	return Math.max(0, value);
}

export function ExpertRelationship({
	relationship,
	onCurrentLevelChange,
	onTargetLevelChange,
	onCurrentAffinityChange,
	onCurrentSigilsChange,
}: ExpertRelationshipProps) {
	const currentLevel = relationship.currentLevel;

	const targetLevel = relationship.targetLevel;

	const hasCurrentLevel = currentLevel !== null;

	/*
	 * Target hanya boleh dipilih jika Current
	 * sudah dipilih.
	 *
	 * Target harus lebih tinggi dari Current.
	 */
	const targetLevels = hasCurrentLevel
		? LEVELS.filter((level) => level > (currentLevel ?? 0))
		: [];

	return (
		<section className="space-y-3">
			{/* =================================================
			    HEADER
			    ================================================= */}

			<div className="flex items-center justify-between">
				<div>
					<h4 className="text-sm font-semibold text-white">Relationship</h4>

					<p className="mt-0.5 text-xs text-white/40">
						Set current and target relationship level.
					</p>
				</div>

				<div className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/50">
					{currentLevel === null
						? "Not selected"
						: targetLevel === null
							? `${currentLevel} →`
							: `${currentLevel} → ${targetLevel}`}
				</div>
			</div>

			{/* =================================================
			    CURRENT + TARGET
			    ================================================= */}

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{/* CURRENT LEVEL */}

				<div className="space-y-1.5">
					<label
						htmlFor="relationship-current"
						className="text-xs font-medium text-white/50"
					>
						Current Level
					</label>

					<select
						id="relationship-current"
						value={currentLevel === null ? "" : currentLevel}
						onChange={(event) => {
							const value = event.target.value;

							if (value === "") {
								onCurrentLevelChange(null);

								onTargetLevelChange(null);

								return;
							}

							const nextLevel = clampLevel(Number(value));

							onCurrentLevelChange(nextLevel);

							/*
							 * Current berubah.
							 *
							 * Jika target sebelumnya
							 * tidak lebih tinggi dari
							 * current baru, reset target.
							 */
							if (targetLevel !== null && targetLevel <= nextLevel) {
								onTargetLevelChange(null);
							}
						}}
						className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
					>
						<option value="" className="bg-zinc-900 text-white">
							Select Current Level
						</option>

						{LEVELS.map((level) => (
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
						htmlFor="relationship-target"
						className="text-xs font-medium text-white/50"
					>
						Target Level
					</label>

					<select
						id="relationship-target"
						value={targetLevel === null ? "" : targetLevel}
						disabled={!hasCurrentLevel || targetLevels.length === 0}
						onChange={(event) => {
							const value = event.target.value;

							if (value === "") {
								onTargetLevelChange(null);

								return;
							}

							onTargetLevelChange(clampLevel(Number(value)));
						}}
						className={[
							"h-11 w-full rounded-xl border px-3 text-sm outline-none transition",

							!hasCurrentLevel
								? "cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20"
								: "border-white/10 bg-white/5 text-white focus:border-white/20 focus:bg-white/10",
						].join(" ")}
					>
						<option value="" className="bg-zinc-900 text-white">
							{!hasCurrentLevel
								? "Select Current Level First"
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

			{/* =================================================
			    CURRENT RESOURCES
			    ================================================= */}

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{/* CURRENT AFFINITY */}

				<div className="space-y-1.5">
					<label
						htmlFor="current-affinity"
						className="text-xs font-medium text-white/50"
					>
						Current Affinity
					</label>

					<input
						id="current-affinity"
						type="number"
						min={0}
						value={relationship.currentAffinity}
						onChange={(event) =>
							onCurrentAffinityChange(clampResource(Number(event.target.value)))
						}
						className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
					/>
				</div>

				{/* CURRENT SIGILS */}

				<div className="space-y-1.5">
					<label
						htmlFor="current-sigils"
						className="text-xs font-medium text-white/50"
					>
						Current Sigils
					</label>

					<input
						id="current-sigils"
						type="number"
						min={0}
						value={relationship.currentSigils}
						onChange={(event) =>
							onCurrentSigilsChange(clampResource(Number(event.target.value)))
						}
						className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
					/>
				</div>
			</div>
		</section>
	);
}
