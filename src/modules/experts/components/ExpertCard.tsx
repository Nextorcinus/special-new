"use client";

import type {
	Expert,
	ExpertRelationshipState,
	ExpertSkillState,
} from "../types";
import { ExpertRelationship } from "./ExpertRelationship";
import { ExpertSkills } from "./ExpertSkills";
import { ExpertTalent } from "./ExpertTalent";

interface ExpertCardProps {
	expert: Expert;
	relationship: ExpertRelationshipState;
	skills: Record<string, ExpertSkillState>;
	onCurrentRelationshipChange: (level: number | null) => void;
	onTargetRelationshipChange: (level: number | null) => void;
	onCurrentAffinityChange: (value: number) => void;
	onCurrentSigilsChange: (value: number) => void;
	onCurrentSkillLevelChange: (skillId: string, level: number | null) => void;
	onTargetSkillLevelChange: (skillId: string, level: number | null) => void;
	onSkillXpChange: (skillId: string, xp: number) => void;
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
	const imagePath = expert.image ?? `/experts/${expert.id}.png`;

	const relationshipLevel =
		relationship.targetLevel ?? relationship.currentLevel ?? 0;

	return (
		<article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
			<div className="flex items-center gap-4 border-b border-white/10 p-4 sm:p-5">
				<div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:h-20 sm:w-20">
					<img
						src={imagePath}
						alt={expert.name}
						className="h-full w-full object-cover"
					/>
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="text-base font-semibold text-white sm:text-lg">
							{expert.name}
						</h2>

						<span className="rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/60">
							Gen {expert.generation}
						</span>
					</div>

					<p className="mt-1 text-sm text-white/50">{expert.focus}</p>
				</div>
			</div>

			<div className="space-y-6 p-4 sm:p-5">
				<ExpertRelationship
					relationship={relationship}
					onCurrentLevelChange={onCurrentRelationshipChange}
					onTargetLevelChange={onTargetRelationshipChange}
					onCurrentAffinityChange={onCurrentAffinityChange}
					onCurrentSigilsChange={onCurrentSigilsChange}
				/>

				<ExpertTalent expert={expert} relationshipLevel={relationshipLevel} />

				<ExpertSkills
					expert={expert}
					relationshipLevel={relationshipLevel}
					skills={skills}
					onCurrentLevelChange={onCurrentSkillLevelChange}
					onTargetLevelChange={onTargetSkillLevelChange}
					onXpChange={onSkillXpChange}
				/>
			</div>
		</article>
	);
}
