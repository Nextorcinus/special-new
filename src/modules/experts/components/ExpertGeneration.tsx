"use client";

import { useState } from "react";

import { ExpertCard } from "./ExpertCard";

import type {
	Expert,
	ExpertRelationshipState,
	ExpertSkillState,
} from "../types";

interface ExpertGenerationProps {
	generation: number;
	experts: Expert[];
	relationships: Record<
		string,
		ExpertRelationshipState
	>;
	skills: Record<
		string,
		Record<string, ExpertSkillState>
	>;
	onCurrentRelationshipChange: (
		expertId: string,
		level: number,
	) => void;
	onTargetRelationshipChange: (
		expertId: string,
		level: number,
	) => void;
	onCurrentAffinityChange: (
		expertId: string,
		value: number,
	) => void;
	onCurrentSigilsChange: (
		expertId: string,
		value: number,
	) => void;
	onCurrentSkillLevelChange: (
		expertId: string,
		skillId: string,
		level: number,
	) => void;
	onTargetSkillLevelChange: (
		expertId: string,
		skillId: string,
		level: number,
	) => void;
	onSkillXpChange: (
		expertId: string,
		skillId: string,
		xp: number,
	) => void;
	defaultOpen?: boolean;
}

const GENERATION_STYLES: Record<
	number,
	{
		color: string;
		border: string;
		background: string;
	}
> = {
	1: {
		color: "#60a5fa",
		border: "rgba(96, 165, 250, 0.25)",
		background: "rgba(96, 165, 250, 0.04)",
	},
	2: {
		color: "#c084fc",
		border: "rgba(192, 132, 252, 0.25)",
		background: "rgba(192, 132, 252, 0.04)",
	},
	3: {
		color: "#f59e0b",
		border: "rgba(245, 158, 11, 0.25)",
		background: "rgba(245, 158, 11, 0.04)",
	},
};

const DEFAULT_STYLE = {
	color: "#60a5fa",
	border: "rgba(96, 165, 250, 0.25)",
	background: "rgba(96, 165, 250, 0.04)",
};

const UNLOCK_DAYS: Record<number, number> = {
	1: 150,
	2: 195,
	3: 240,
};

export function ExpertGeneration({
	generation,
	experts,
	relationships,
	skills,
	onCurrentRelationshipChange,
	onTargetRelationshipChange,
	onCurrentAffinityChange,
	onCurrentSigilsChange,
	onCurrentSkillLevelChange,
	onTargetSkillLevelChange,
	onSkillXpChange,
	defaultOpen = false,
}: ExpertGenerationProps) {
	const [openExpertId, setOpenExpertId] =
		useState<string | null>(
			defaultOpen && experts.length > 0
				? experts[0].id
				: null,
		);

	const style =
		GENERATION_STYLES[generation] ??
		DEFAULT_STYLE;

	const unlockDay =
		UNLOCK_DAYS[generation] ?? 150;

	const toggleExpert = (
		expertId: string,
	) => {
		setOpenExpertId((current) =>
			current === expertId
				? null
				: expertId,
		);
	};

	if (experts.length === 0) {
		return null;
	}

	return (
		<section
			className="w-full rounded-2xl border p-4 sm:p-5"
			style={{
				borderColor: style.border,
				background: style.background,
			}}
		>
			<div className="mb-4 flex items-center justify-between gap-3">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-2">
						<h2
							className="text-base font-bold"
							style={{
								color: style.color,
							}}
						>
							Generation {generation} Experts
						</h2>

						<span className="text-xs text-white/40">
							(Unlocks ~Day {unlockDay})
						</span>
					</div>
				</div>

				<span
					className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
					style={{
						color: style.color,
						backgroundColor: `${style.color}15`,
					}}
				>
					{experts.length}{" "}
					{experts.length === 1
						? "Expert"
						: "Experts"}
				</span>
			</div>

			<div className="space-y-2.5">
				{experts.map((expert) => {
					const relationship =
						relationships[expert.id] ?? {
							currentLevel: 0,
							targetLevel: 0,
							currentAffinity: 0,
							currentSigils: 0,
						};

					const expertSkills =
						skills[expert.id] ?? {};

					const isOpen =
						openExpertId === expert.id;

					const currentRelationship =
						relationship.currentLevel ?? 0;

					const targetRelationship =
						Math.max(
							relationship.targetLevel ??
								0,
							currentRelationship,
						);

					return (
						<div
							key={expert.id}
							className="overflow-hidden rounded-2xl border border-white/10"
						>
							<button
								type="button"
								onClick={() =>
									toggleExpert(
										expert.id,
									)
								}
								aria-expanded={isOpen}
								aria-controls={`expert-panel-${expert.id}`}
								className="flex w-full items-center gap-3 border-0 bg-white/[0.03] px-3 py-3 text-left transition-colors hover:bg-white/5"
							>
								<div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white/10">
									<img
										src={`/experts/${expert.id}.png`}
										alt={expert.name}
										className="h-full w-full object-cover"
										loading="lazy"
									/>
								</div>

								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<span className="truncate text-sm font-semibold text-white">
											{expert.name}
										</span>

										<span
											className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
											style={{
												color:
													style.color,
												backgroundColor:
													`${style.color}15`,
											}}
										>
											Gen{" "}
											{
												expert.generation
											}
										</span>
									</div>

									<div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-white/40">
										{expert.focus && (
											<span className="truncate">
												{
													expert.focus
												}
											</span>
										)}

										<span className="shrink-0">
											Rel.{" "}
											{
												currentRelationship
											}{" "}
											→{" "}
											{
												targetRelationship
											}
										</span>
									</div>
								</div>

								<div
									className={[
										"flex h-8 w-8 shrink-0",
										"items-center justify-center",
										"rounded-lg bg-white/5",
										"text-white/50",
										"transition-transform duration-200",
										isOpen
											? "rotate-180"
											: "rotate-0",
									].join(" ")}
									aria-hidden="true"
								>
									<svg
										width="15"
										height="15"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="m6 9 6 6 6-6" />
									</svg>
								</div>
							</button>

							{isOpen && (
								<div
									id={`expert-panel-${expert.id}`}
									className="border-t border-white/10"
								>
									<ExpertCard
										expert={expert}
										relationship={{
											...relationship,
											currentLevel:
												currentRelationship,
											targetLevel:
												targetRelationship,
										}}
										skills={expertSkills}
										onCurrentRelationshipChange={(
											level,
										) =>
											onCurrentRelationshipChange(
												expert.id,
												level,
											)
										}
										onTargetRelationshipChange={(
											level,
										) =>
											onTargetRelationshipChange(
												expert.id,
												level,
											)
										}
										onCurrentAffinityChange={(
											value,
										) =>
											onCurrentAffinityChange(
												expert.id,
												value,
											)
										}
										onCurrentSigilsChange={(
											value,
										) =>
											onCurrentSigilsChange(
												expert.id,
												value,
											)
										}
										onCurrentSkillLevelChange={(
											skillId,
											level,
										) =>
											onCurrentSkillLevelChange(
												expert.id,
												skillId,
												level,
											)
										}
										onTargetSkillLevelChange={(
											skillId,
											level,
										) =>
											onTargetSkillLevelChange(
												expert.id,
												skillId,
												level,
											)
										}
										onSkillXpChange={(
											skillId,
											xp,
										) =>
											onSkillXpChange(
												expert.id,
												skillId,
												xp,
											)
										}
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</section>
	);
}