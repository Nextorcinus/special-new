"use client";

import { ExpertRelationship } from "./ExpertRelationship";
import { ExpertSkills } from "./ExpertSkills";
import { ExpertTalent } from "./ExpertTalent";

import type {
	Expert,
	ExpertRelationshipState,
	ExpertSkillState,
} from "../types";

interface ExpertCardProps {
	expert: Expert;
	relationship: ExpertRelationshipState;
	skills: Record<string, ExpertSkillState>;
	onCurrentRelationshipChange: (
		level: number,
	) => void;
	onTargetRelationshipChange: (
		level: number,
	) => void;
	onCurrentAffinityChange: (
		value: number,
	) => void;
	onCurrentSigilsChange: (
		value: number,
	) => void;
	onCurrentSkillLevelChange: (
		skillId: string,
		level: number,
	) => void;
	onTargetSkillLevelChange: (
		skillId: string,
		level: number,
	) => void;
	onSkillXpChange: (
		skillId: string,
		xp: number,
	) => void;
}

export function ExpertCard({
	expert,
	relationship,
	skills,
	onCurrentRelationshipChange,
	onTargetRelationshipChange,
	onCurrentAffinityChange,
	onCurrentSigilsChange,
	onCurrentSkillLevelChange,
	onTargetSkillLevelChange,
	onSkillXpChange,
}: ExpertCardProps) {
	const imagePath = `/experts/${expert.id}.png`;

	return (
		<article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
			<div className="flex items-center gap-4 border-b border-white/10 p-4">
				<img
					src={imagePath}
					alt={expert.name}
					className="h-16 w-16 shrink-0 rounded-xl object-cover"
				/>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<h3 className="text-base font-semibold text-white">
							{expert.name}
						</h3>

						<span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/60">
							Gen {expert.generation}
						</span>
					</div>

					<p className="mt-1 text-sm text-white/50">
						{expert.focus}
					</p>
				</div>
			</div>

			<div className="space-y-5 p-4">
				<ExpertRelationship
					relationship={relationship}
					onCurrentLevelChange={
						onCurrentRelationshipChange
					}
					onTargetLevelChange={
						onTargetRelationshipChange
					}
					onCurrentAffinityChange={
						onCurrentAffinityChange
					}
					onCurrentSigilsChange={
						onCurrentSigilsChange
					}
				/>

				<ExpertTalent
					expert={expert}
					relationshipLevel={
						relationship.targetLevel
					}
				/>

				<ExpertSkills
					expert={expert}
					relationshipLevel={
						relationship.targetLevel
					}
					skills={skills}
					onCurrentLevelChange={
						onCurrentSkillLevelChange
					}
					onTargetLevelChange={
						onTargetSkillLevelChange
					}
					onXpChange={onSkillXpChange}
				/>
			</div>
		</article>
	);
}