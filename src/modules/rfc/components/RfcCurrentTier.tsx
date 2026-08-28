"use client";

import { ArrowUp, Percent } from "lucide-react";

import type { RfcTier } from "../type";

type RfcCurrentTierProps = {
	tier: RfcTier & {
		progress: number;
	};
};

const TIER_SIZE = 20;
const DISCOUNT_RATE = 0.5;

function formatNumber(value: number): string {
	if (!Number.isFinite(value)) {
		return "0";
	}

	return new Intl.NumberFormat("en-US").format(
		Math.max(0, Math.floor(value)),
	);
}

function getDiscountCost(cost: number): number {
	return Math.ceil(cost * DISCOUNT_RATE);
}

export default function RfcCurrentTier({
	tier,
}: RfcCurrentTierProps) {
	const progress = Math.min(
		Math.max(
			Number(tier.progress ?? 0),
			0,
		),
		TIER_SIZE,
	);

	const remaining = Math.max(
		TIER_SIZE - progress,
		0,
	);

	const normalCost = Math.max(
		0,
		Number(tier.cost ?? 0),
	);

	const discountCost =
		getDiscountCost(normalCost);

	const progressPercent =
		(progress / TIER_SIZE) * 100;

	const hasNextTier =
		tier.tier < 5;

	const nextTier =
		hasNextTier
			? tier.tier + 1
			: null;

	const probabilities =
		Array.isArray(tier.probabilities)
			? tier.probabilities
			: [];

	return (
		<div className="w-full min-w-0">
			{/* ------------------------------------------------------------ */}
			{/* Header                                                        */}
			{/* ------------------------------------------------------------ */}

			<div className="flex min-w-0 items-start justify-between gap-4">
				<div className="min-w-0">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sl-text-muted)] sm:text-[11px]">
						Current Tier
					</p>

					<h2 className="mt-1 text-2xl font-bold text-[var(--sl-text)] sm:text-3xl">
						Tier {tier.tier}
					</h2>

					<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
						Your current RFC conversion tier.
					</p>
				</div>

				<div className="shrink-0 text-right">
					<p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)] sm:text-[10px]">
						Cost Per Conversion
					</p>

					<div className="mt-2 flex items-center justify-end gap-2">
						<img
							src="/icons/crystal.png"
							alt=""
							aria-hidden="true"
							className="size-5 shrink-0 object-contain sm:size-6"
						/>

						<p className="text-xl font-bold text-[var(--sl-text)] sm:text-2xl">
							{formatNumber(
								normalCost,
							)}
						</p>
					</div>
				</div>
			</div>

			{/* ------------------------------------------------------------ */}
			{/* Tier Progress                                                  */}
			{/* ------------------------------------------------------------ */}

			<div className="mt-6">
				<div className="flex min-w-0 items-center justify-between gap-3">
					<p className="text-xs font-semibold text-[var(--sl-text)]">
						Weekly progress:{" "}
						<span className="font-bold">
							{progress}
						</span>
						{" "}
						/ {TIER_SIZE}
					</p>

					<p className="shrink-0 text-[10px] font-semibold text-[var(--sl-text)] sm:text-xs">
						{progress}/{TIER_SIZE} in Tier{" "}
						{tier.tier}
					</p>
				</div>

				<div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--sl-input)]">
					<div
						className="h-full rounded-full bg-[var(--primary)]/30 transition-all duration-300"
						style={{
							width: `${progressPercent}%`,
						}}
					/>
				</div>
			</div>

			{/* ------------------------------------------------------------ */}
			{/* Outcome Probabilities                                          */}
			{/* ------------------------------------------------------------ */}

			<div className="mt-5">
				<p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text)]">
					Outcome Probabilities
				</p>

				{probabilities.length > 0 ? (
					<div className="mt-3 flex min-w-0 flex-wrap items-center gap-x-5 gap-y-3">
						{probabilities.map(
							(probability) => (
								<div
									key={`${probability.rfc}-${probability.chance}`}
									className="flex min-w-0 items-center gap-1.5"
								>
									<img
										src="/icons/rfc.png"
										alt=""
										aria-hidden="true"
										className="size-5 shrink-0 object-contain"
									/>

									<span className="text-xs font-semibold text-[var(--sl-text)]">
										{probability.rfc}
									</span>

									<span className="text-xs font-medium text-[var(--sl-text-muted)]">
										{probability.chance}%
									</span>
								</div>
							),
						)}
					</div>
				) : (
					<p className="mt-3 text-xs text-[var(--sl-text-muted)]">
						No probability data available.
					</p>
				)}
			</div>

			{/* ------------------------------------------------------------ */}
			{/* Cost Cards                                                     */}
			{/* ------------------------------------------------------------ */}

			<div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
				<div className="min-w-0 rounded-2xl bg-[var(--sl-input)] p-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-surface)]">
							<img
								src="/icons/crystal.png"
								alt=""
								aria-hidden="true"
								className="size-4 object-contain"
							/>
						</div>

						<p className="truncate text-[9px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)] sm:text-[10px]">
							FC Cost
						</p>
					</div>

					<div className="mt-3 flex items-center gap-2">
						<img
							src="/icons/crystal.png"
							alt=""
							aria-hidden="true"
							className="size-6 shrink-0 object-contain"
						/>

						<p className="text-xl font-bold text-[var(--sl-text)] sm:text-2xl">
							{formatNumber(
								normalCost,
							)}
						</p>
					</div>

					<p className="mt-1 text-[10px] leading-4 text-[var(--sl-text-muted)] sm:text-xs">
						Normal conversion
					</p>
				</div>

				<div className="min-w-0 rounded-2xl bg-[var(--sl-input)] p-4">
					<div className="flex items-center gap-2">
						<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-surface)]">
							<Percent className="size-4 text-[var(--sl-text-muted)]" />
						</div>

						<p className="truncate text-[9px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)] sm:text-[10px]">
							50% Discount
						</p>
					</div>

					<div className="mt-3 flex items-center gap-2">
						<img
							src="/icons/crystal.png"
							alt=""
							aria-hidden="true"
							className="size-6 shrink-0 object-contain"
						/>

						<p className="text-xl font-bold text-[var(--sl-text)] sm:text-2xl">
							{formatNumber(
								discountCost,
							)}
						</p>
					</div>

					<p className="mt-1 text-[10px] leading-4 text-[var(--sl-text-muted)] sm:text-xs">
						One use per day
					</p>
				</div>
			</div>

			{/* ------------------------------------------------------------ */}
			{/* Next Tier                                                      */}
			{/* ------------------------------------------------------------ */}

			{nextTier !== null ? (
				<div className="mt-4 flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-input)] p-3 sm:p-4">
					<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-surface)]">
						<ArrowUp className="size-4 text-[var(--sl-text-muted)]" />
					</div>

					<div className="min-w-0">
						<p className="truncate text-xs font-bold text-[var(--sl-text)] sm:text-sm">
							Next: Tier {nextTier}
						</p>

						<p className="mt-1 text-[10px] leading-4 text-[var(--sl-text-muted)] sm:text-xs">
							{remaining} more conversions
							to reach Tier {nextTier}.
						</p>
					</div>
				</div>
			) : (
				<div className="mt-4 flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-input)] p-3 sm:p-4">
					<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-surface)]">
						<ArrowUp className="size-4 text-[var(--sl-text-muted)]" />
					</div>

					<div className="min-w-0">
						<p className="text-xs font-bold text-[var(--sl-text)] sm:text-sm">
							Maximum Tier
						</p>

						<p className="mt-1 text-[10px] leading-4 text-[var(--sl-text-muted)] sm:text-xs">
							You are currently at the
							highest RFC tier.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}