"use client";

import { formatPoints } from "../utils/calculatePoints";
import ValeriaSkillSelector from "./ValeriaSkillSelector";

type StageSummaryProps = {
	stageName: string;
	day: number;
	totalPoints: number;
	finalPoints: number;
	valeriaLevel: number;
	valeriaBonusPercent: number;
	valeriaMultiplier: number;
	valeriaBonus: number;
	onValeriaLevelChange: (level: number) => void;
	onReset: () => void;
};

export default function StageSummary({
	stageName,
	day,
	totalPoints,
	finalPoints,
	valeriaLevel,
	valeriaBonusPercent,
	valeriaMultiplier,
	valeriaBonus,
	onValeriaLevelChange,
	onReset,
}: StageSummaryProps) {
	return (
		<section className="rounded-xl border border-border bg-card p-4">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="space-y-1">
					<p className="text-xs text-muted-foreground">
						Alliance Showdown · Day {day}
					</p>

					<h2 className="text-lg font-semibold text-foreground">{stageName}</h2>
				</div>

				<button
					type="button"
					onClick={onReset}
					className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
				>
					↺ Reset Stage
				</button>
			</div>

			<div className="mt-5">
				<p className="text-xs text-muted-foreground">Total Points</p>

				<p className="mt-1 text-3xl font-bold text-emerald-400">
					{formatPoints(finalPoints)}
					<span className="ml-2 text-sm font-medium">pts</span>
				</p>

				{valeriaLevel > 0 && (
					<div className="mt-2 space-y-1">
						<p className="text-xs text-muted-foreground">
							Base: {formatPoints(totalPoints)} pts
						</p>

						<p className="text-sm font-semibold text-violet-400">
							+{formatPoints(valeriaBonus)} pts Valeria
							<span className="ml-2 text-xs font-normal">
								({valeriaBonusPercent}% · ×{valeriaMultiplier.toFixed(2)})
							</span>
						</p>
					</div>
				)}
			</div>

			<div className="mt-5 border-t border-border pt-4">
				<ValeriaSkillSelector
					level={valeriaLevel}
					onLevelChange={onValeriaLevelChange}
				/>
			</div>
		</section>
	);
}
