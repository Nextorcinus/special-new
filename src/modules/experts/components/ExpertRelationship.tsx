"use client";

import type { ExpertRelationshipState } from "../types";

interface ExpertRelationshipProps {
	relationship: ExpertRelationshipState;
	onCurrentLevelChange: (level: number) => void;
	onTargetLevelChange: (level: number) => void;
	onCurrentAffinityChange: (value: number) => void;
	onCurrentSigilsChange: (value: number) => void;
}

const LEVELS = Array.from(
	{ length: 101 },
	(_, index) => index,
);

function clampLevel(value: number) {
	return Math.max(0, Math.min(100, value));
}

function clampResource(value: number) {
	return Math.max(0, value);
}

export function ExpertRelationship({
	relationship,
	onCurrentLevelChange,
	onTargetLevelChange,
	onCurrentAffinityChange,
	onCurrentSigilsChange,
}: ExpertRelationshipProps) {
	const currentLevel = clampLevel(
		relationship.currentLevel,
	);

	const targetLevel = clampLevel(
		relationship.targetLevel,
	);

	return (
		<section className="space-y-3">
			<div className="flex items-center justify-between">
				<div>
					<h4 className="text-sm font-semibold text-white">
						Relationship
					</h4>

					<p className="mt-0.5 text-xs text-white/40">
						Set current and target relationship
						level.
					</p>
				</div>

				<div className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/50">
					{currentLevel} → {targetLevel}
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
				<div className="space-y-1.5">
					<label
						htmlFor="relationship-current"
						className="text-xs font-medium text-white/50"
					>
						Current Level
					</label>

					<select
						id="relationship-current"
						value={currentLevel}
						onChange={(event) =>
							onCurrentLevelChange(
								Number(event.target.value),
							)
						}
						className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
					>
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

				<div className="space-y-1.5">
					<label
						htmlFor="relationship-target"
						className="text-xs font-medium text-white/50"
					>
						Target Level
					</label>

					<select
						id="relationship-target"
						value={targetLevel}
						onChange={(event) =>
							onTargetLevelChange(
								Number(event.target.value),
							)
						}
						className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
					>
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
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
						value={
							relationship.currentAffinity
						}
						onChange={(event) =>
							onCurrentAffinityChange(
								clampResource(
									Number(
										event.target.value,
									),
								),
							)
						}
						className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
					/>
				</div>

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
						value={
							relationship.currentSigils
						}
						onChange={(event) =>
							onCurrentSigilsChange(
								clampResource(
									Number(
										event.target.value,
									),
								),
							)
						}
						className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-white/20 focus:bg-white/10"
					/>
				</div>
			</div>
		</section>
	);
}