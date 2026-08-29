"use client";

import type { Expert } from "../types";

interface ExpertTalentProps {
	expert: Expert;
	relationshipLevel: number;
}

export function ExpertTalent({
	expert,
	relationshipLevel,
}: ExpertTalentProps) {
	const talent = expert.skills.find(
		(skill) => skill.isTalent,
	);

	if (!talent) {
		return null;
	}

	const relationshipTier =
		Math.floor(relationshipLevel / 10) * 10;

	const talentLevel = Math.min(
		talent.maxLevel,
		Math.max(
			0,
			Math.floor(
				relationshipTier / 10,
			),
		),
	);

	return (
		<section className="space-y-3">
			<div className="flex items-center justify-between">
				<div>
					<h4 className="text-sm font-semibold text-white">
						Talent
					</h4>

					<p className="mt-0.5 text-xs text-white/40">
						Automatically upgraded with
						relationship.
					</p>
				</div>

				<span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/50">
					Auto
				</span>
			</div>

			<div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-3">
				<div className="flex min-w-0 items-center gap-3">
					<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm">
						★
					</div>

					<div className="min-w-0">
						<p className="truncate text-sm font-medium text-white">
							{talent.name}
						</p>

						<p className="mt-0.5 text-xs text-white/40">
							{expert.name}
						</p>
					</div>
				</div>

				<div className="shrink-0 text-right">
					<p className="text-sm font-semibold text-white">
						Lv. {talentLevel}
					</p>

					<p className="text-xs text-white/40">
						Max Lv. {talent.maxLevel}
					</p>
				</div>
			</div>
		</section>
	);
}