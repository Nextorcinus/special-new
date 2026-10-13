"use client";

import { formatPoints } from "../utils/calculatePoints";

type StageSummaryProps = {
	stageName: string;
	day: number;
	totalPoints: number;
	onReset: () => void;
};

export default function StageSummary({
	stageName,
	day,
	totalPoints,
	onReset,
}: StageSummaryProps) {
	return (
		<section className="rounded-xl border border-border bg-card p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="space-y-1">
					<p className="text-xs text-muted-foreground">
						Alliance Showdown · Day {day}
					</p>

					<h2 className="text-lg font-semibold text-foreground">{stageName}</h2>
				</div>

				<button
					type="button"
					onClick={onReset}
					className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
				>
					↺ Reset Stage
				</button>
			</div>

			<div className="mt-5">
				<p className="text-xs text-muted-foreground">Total Points</p>
				<p className="mt-1 text-3xl font-bold text-emerald-400">
					{formatPoints(totalPoints)}
					<span className="ml-2 text-sm font-medium">pts</span>
				</p>
			</div>
		</section>
	);
}
