"use client";

import {
	Check,
	Save,
} from "lucide-react";
import {
	useEffect,
	useMemo,
	useState,
} from "react";

import { parseShortNumber } from "@/lib/number";
import { useInventoryStore } from "@/features/inventory/store/inventory.store";

import {
	createInitialState,
	runConversion,
} from "../calculator";

import type {
	RfcHistoryItem,
	RfcSessionResult,
	RfcSetupValues,
} from "../type";

import RfcCurrentTier from "./RfcCurrentTier";
import RfcHistory from "./RfcHistory";
import RfcSetup from "./RfcSetup";
import RfcStatistics from "./RfcStatistics";

const DEFAULT_STARTING_COUNT = 0;
const DEFAULT_FC_INVENTORY = 0;

const FC_RESOURCE_ID = "fire-crystal";
const RFC_RESOURCE_ID = "refined";

type RfcSimulatorProps = {
	initialStartingCount?: number;
	initialFcInventory?: number;
};

function normalizeNumber(
	value: number | undefined,
	fallback: number,
): number {
	if (!Number.isFinite(value)) {
		return fallback;
	}

	return Math.max(
		0,
		Math.floor(value as number),
	);
}

function parseInventoryValue(
	value: string | undefined,
): number {
	if (!value) {
		return 0;
	}

	const parsed = parseShortNumber(value);

	if (!Number.isFinite(parsed)) {
		return 0;
	}

	return Math.max(
		0,
		Math.floor(parsed),
	);
}

function formatNumber(
	value: number,
): string {
	if (!Number.isFinite(value)) {
		return "0";
	}

	return new Intl.NumberFormat(
		"en-US",
	).format(
		Math.max(
			0,
			Math.floor(value),
		),
	);
}

export default function RfcSimulator({
	initialStartingCount = DEFAULT_STARTING_COUNT,
	initialFcInventory = DEFAULT_FC_INVENTORY,
}: RfcSimulatorProps) {
	/*
	|--------------------------------------------------------------------------
	| Resource Bag
	|--------------------------------------------------------------------------
	*/

	const inventory = useInventoryStore(
		(state) => state.resources,
	);

	const loadResources = useInventoryStore(
		(state) => state.loadResources,
	);

	const setResources = useInventoryStore(
		(state) => state.setResources,
	);

	/*
	|--------------------------------------------------------------------------
	| Load Resource Bag
	|--------------------------------------------------------------------------
	*/

	useEffect(() => {
		loadResources();
	}, [loadResources]);

	/*
	|--------------------------------------------------------------------------
	| Resource Bag values
	|--------------------------------------------------------------------------
	*/

	const inventoryFc = useMemo(() => {
		return parseInventoryValue(
			inventory[FC_RESOURCE_ID],
		);
	}, [inventory]);

	const inventoryRfc = useMemo(() => {
		return parseInventoryValue(
			inventory[RFC_RESOURCE_ID],
		);
	}, [inventory]);

	/*
	|--------------------------------------------------------------------------
	| Resource Bag is the preferred FC source
	|--------------------------------------------------------------------------
	*/

	const hasInventoryFc =
		Object.prototype.hasOwnProperty.call(
			inventory,
			FC_RESOURCE_ID,
		);

	const effectiveFcInventory =
		hasInventoryFc
			? inventoryFc
			: normalizeNumber(
					initialFcInventory,
					DEFAULT_FC_INVENTORY,
				);

	/*
	|--------------------------------------------------------------------------
	| Initial RFC setup
	|--------------------------------------------------------------------------
	*/

	const initialSetup = useMemo<RfcSetupValues>(
		() => ({
			startingCount:
				normalizeNumber(
					initialStartingCount,
					DEFAULT_STARTING_COUNT,
				),

			fcInventory:
				effectiveFcInventory,
		}),
		[
			initialStartingCount,
			effectiveFcInventory,
		],
	);

	const [
		setup,
		setSetup,
	] = useState<RfcSetupValues>(
		initialSetup,
	);

	const [
		session,
		setSession,
	] = useState<RfcSessionResult>(
		() =>
			createInitialState(
				initialSetup,
			),
	);

	const [
		isDiscountUsed,
		setIsDiscountUsed,
	] = useState(false);

	

	const [
		hasUnsavedChanges,
		setHasUnsavedChanges,
	] = useState(false);

	

	useEffect(() => {
		const currentHistory =
			session.state.history ?? [];

		const currentFcUsed =
			Number(
				session.state.fcUsed ?? 0,
			);

		const hasConversion =
			currentHistory.length > 0 ||
			currentFcUsed > 0;

	
		if (hasConversion) {
			return;
		}

		const nextSetup: RfcSetupValues = {
			startingCount:
				normalizeNumber(
					initialStartingCount,
					DEFAULT_STARTING_COUNT,
				),

			fcInventory:
				effectiveFcInventory,
		};


		const setupChanged =
			setup.startingCount !==
				nextSetup.startingCount ||
			setup.fcInventory !==
				nextSetup.fcInventory;

		if (!setupChanged) {
			return;
		}

		setSetup(nextSetup);

		setSession(
			createInitialState(
				nextSetup,
			),
		);

		setIsDiscountUsed(false);

		setHasUnsavedChanges(false);
	}, [
		effectiveFcInventory,
		initialStartingCount,
	]);

	/*
	|--------------------------------------------------------------------------
	| Session values
	|--------------------------------------------------------------------------
	*/

	const history: RfcHistoryItem[] =
		session.state.history ?? [];

	const calculation =
		session.calculation;

	const statistics =
		session.statistics;

	const currentTier =
		calculation.tier;

	const currentProgress =
		calculation.progress;

	/*
	|--------------------------------------------------------------------------
	| Simulation FC
	|--------------------------------------------------------------------------
	|
	| This is NOT the Resource Bag FC.
	|
	| It is:
	|
	| snapshot FC - FC used during simulation
	|
	*/

	const remainingFc =
		Math.max(
			0,
			session.state.fcInventory -
				session.state.fcUsed,
		);

	const canConvert =
		calculation.canConvert;

	const canDiscount =
		!isDiscountUsed &&
		calculation.canDiscount;

	/*
	|--------------------------------------------------------------------------
	| Transaction totals
	|--------------------------------------------------------------------------
	*/

	const fcUsed = Math.max(
		0,
		Number(
			statistics?.fcUsed ??
				session.state.fcUsed ??
				0,
		),
	);

	const rfcGained = Math.max(
		0,
		Number(
			statistics?.rfcGained ?? 0,
		),
	);

	/*
	|--------------------------------------------------------------------------
	| Preview values
	|--------------------------------------------------------------------------
	|
	| These are only previews.
	|
	| Resource Bag is still untouched.
	|
	*/

	const previewFc = Math.max(
		0,
		inventoryFc - fcUsed,
	);

	const previewRfc = Math.max(
		0,
		inventoryRfc + rfcGained,
	);

	/*
	|--------------------------------------------------------------------------
	| Setup change
	|--------------------------------------------------------------------------
	*/

	function handleSetupChange(
		nextValues: RfcSetupValues,
	) {
		const nextSetup: RfcSetupValues = {
			startingCount:
				normalizeNumber(
					nextValues.startingCount,
					DEFAULT_STARTING_COUNT,
				),

			fcInventory:
				normalizeNumber(
					nextValues.fcInventory,
					DEFAULT_FC_INVENTORY,
				),
		};

		setSetup(nextSetup);

		setSession(
			createInitialState(
				nextSetup,
			),
		);

		setIsDiscountUsed(false);

		setHasUnsavedChanges(false);
	}

	/*
	|--------------------------------------------------------------------------
	| Conversion
	|--------------------------------------------------------------------------
	*/

	function handleConvert(
		discounted = false,
	) {
		if (
			discounted &&
			!canDiscount
		) {
			return;
		}

		if (
			!discounted &&
			!canConvert
		) {
			return;
		}

		const result =
			runConversion(
				setup,
				history,
				discounted,
			);

		if (!result) {
			return;
		}

		setSession(result);

		if (discounted) {
			setIsDiscountUsed(true);
		}

		/*
		 * IMPORTANT:
		 *
		 * Conversion only modifies the RFC session.
		 *
		 * Resource Bag remains untouched.
		 */
		setHasUnsavedChanges(true);
	}

	/*
	|--------------------------------------------------------------------------
	| Reset
	|--------------------------------------------------------------------------
	*/

	function handleReset() {
		setSession(
			createInitialState(
				setup,
			),
		);

		setIsDiscountUsed(false);

		setHasUnsavedChanges(false);
	}

	/*
	|--------------------------------------------------------------------------
	| Save to Resources
	|--------------------------------------------------------------------------
	*/

	function handleSaveToResources() {
	if (
		!hasUnsavedChanges ||
		(fcUsed <= 0 && rfcGained <= 0)
	) {
		return;
	}

	/*
	 * Always read the latest Resource Bag state.
	 *
	 * Resource Bag is the source of truth.
	 */
	const latestInventory =
		useInventoryStore.getState().resources;

	const latestFc =
		parseInventoryValue(
			latestInventory[FC_RESOURCE_ID],
		);

	const latestRfc =
		parseInventoryValue(
			latestInventory[RFC_RESOURCE_ID],
		);

	/*
	 * Apply only this RFC session's transaction.
	 */
	const nextFc = Math.max(
		0,
		latestFc - fcUsed,
	);

	const nextRfc = Math.max(
		0,
		latestRfc + rfcGained,
	);

	const nextResources = {
		...latestInventory,

		[FC_RESOURCE_ID]: String(nextFc),

		[RFC_RESOURCE_ID]: String(nextRfc),
	};

	
	setResources(nextResources);

	
	const nextSetup: RfcSetupValues = {
		...setup,
		fcInventory: nextFc,
	};

	const nextSession =
		createInitialState(
			nextSetup,
			history,
		);

	setSetup(nextSetup);

	setSession(nextSession);

	/*
	 * The current transaction has now been committed.
	 */
	setHasUnsavedChanges(false);
}

	return (
		<div className="w-full min-w-0 p-4">
			<div className="flex w-full min-w-0 flex-col gap-4">
				{/*
				 * ---------------------------------------------------------
				 * Setup
				 * ---------------------------------------------------------
				 */}
				<section className="w-full min-w-0 rounded-3xl bg-[var(--sl-surface)] p-4 sm:p-5">
					<RfcSetup
						values={setup}
						onChange={
							handleSetupChange
						}
					/>

					<div className="mt-4 rounded-2xl bg-[var(--sl-input)] p-4">
						<div className="flex items-start gap-3">
							<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
								<span className="text-sm">
									🎒
								</span>
							</div>

							<div className="min-w-0 flex-1">
								<p className="text-xs font-bold text-[var(--sl-text)]">
									Resource Bag Sync
								</p>

								<p className="mt-1 text-[11px] leading-4 text-[var(--sl-text-muted)]">
									Fire Crystal is loaded from your Resource
									Bag. RFC conversions are simulated first
									and only affect your resources after you
									save.
								</p>
							</div>
						</div>

						<div className="mt-3 grid grid-cols-2 gap-2">
							<div className="rounded-xl bg-[var(--sl-surface)] p-3">
								<p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
									Bag FC
								</p>

								<p className="mt-1 text-sm font-bold text-[var(--sl-text)]">
									{formatNumber(
										inventoryFc,
									)}
								</p>
							</div>

							<div className="rounded-xl bg-[var(--sl-surface)] p-3">
								<p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
									Bag RFC
								</p>

								<p className="mt-1 text-sm font-bold text-[var(--sl-text)]">
									{formatNumber(
										inventoryRfc,
									)}
								</p>
							</div>
						</div>
					</div>
				</section>

				{/*
				 * ---------------------------------------------------------
				 * Current Tier
				 * ---------------------------------------------------------
				 */}
				<section className="w-full min-w-0 rounded-3xl bg-[var(--sl-surface)] p-4 sm:p-5">
					<RfcCurrentTier
						tier={{
							...currentTier,
							progress:
								currentProgress,
						}}
					/>
				</section>

				{/*
				 * ---------------------------------------------------------
				 * Weekly Progress
				 * ---------------------------------------------------------
				 */}
				<section className="w-full min-w-0 rounded-3xl bg-[var(--sl-surface)] p-4 sm:p-5">
					<div className="flex min-w-0 items-start gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-input)]">
							<span className="text-lg">
								📊
							</span>
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
									{
										calculation.currentCount
									}

									<span className="ml-1 text-base font-medium text-[var(--sl-text-muted)]">
										/100
									</span>
								</p>

								<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
									Weekly conversions
								</p>
							</div>

							<p className="shrink-0 text-xs font-semibold text-[var(--sl-text-muted)]">
								{Math.max(
									100 -
										calculation.currentCount,
									0,
								)}{" "}
								remaining
							</p>
						</div>

						<div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--sl-input)]">
							<div
								className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
								style={{
									width: `${Math.min(
										calculation.progressPercent,
										100,
									)}%`,
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
								{
									calculation.normalCost
								}{" "}
								FC
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
								{
									calculation.discountCost
								}{" "}
								FC
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
		className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl bg-lime-200 px-4 text-sm font-bold text-slate-950 shadow-sm transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
	>
		<img
			src="/icons/crystal.png"
			alt=""
			aria-hidden="true"
			className="size-5 shrink-0 object-contain"
		/>

		<span className="truncate">
			Convert ({calculation.normalCost} FC)
		</span>
	</button>

	<button
		type="button"
		onClick={() => handleConvert(true)}
		disabled={!canDiscount}
		className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl bg-[#F9A20B] px-4 text-sm font-bold text-slate-950 shadow-sm transition-all hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100"
	>
		<img
			src="/icons/crystal.png"
			alt=""
			aria-hidden="true"
			className="size-5 shrink-0 object-contain"
		/>

		<span className="truncate">
			{isDiscountUsed
				? "Discount Used"
				: `50% Off (${calculation.discountCost} FC)`}
		</span>
	</button>
</div>

					{/*
					 * -----------------------------------------------------
					 * Unsaved transaction
					 * -----------------------------------------------------
					 */}
					{hasUnsavedChanges && (
						<div className="mt-4 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
							<div className="flex items-start gap-3">
								<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
									<Save className="size-4 text-[var(--primary)]" />
								</div>

								<div className="min-w-0 flex-1">
									<p className="text-xs font-bold text-[var(--sl-text)]">
										Unsaved Resource Changes
									</p>

									<p className="mt-1 text-[11px] leading-4 text-[var(--sl-text-muted)]">
										This simulation has used{" "}
										<span className="font-semibold text-[var(--sl-text)]">
											{formatNumber(
												fcUsed,
											)}{" "}
											FC
										</span>{" "}
										and generated{" "}
										<span className="font-semibold text-[var(--sl-text)]">
											{formatNumber(
												rfcGained,
											)}{" "}
											RFC
										</span>
										. Your Resource Bag has not been
										changed yet.
									</p>
								</div>
							</div>

							<div className="mt-3 grid grid-cols-2 gap-2">
								<div className="rounded-xl bg-[var(--sl-surface)] p-3">
									<p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
										FC After Save
									</p>

									<p className="mt-1 text-sm font-bold text-[var(--sl-text)]">
										{formatNumber(
											previewFc,
										)}
									</p>
								</div>

								<div className="rounded-xl bg-[var(--sl-surface)] p-3">
									<p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
										RFC After Save
									</p>

									<p className="mt-1 text-sm font-bold text-[var(--sl-text)]">
										{formatNumber(
											previewRfc,
										)}
									</p>
								</div>
							</div>

							<button
								type="button"
								onClick={
									handleSaveToResources
								}
								className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-4 text-sm font-bold text-[var(--primary-foreground)] transition-opacity hover:opacity-90"
							>
								<Save className="size-4" />
								Save to Resources
							</button>
						</div>
					)}

					{/*
					 * -----------------------------------------------------
					 * Saved state
					 * -----------------------------------------------------
					 */}
					{!hasUnsavedChanges &&
						fcUsed > 0 && (
							<div className="mt-4 flex items-center gap-2 rounded-2xl bg-[var(--sl-input)] px-4 py-3">
								<Check className="size-4 shrink-0 text-emerald-400" />

								<p className="text-[11px] font-semibold text-[var(--sl-text-muted)]">
									Resource changes saved successfully.
								</p>
							</div>
						)}

					<button
						type="button"
						onClick={
							handleReset
						}
						className="mt-3 flex h-10 w-full items-center justify-center rounded-full bg-[var(--sl-input)] text-xs font-bold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-active)]"
					>
						Reset Session
					</button>
				</section>

				{/*
				 * ---------------------------------------------------------
				 * Statistics
				 * ---------------------------------------------------------
				 */}
				<section className="w-full min-w-0 rounded-3xl bg-[var(--sl-surface)] p-4 sm:p-5">
					<RfcStatistics
						statistics={
							statistics
						}
						remainingFc={
							remainingFc
						}
					/>
				</section>

				{/*
				 * ---------------------------------------------------------
				 * History
				 * ---------------------------------------------------------
				 */}
				<section className="w-full min-w-0 rounded-3xl bg-[var(--sl-surface)] p-4 sm:p-5">
					<RfcHistory
						history={
							history
						}
					/>
				</section>
			</div>
		</div>
	);
}