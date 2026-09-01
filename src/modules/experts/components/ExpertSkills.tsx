"use client";

import { calculateSkillCap } from "../calculator";
import type {
	Expert,
	ExpertSkillState,
} from "../types";
import { ExpertSkillCard } from "./ExpertSkillCard";

interface ExpertSkillsProps {
	expert: Expert;
	relationshipLevel: number;
	skills: Record<
		string,
		ExpertSkillState
	>;
	onCurrentLevelChange: (
		skillId: string,
		level: number | null,
	) => void;
	onTargetLevelChange: (
		skillId: string,
		level: number | null,
	) => void;
	onXpChange: (
		skillId: string,
		xp: number,
	) => void;
}

function clamp(
	value: number,
	min: number,
	max: number,
): number {
	return Math.max(
		min,
		Math.min(max, value),
	);
}

export function ExpertSkills({
	expert,
	relationshipLevel,
	skills,
	onCurrentLevelChange,
	onTargetLevelChange,
	onXpChange,
}: ExpertSkillsProps) {
	const regularSkills = expert.skills.filter(
		(skill) => !skill.isTalent,
	);

	if (regularSkills.length === 0) {
		return null;
	}

	return (
		<section className="space-y-3">
			<div>
				<h4 className="text-sm font-semibold text-white">
					Skills
				</h4>

				<p className="mt-0.5 text-xs text-white/40">
					Upgrade skills according to relationship requirements.
				</p>
			</div>

			<div className="space-y-3">
				{regularSkills.map((skill) => {
					const rawState =
						skills[skill.id] ?? {
							currentLevel: null,
							targetLevel: null,
							currentXp: 0,
						};

					const maxLevel = clamp(
						calculateSkillCap(
							expert,
							skill,
							relationshipLevel,
						),
						0,
						skill.maxLevel,
					);

					const currentLevel =
						rawState.currentLevel !== null
							? clamp(
									rawState.currentLevel,
									0,
									maxLevel,
								)
							: null;

					const targetLevel =
						rawState.targetLevel !== null
							? clamp(
									rawState.targetLevel,
									currentLevel ?? 0,
									maxLevel,
								)
							: null;

					const normalizedState: ExpertSkillState =
						{
							currentLevel,
							targetLevel,
							currentXp: Math.max(
								0,
								Number(
									rawState.currentXp,
								) || 0,
							),
						};

					return (
						<ExpertSkillCard
							key={skill.id}
							expert={expert}
							skill={skill}
							relationshipLevel={
								relationshipLevel
							}
							state={normalizedState}
							onCurrentLevelChange={(
								level,
							) => {
								if (
									level === null
								) {
									onCurrentLevelChange(
										skill.id,
										null,
									);

									return;
								}

								const nextCurrentLevel =
									clamp(
										level,
										0,
										maxLevel,
									);

								const nextTargetLevel =
									normalizedState.targetLevel !==
									null
										? Math.max(
												nextCurrentLevel,
												normalizedState.targetLevel,
											)
										: null;

								onCurrentLevelChange(
									skill.id,
									nextCurrentLevel,
								);

								if (
									nextTargetLevel !==
										null &&
									nextTargetLevel !==
										normalizedState.targetLevel
								) {
									onTargetLevelChange(
										skill.id,
										Math.min(
											nextTargetLevel,
											maxLevel,
										),
									);
								}
							}}
							onTargetLevelChange={(
								level,
							) => {
								if (
									level === null
								) {
									onTargetLevelChange(
										skill.id,
										null,
									);

									return;
								}

								const minimumLevel =
									normalizedState.currentLevel ??
									0;

								const nextTargetLevel =
									clamp(
										level,
										minimumLevel,
										maxLevel,
									);

								onTargetLevelChange(
									skill.id,
									nextTargetLevel,
								);
							}}
							onXpChange={(xp) =>
								onXpChange(
									skill.id,
									Math.max(
										0,
										xp,
									),
								)
							}
						/>
					);
				})}
			</div>
		</section>
	);
}