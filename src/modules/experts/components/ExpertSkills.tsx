"use client";

import type { Expert, ExpertSkillState } from "../types";
import { ExpertSkillCard } from "./ExpertSkillCard";

interface ExpertSkillsProps {
	expert: Expert;
	relationshipLevel: number;
	skills: Record<string, ExpertSkillState>;
	onCurrentLevelChange: (skillId: string, level: number | null) => void;
	onTargetLevelChange: (skillId: string, level: number | null) => void;
	onXpChange: (skillId: string, xp: number) => void;
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
					const state = skills[skill.id] ?? {
						currentLevel: null,
						targetLevel: null,
						currentXp: 0,
					};

					return (
						<ExpertSkillCard
							key={skill.id}
							expert={expert}
							skill={skill}
							relationshipLevel={relationshipLevel}
							state={state}
							onCurrentLevelChange={(level) =>
								onCurrentLevelChange(skill.id, level)
							}
							onTargetLevelChange={(level) =>
								onTargetLevelChange(skill.id, level)
							}
							onXpChange={(xp) => onXpChange(skill.id, xp)}
						/>
					);
				})}
			</div>
		</section>
	);
}
