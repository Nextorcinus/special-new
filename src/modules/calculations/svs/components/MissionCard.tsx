"use client";

import { useMemo } from "react";
import type { Mission } from "../utils/calculatePoints";
import { formatPoints } from "../utils/calculatePoints";

type MissionCardProps = {
	mission: Mission;
	index: number;
	valeriaBonusPercent?: number;
	onQuantityChange: (quantity: number) => void;
};

export default function MissionCard({
	mission,
	index,
	valeriaBonusPercent = 0,
	onQuantityChange,
}: MissionCardProps) {
	const bonusPercent = Math.max(0, valeriaBonusPercent);

	const basePointsEach = useMemo(() => {
		return Math.max(0, mission.points);
	}, [mission.points]);

	const finalPointsEach = useMemo(() => {
		return basePointsEach + Math.floor((basePointsEach * bonusPercent) / 100);
	}, [basePointsEach, bonusPercent]);

	const finalPoints = useMemo(() => {
		const quantity = Number.isFinite(mission.quantity)
			? Math.max(0, mission.quantity)
			: 0;

		return finalPointsEach * quantity;
	}, [finalPointsEach, mission.quantity]);

	const backgroundClass =
		index % 2 === 0
			? "bg-[var(--sl-surface)]"
			: "bg-[var(--sl-surface-2,var(--sl-surface))]";

	const priorityClass =
		mission.priority === "great"
			? "bg-[var(--sl-success)]/10 text-[var(--sl-success)]"
			: mission.priority === "medium"
				? "bg-[var(--sl-warning)]/10 text-[var(--sl-warning)]"
				: "bg-[var(--sl-text-muted)]/10 text-[var(--sl-text-muted)]";

	const changeQuantity = (value: number) => {
		const safeValue = Number.isFinite(value)
			? Math.max(0, Math.floor(value))
			: 0;

		const limitedValue =
			mission.maxQuantity === undefined
				? safeValue
				: Math.min(mission.maxQuantity, safeValue);

		onQuantityChange(limitedValue);
	};

	return (
		<article
			className={`min-w-0 rounded-xl border border-[var(--sl-border)] ${backgroundClass} p-3 transition-colors duration-200 hover:border-[var(--sl-primary)]/40`}
		>
			<div className="flex items-start justify-between gap-3">
				<h3 className="min-w-0 flex-1 text-sm font-medium leading-snug text-[var(--sl-text)]">
					{mission.name}
				</h3>

				<span
					className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${priorityClass}`}
				>
					★{" "}
					{mission.priority === "great"
						? "Great"
						: mission.priority === "medium"
							? "Medium"
							: "Low"}
				</span>
			</div>

			<div className="mt-3 flex items-center gap-1.5">
				<button
					type="button"
					aria-label={`Decrease ${mission.name}`}
					disabled={mission.quantity <= 0}
					onClick={() => changeQuantity(mission.quantity - 1)}
					className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-input-hover)] disabled:cursor-not-allowed disabled:opacity-40"
				>
					−
				</button>

				<input
					type="number"
					min={0}
					max={mission.maxQuantity}
					step={1}
					value={mission.quantity}
					aria-label={`Quantity for ${mission.name}`}
					onChange={(event) => changeQuantity(Number(event.target.value))}
					className="h-8 min-w-0 flex-1 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-center text-sm font-medium text-[var(--sl-text)] outline-none focus:border-[var(--sl-primary)]"
				/>

				<button
					type="button"
					aria-label={`Increase ${mission.name}`}
					disabled={
						mission.maxQuantity !== undefined &&
						mission.quantity >= mission.maxQuantity
					}
					onClick={() => changeQuantity(mission.quantity + 1)}
					className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-input-hover)] disabled:cursor-not-allowed disabled:opacity-40"
				>
					+
				</button>
			</div>

			<div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--divider)] pt-2.5">
				<span className="text-[11px] leading-relaxed text-[var(--sl-text-muted)]">
					{formatPoints(finalPointsEach)} pts each
				</span>

				<span
					className={`text-xs font-semibold tabular-nums ${
						finalPoints > 0
							? "text-[var(--sl-success)]"
							: "text-[var(--sl-text-muted)]"
					}`}
				>
					{formatPoints(finalPoints)} pts
				</span>
			</div>
		</article>
	);
}
