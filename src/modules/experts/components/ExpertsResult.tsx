"use client";

import { formatCompactNumber } from "@/lib/number";

import type {
	ExpertResult,
	ExpertsCalculationResult,
	ExpertsResourceResult,
} from "../types";

interface ExpertsResultProps {
	result: ExpertsCalculationResult;
}

function formatMinutes(minutes: number) {
	if (minutes <= 0) {
		return "0m";
	}

	const totalMinutes = Math.round(minutes);
	const hours = Math.floor(totalMinutes / 60);
	const remainingMinutes = totalMinutes % 60;

	if (hours === 0) {
		return `${remainingMinutes}m`;
	}

	if (remainingMinutes === 0) {
		return `${hours}h`;
	}

	return `${hours}h ${remainingMinutes}m`;
}

function ResourceCard({
	label,
	resource,
}: {
	label: string;
	resource: ExpertsResourceResult;
}) {
	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
			<p className="text-xs font-medium uppercase tracking-wide text-white/40">
				{label}
			</p>

			<div className="mt-3 grid grid-cols-3 gap-3">
				<div>
					<p className="text-xs text-white/40">
						Have
					</p>

					<p className="mt-1 text-sm font-semibold text-white">
						{formatCompactNumber(
							resource.have,
						)}
					</p>
				</div>

				<div>
					<p className="text-xs text-white/40">
						Need
					</p>

					<p className="mt-1 text-sm font-semibold text-white">
						{formatCompactNumber(
							resource.need,
						)}
					</p>
				</div>

				<div>
					<p className="text-xs text-white/40">
						Short
					</p>

					<p className="mt-1 text-sm font-semibold text-white">
						{formatCompactNumber(
							resource.short,
						)}
					</p>
				</div>
			</div>
		</div>
	);
}

function ExpertResultCard({
	expert,
}: {
	expert: ExpertResult;
}) {
	return (
		<div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h3 className="text-sm font-semibold text-white">
						{expert.name}
					</h3>

					<p className="mt-1 text-xs text-white/40">
						Generation{" "}
						{expert.generation} ·{" "}
						{expert.focus}
					</p>
				</div>

				<div className="rounded-lg bg-white/5 px-3 py-2">
					<p className="text-[10px] uppercase tracking-wide text-white/40">
						Relationship
					</p>

					<p className="mt-1 text-sm font-semibold text-white">
						{
							expert.relationship
								.currentLevel
						}{" "}
						→{" "}
						{
							expert.relationship
								.targetLevel
						}
					</p>
				</div>
			</div>

			<div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
				<div className="rounded-lg bg-white/[0.02] p-3">
					<p className="text-xs text-white/40">
						Affinity
					</p>

					<p className="mt-1 text-sm font-semibold text-white">
						{formatCompactNumber(
							expert.relationship
								.affinity,
						)}
					</p>
				</div>

				<div className="rounded-lg bg-white/[0.02] p-3">
					<p className="text-xs text-white/40">
						Sigils
					</p>

					<p className="mt-1 text-sm font-semibold text-white">
						{formatCompactNumber(
							expert.relationship
								.sigils,
						)}
					</p>
				</div>

				<div className="rounded-lg bg-white/[0.02] p-3">
					<p className="text-xs text-white/40">
						Books
					</p>

					<p className="mt-1 text-sm font-semibold text-white">
						{formatCompactNumber(
							expert.totalBooks,
						)}
					</p>
				</div>

				<div className="rounded-lg bg-white/[0.02] p-3">
					<p className="text-xs text-white/40">
						Learning
					</p>

					<p className="mt-1 text-sm font-semibold text-white">
						{formatMinutes(
							expert.totalLearningMinutes,
						)}
					</p>
				</div>
			</div>

			{expert.skills.length > 0 && (
				<div className="mt-4 border-t border-white/10 pt-4">
					<p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
						Skills
					</p>

					<div className="space-y-2">
						{expert.skills.map(
							(skill) => (
								<div
									key={
										skill.skillId
									}
									className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.02] px-3 py-2"
								>
									<div className="min-w-0">
										<p className="truncate text-xs font-medium text-white">
											{
												skill.skillId
											}
										</p>

										<p className="mt-0.5 text-xs text-white/40">
											Lv.{" "}
											{
												skill.currentLevel
											}{" "}
											→{" "}
											{
												skill.targetLevel
											}{" "}
											/{" "}
											{
												skill.maxLevel
											}
										</p>
									</div>

									<div className="shrink-0 text-right">
										<p className="text-xs font-medium text-white">
											{
												skill.books
											}{" "}
											Books
										</p>

										<p className="mt-0.5 text-xs text-white/40">
											{formatMinutes(
												skill.learningMinutes,
											)}
										</p>
									</div>
								</div>
							),
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export function ExpertsResult({
	result,
}: ExpertsResultProps) {
	const hasResult =
		result.totalAffinity > 0 ||
		result.totalSigils > 0 ||
		result.totalBooks > 0 ||
		result.totalLearningMinutes > 0;

	if (!hasResult) {
		return (
			<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
				<h2 className="text-base font-semibold text-white">
					Calculation Result
				</h2>

				<p className="mt-1 text-sm text-white/40">
					Set a target level to see the
					required resources.
				</p>
			</section>
		);
	}

	return (
		<section className="space-y-4">
			<div>
				<h2 className="text-base font-semibold text-white">
					Calculation Result
				</h2>

				<p className="mt-1 text-sm text-white/40">
					Required resources compared with
					your current inventory.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
				<ResourceCard
					label="Affinity"
					resource={result.affinity}
				/>

				<ResourceCard
					label="General Sigils"
					resource={
						result.generalSigils
					}
				/>

				<ResourceCard
					label="Books of Knowledge"
					resource={
						result.booksOfKnowledge
					}
				/>

				<ResourceCard
					label="Learning Speedup"
					resource={
						result.learningSpeedup
					}
				/>
			</div>

			{result.experts.length > 0 && (
				<div className="space-y-3">
					<div>
						<h3 className="text-sm font-semibold text-white">
							Expert Breakdown
						</h3>

						<p className="mt-1 text-xs text-white/40">
							Resources required for each
							selected Expert.
						</p>
					</div>

					<div className="space-y-3">
						{result.experts.map(
							(expert) => (
								<ExpertResultCard
									key={
										expert.expertId
									}
									expert={
										expert
									}
								/>
							),
						)}
					</div>
				</div>
			)}
		</section>
	);
}