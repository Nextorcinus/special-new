"use client";

import { calculateSkillCap } from "../calculator";
import type { Expert, ExpertSkillState } from "../types";
import { ExpertSkillCard } from "./ExpertSkillCard";

interface ExpertSkillsProps {
	expert: Expert;
	relationshipLevel: number;
	skills: Record<string, ExpertSkillState>;
	onCurrentLevelChange: (skillId: string, level: number) => void;
	onTargetLevelChange: (skillId: string, level: number) => void;
	onXpChange: (skillId: string, xp: number) => void;
}

function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

export function ExpertSkills({
	expert,
	relationshipLevel,
	skills,
	onCurrentLevelChange,
	onTargetLevelChange,
	onXpChange,
}: ExpertSkillsProps) {
	const regularSkills = expert.skills.filter((skill) => !skill.isTalent);

	if (regularSkills.length === 0) {
		return null;
	}

	return (
		<section className="space-y-3">
			<div>
				<h4 className="text-sm font-semibold text-white">Skills</h4>

				<p className="mt-0.5 text-xs text-white/40">
					Upgrade skills according to relationship requirements.
				</p>
			</div>

			<div className="space-y-3">
				{regularSkills.map((skill) => {
					const rawState = skills[skill.id] ?? {
						currentLevel: 0,
						targetLevel: 0,
						currentXp: 0,
					};

					/*
					 * Relationship menentukan batas maksimal
					 * skill yang boleh digunakan.
					 */
					const maxLevel = clamp(
						calculateSkillCap(expert, skill, relationshipLevel),
						0,
						skill.maxLevel,
					);

					/*
					 * Current level tidak boleh melebihi
					 * max level yang dibuka oleh relationship.
					 */
					const currentLevel = clamp(
						Number(rawState.currentLevel) || 0,
						0,
						maxLevel,
					);

					/*
					 * Target level tidak boleh:
					 *
					 * 1. lebih kecil dari Current Level
					 * 2. lebih besar dari Max Level
					 */
					const targetLevel = clamp(
						Number(rawState.targetLevel) || 0,
						currentLevel,
						maxLevel,
					);

					const normalizedState: ExpertSkillState = {
						currentLevel,
						targetLevel,
						currentXp: Math.max(0, Number(rawState.currentXp) || 0),
					};

					return (
						<ExpertSkillCard
							key={skill.id}
							expert={expert}
							skill={skill}
							relationshipLevel={relationshipLevel}
							state={normalizedState}
							onCurrentLevelChange={(level) => {
								const nextCurrentLevel = clamp(level, 0, maxLevel);

								/*
								 * Jika Current Level naik
								 * melewati Target Level,
								 * Target otomatis ikut naik.
								 */
								const nextTargetLevel = Math.max(
									nextCurrentLevel,
									normalizedState.targetLevel,
								);

								onCurrentLevelChange(skill.id, nextCurrentLevel);

								if (nextTargetLevel !== normalizedState.targetLevel) {
									onTargetLevelChange(
										skill.id,
										Math.min(nextTargetLevel, maxLevel),
									);
								}
							}}
							onTargetLevelChange={(level) => {
								/*
								 * Target tidak boleh lebih rendah
								 * dari Current Level.
								 */
								const nextTargetLevel = clamp(
									level,
									normalizedState.currentLevel,
									maxLevel,
								);

								onTargetLevelChange(skill.id, nextTargetLevel);
							}}
							onXpChange={(xp) => onXpChange(skill.id, Math.max(0, xp))}
						/>
					);
				})}
			</div>
		</section>
	);
}
