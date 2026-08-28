"use client";

import { useEffect, useMemo, useState } from "react";

import { createInitialState, runConversion } from "../calculator";

import type { RfcHistoryItem, RfcSessionResult, RfcSetupValues } from "../type";

import RfcCurrentTier from "./RfcCurrentTier";
import RfcHistory from "./RfcHistory";
import RfcSetup from "./RfcSetup";
import RfcStatistics from "./RfcStatistics";

const DEFAULT_STARTING_COUNT = 0;
const DEFAULT_FC_INVENTORY = 0;

type RfcSimulatorProps = {
	initialStartingCount?: number;
	initialFcInventory?: number;
};

function normalizeNumber(value: number | undefined, fallback: number): number {
	if (!Number.isFinite(value)) {
		return fallback;
	}

	return Math.max(0, Math.floor(value as number));
}

export default function RfcSimulator({
	initialStartingCount = DEFAULT_STARTING_COUNT,
	initialFcInventory = DEFAULT_FC_INVENTORY,
}: RfcSimulatorProps) {
	const initialSetup = useMemo<RfcSetupValues>(
		() => ({
			startingCount: normalizeNumber(
				initialStartingCount,
				DEFAULT_STARTING_COUNT,
			),
			fcInventory: normalizeNumber(initialFcInventory, DEFAULT_FC_INVENTORY),
		}),
		[initialStartingCount, initialFcInventory],
	);

	const [setup, setSetup] = useState<RfcSetupValues>(initialSetup);

	const [session, setSession] = useState<RfcSessionResult>(() =>
		createInitialState(initialSetup),
	);

	const [isDiscountUsed, setIsDiscountUsed] = useState(false);

	useEffect(() => {
		setSetup(initialSetup);
		setSession(createInitialState(initialSetup));
		setIsDiscountUsed(false);
	}, [initialSetup]);

	const history: RfcHistoryItem[] = session.state.history ?? [];

	const calculation = session.calculation;

	const statistics = session.statistics;

	const currentTier = calculation.tier;

	const currentProgress = calculation.progress;

	const remainingFc = Math.max(
		0,
		session.state.fcInventory - session.state.fcUsed,
	);

	const canConvert = calculation.canConvert;

	const canDiscount = !isDiscountUsed && calculation.canDiscount;

	function handleSetupChange(nextValues: RfcSetupValues) {
		const nextSetup: RfcSetupValues = {
			startingCount: normalizeNumber(nextValues.startingCount, 0),
			fcInventory: normalizeNumber(nextValues.fcInventory, 0),
		};

		setSetup(nextSetup);

		setSession(createInitialState(nextSetup));

		setIsDiscountUsed(false);
	}

	function handleConvert(discounted = false) {
		if (discounted && !canDiscount) {
			return;
		}

		if (!discounted && !canConvert) {
			return;
		}

		const result = runConversion(setup, history, discounted);

		if (!result) {
			return;
		}

		setSession(result);

		if (discounted) {
			setIsDiscountUsed(true);
		}
	}

	function handleReset() {
		setSession(createInitialState(setup));

		setIsDiscountUsed(false);
	}

	return (
		<div className="w-full min-w-0">
			<div className="flex w-full min-w-0 flex-col gap-4">
				<section className="w-full min-w-0 rounded-3xl bg-[var(--sl-surface)] p-4 sm:p-5">
					<RfcSetup values={setup} onChange={handleSetupChange} />
				</section>

				<section className="w-full min-w-0 rounded-3xl bg-[var(--sl-surface)] p-4 sm:p-5">
					<RfcCurrentTier
						tier={{
							...currentTier,
							progress: currentProgress,
						}}
					/>
				</section>

				<section className="w-full min-w-0 rounded-3xl bg-[var(--sl-surface)] p-4 sm:p-5">
					<div className="flex min-w-0 items-start gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-input)]">
							<span className="text-lg">📊</span>
						</div>

						<div className="min-w-0">
							<h2 className="text-sm font-bold text-[var(--sl-text)]">
								Weekly Progress
							</h2>

							<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
								Your current RFC conversion progress this week.
							</p>
						</div>
					</div>

					<div className="mt-5">
						<div className="flex min-w-0 items-end justify-between gap-3">
							<div className="min-w-0">
								<p className="text-2xl font-bold text-[var(--sl-text)]">
									{calculation.currentCount}

									<span className="ml-1 text-base font-medium text-[var(--sl-text-muted)]">
										/100
									</span>
								</p>

								<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
									Weekly conversions
								</p>
							</div>

							<p className="shrink-0 text-xs font-semibold text-[var(--sl-text-muted)]">
								{Math.max(100 - calculation.currentCount, 0)} remaining
							</p>
						</div>

						<div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--sl-input)]">
							<div
								className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
								style={{
									width: `${Math.min(calculation.progressPercent, 100)}%`,
								}}
							/>
						</div>
					</div>

					<div className="mt-5 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
						<div className="min-w-0 rounded-2xl bg-[var(--sl-input)] p-4">
							<p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
								Normal Cost
							</p>

							<p className="mt-1 text-xl font-bold text-[var(--sl-text)]">
								{calculation.normalCost} FC
							</p>

							<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
								Normal conversion
							</p>
						</div>

						<div className="min-w-0 rounded-2xl bg-[var(--sl-input)] p-4">
							<p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
								50% Discount
							</p>

							<p className="mt-1 text-xl font-bold text-[var(--sl-text)]">
								{calculation.discountCost} FC
							</p>

							<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
								One use per day
							</p>
						</div>
					</div>

					<div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
						<button
							type="button"
							onClick={() => handleConvert(false)}
							disabled={!canConvert}
							className="h-11 rounded-full bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-foreground)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
						>
							Convert
						</button>

						<button
							type="button"
							onClick={() => handleConvert(true)}
							disabled={!canDiscount}
							className="h-11 rounded-full bg-[var(--sl-input)] px-4 text-sm font-bold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-active)] disabled:cursor-not-allowed disabled:opacity-40"
						>
							{isDiscountUsed ? "Discount Used" : "50% Discount"}
						</button>
					</div>

					<button
						type="button"
						onClick={handleReset}
						className="mt-3 flex h-10 w-full items-center justify-center rounded-full bg-[var(--sl-input)] text-xs font-bold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-active)]"
					>
						Reset Session
					</button>
				</section>

				<section className="w-full min-w-0 rounded-3xl bg-[var(--sl-surface)] p-4 sm:p-5">
					<RfcStatistics statistics={statistics} remainingFc={remainingFc} />
				</section>

				<section className="w-full min-w-0 rounded-3xl bg-[var(--sl-surface)] p-4 sm:p-5">
					<RfcHistory history={history} />
				</section>
			</div>
		</div>
	);
}
