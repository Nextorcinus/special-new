"use client";

import { formatPoints } from "../utils/calculatePoints";

export type StageSummaryItem = {
	id: string;
	day: number;
	name: string;
	totalPoints: number;
	finalPoints: number;
};

type AllStagesSummaryProps = {
	stages: StageSummaryItem[];
	totalPoints: number;
	finalPoints: number;
	valeriaLevel: number;
	valeriaBonus: number;
};

export default function AllStagesSummary({
	stages,
	totalPoints,
	finalPoints,
	valeriaLevel,
	valeriaBonus,
}: AllStagesSummaryProps) {
	const bonusPercent = valeriaLevel * 2;

	return (
		<section className="overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
			{/* Header */}
			<div className="border-b border-[var(--divider)] p-4 sm:p-5">
				<h2 className="text-base font-bold text-[var(--sl-text)]">
					All Stages Summary
				</h2>

				<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
					Overview of your points across all Alliance Showdown stages.
				</p>
			</div>

			{/* Stage List */}
			<div className="divide-y divide-[var(--divider)]">
				{stages.map((stage) => (
					<div
						key={stage.id}
						className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-[var(--sl-hover)]/40 sm:px-5"
					>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium text-[var(--sl-text)]">
								Stage {stage.day}: {stage.name}
							</p>

							<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
								{valeriaLevel > 0 ? (
									<>
										Lv.{valeriaLevel}{" "}
										<span className="font-medium text-[var(--sl-success)]">
											+{bonusPercent}%
										</span>
									</>
								) : (
									"Valeria bonus inactive"
								)}
							</p>
						</div>

						<div className="shrink-0 text-right">
							{stage.totalPoints > 0 ? (
								<>
									{valeriaLevel > 0 && (
										<p className="text-[10px] text-[var(--sl-text-muted)]">
											{formatPoints(stage.totalPoints)} base
										</p>
									)}

									<p className="text-sm font-bold tabular-nums text-[var(--sl-success)]">
										{formatPoints(stage.finalPoints)}
									</p>
								</>
							) : (
								<span className="text-sm text-[var(--sl-text-muted)]">
									{"\u2014"}
								</span>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Grand Total */}
			<div className="border-t border-[var(--divider)] bg-[var(--sl-primary)]/10 p-4 sm:p-5">
				<div className="flex items-center justify-between gap-3">
					<div className="flex min-w-0 items-center gap-2">
						<span className="text-lg" aria-hidden="true">
							🏆
						</span>

						<div className="min-w-0">
							<h3 className="text-sm font-bold text-[var(--sl-text)]">
								Total Alliance Showdown Points
							</h3>

							<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
								{valeriaLevel > 0
									? `Valeria Lv.${valeriaLevel} · +${bonusPercent}% bonus`
									: "All stages combined"}
							</p>
						</div>
					</div>

					<p className="shrink-0 text-xl font-extrabold tabular-nums text-[var(--sl-success)] sm:text-2xl">
						{formatPoints(finalPoints)}
					</p>
				</div>

				{valeriaLevel > 0 && (
					<div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--divider)] pt-3 text-xs">
						<span className="text-[var(--sl-text-muted)]">
							Base {formatPoints(totalPoints)} + Valeria{" "}
							{formatPoints(valeriaBonus)}
						</span>

						<span className="font-semibold text-[var(--sl-success)]">
							+{bonusPercent}%
						</span>
					</div>
				)}
			</div>
		</section>
	);
}
