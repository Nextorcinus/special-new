"use client";

import type { Mission } from "../utils/calculatePoints";
import { calculateMissionPoints, formatPoints } from "../utils/calculatePoints";

type MissionCardProps = {
	mission: Mission;
	onQuantityChange: (quantity: number) => void;
};

const priorityStyles = {
	great: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
	medium: "border-amber-500/20 bg-amber-500/10 text-amber-400",
	low: "border-slate-500/20 bg-slate-500/10 text-slate-400",
};

const priorityLabels = {
	great: "★ Great",
	medium: "★ Medium",
	low: "★ Low",
};

export default function MissionCard({
	mission,
	onQuantityChange,
}: MissionCardProps) {
	const subtotal = calculateMissionPoints(mission);

	return (
		<article className="flex min-w-0 flex-col gap-3 rounded-xl border border-border border-l-[3px] border-l-emerald-500 bg-card p-3">
			<div className="flex items-start justify-between gap-2">
				<h3 className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
					{mission.name}
				</h3>

				<span
					className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-semibold ${
						priorityStyles[mission.priority]
					}`}
				>
					{priorityLabels[mission.priority]}
				</span>
			</div>

			<div className="flex items-center gap-1">
				<button
					type="button"
					aria-label={`Decrease ${mission.name}`}
					disabled={mission.quantity <= 0}
					onClick={() => onQuantityChange(mission.quantity - 1)}
					className="h-8 w-9 rounded-md border border-border bg-background text-muted-foreground hover:bg-accent disabled:opacity-40"
				>
					−
				</button>

				<input
					type="number"
					min={0}
					step={1}
					value={mission.quantity}
					aria-label={`Quantity for ${mission.name}`}
					onChange={(event) => onQuantityChange(Number(event.target.value))}
					className="h-8 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-center text-sm text-foreground outline-none focus:border-blue-500"
				/>

				<button
					type="button"
					aria-label={`Increase ${mission.name}`}
					onClick={() => onQuantityChange(mission.quantity + 1)}
					className="h-8 w-9 rounded-md border border-border bg-background text-muted-foreground hover:bg-accent"
				>
					+
				</button>
			</div>

			<div className="flex items-end justify-between gap-2">
				<span className="text-[11px] text-muted-foreground">
					{formatPoints(mission.points)} pts each
					{mission.unit === "minute" ? " · per minute" : ""}
				</span>

				<span
					className={`shrink-0 text-xs font-semibold ${
						subtotal > 0 ? "text-emerald-400" : "text-muted-foreground"
					}`}
				>
					{subtotal > 0 ? `= ${formatPoints(subtotal)} pts` : "0 pts"}
				</span>
			</div>
		</article>
	);
}
