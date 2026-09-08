"use client";

import {
	AlertTriangle,
	ArrowRight,
	Check,
	CheckCircle2,
	Plus,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import CalculatorResult from "@/components/calculator/CalculatorResult";
import {
	formatNumber,
	useCompareResources,
} from "@/components/calculator/useCompareResources";

import { NAVIGATION } from "@/config/navigation";
import { RESOURCES } from "@/config/resources";

import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";

import { useInventoryStore } from "@/features/inventory/store/inventory.store";

import { parseShortNumber } from "@/lib/number";

import type { GearCalculationResult, GearFormValues } from "../type";

/* ================================================================
   TYPES
   ================================================================ */

type GearHistoryItem = CalculationHistoryItem<
	GearFormValues,
	GearCalculationResult
>;

type GearResultProps = {
	result: GearCalculationResult;

	/**
	 * Parent History.
	 */
	history?: GearHistoryItem | null;

	/**
	 * ID of this individual result
	 * inside History.items.
	 */
	entryId?: string;

	/**
	 * Completed state of this individual
	 * History Entry.
	 */
	completed?: boolean;

	/**
	 * Called after this result has been
	 * successfully completed.
	 */
	onCompleted?: () => void;

	title?: string;

	showAddButton?: boolean;

	onAddItem?: () => void;
};

type GearResourceType = "Plans" | "Alloy" | "Polish" | "Amber";

type ResourceCheck = {
	key: GearResourceType;
	label: string;
	icon: string;
	inventoryId: string;
	required: number;
	available: number;
	sufficient: boolean;
};

/* ================================================================
   FORMATTERS
   ================================================================ */

function formatSvs(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "+0";
	}

	if (number >= 1_000_000_000) {
		return `+${(number / 1_000_000_000).toFixed(2)}B`;
	}

	if (number >= 1_000_000) {
		return `+${(number / 1_000_000).toFixed(2)}M`;
	}

	if (number >= 1_000) {
		return `+${(number / 1_000).toFixed(1)}K`;
	}

	return `+${formatNumber(number)}`;
}

function formatDeployment(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "+0";
	}

	return `+${formatNumber(number)}`;
}

function formatStatResult(finalValue: unknown, increaseValue: unknown): string {
	const finalStat = Number(finalValue ?? 0);
	const increase = Number(increaseValue ?? 0);

	if (!Number.isFinite(finalStat) || !Number.isFinite(increase)) {
		return "+0%";
	}

	const formattedFinal = `+${finalStat.toLocaleString("en-US", {
		minimumFractionDigits: Number.isInteger(finalStat) ? 0 : 2,
		maximumFractionDigits: 2,
	})}%`;

	const formattedIncrease = `+${increase.toLocaleString("en-US", {
		minimumFractionDigits: Number.isInteger(increase) ? 0 : 2,
		maximumFractionDigits: 2,
	})}%`;

	return `${formattedFinal}  ${formattedIncrease}`;
}

function formatDeploymentResult(
	finalValue: unknown,
	increaseValue: unknown,
): string {
	const finalDeployment = Number(finalValue ?? 0);
	const increase = Number(increaseValue ?? 0);

	if (!Number.isFinite(finalDeployment) || !Number.isFinite(increase)) {
		return "+0";
	}

	return `${formatDeployment(finalDeployment)}  ${formatDeployment(increase)}`;
}

/* ================================================================
   NUMBER HELPERS
   ================================================================ */

function toNumber(value: unknown): number {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value === "string") {
		const parsed = parseShortNumber(value);

		return Number.isFinite(parsed) ? parsed : 0;
	}

	const parsed = Number(value ?? 0);

	return Number.isFinite(parsed) ? parsed : 0;
}

function formatResourceAmount(value: unknown): string {
	return formatNumber(toNumber(value));
}

/* ================================================================
   COMPLETED RESOURCE ITEM
   ================================================================ */

/**
 * Resource item used when the result is already completed.
 *
 * IMPORTANT:
 *
 * This does NOT use useCompareResources().
 *
 * Therefore the completed result does not compare
 * its requirement against the current inventory.
 */
function createCompletedResourceItem(key: GearResourceType, value: unknown) {
	const resource = RESOURCES[key];

	return {
		id: resource.id,
		label: resource.label,
		icon: resource.icon,
		value: formatResourceAmount(value),
	};
}

/* ================================================================
   CONFIRM RESOURCE ROW
   ================================================================ */

function ConfirmResourceRow({ resource }: { resource: ResourceCheck }) {
	const difference = resource.available - resource.required;

	return (
		<div
			className={[
				"rounded-2xl border p-3 transition-colors",
				resource.sufficient
					? "border-[var(--sl-border)] bg-black/10"
					: "border-red-400/30 bg-red-500/5",
			].join(" ")}
		>
			{/* RESOURCE HEADER */}

			<div className="flex items-center gap-3">
				<div
					className={[
						"flex size-9 shrink-0 items-center justify-center rounded-xl",
						resource.sufficient ? "bg-black/10" : "bg-red-500/10",
					].join(" ")}
				>
					<img src={resource.icon} alt="" className="size-6 object-contain" />
				</div>

				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-[var(--sl-text)]">
						{resource.label}
					</p>
				</div>

				{resource.sufficient ? (
					<CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
				) : (
					<AlertTriangle className="size-4 shrink-0 text-red-400" />
				)}
			</div>

			{/* REQUIRED / INVENTORY */}

			<div className="mt-3 grid grid-cols-2 gap-2">
				<div className="rounded-xl bg-black/10 px-3 py-2">
					<p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
						Required
					</p>

					<p className="mt-1 text-sm font-bold text-[var(--sl-text)]">
						{formatResourceAmount(resource.required)}
					</p>
				</div>

				<div
					className={[
						"rounded-xl px-3 py-2",
						resource.sufficient ? "bg-emerald-500/5" : "bg-red-500/5",
					].join(" ")}
				>
					<p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
						Your Inventory
					</p>

					<p
						className={[
							"mt-1 text-sm font-bold",
							resource.sufficient ? "text-emerald-400" : "text-red-400",
						].join(" ")}
					>
						{formatResourceAmount(resource.available)}
					</p>
				</div>
			</div>

			{/* STATUS */}

			<div className="mt-2 flex items-center justify-between gap-2">
				<span
					className={[
						"text-xs font-medium",
						resource.sufficient ? "text-emerald-400" : "text-red-400",
					].join(" ")}
				>
					{resource.sufficient ? "Available" : "Insufficient"}
				</span>

				{!resource.sufficient && (
					<span className="text-xs font-medium text-red-400">
						Need {formatResourceAmount(Math.abs(difference))} more
					</span>
				)}
			</div>
		</div>
	);
}

/* ================================================================
   COMPONENT
   ================================================================ */

export default function GearResult({
	result,
	history,
	entryId,
	completed = false,
	onCompleted,
	title,
	showAddButton = false,
	onAddItem,
}: GearResultProps) {
	/* ================================================================
	   CATEGORY
	=============================================================== */

	const category = NAVIGATION.find((item) => item.id === "gear");

	/* ================================================================
	   INVENTORY
	=============================================================== */

	const inventoryResources = useInventoryStore((state) => state.resources);

	const consumeResources = useInventoryStore((state) => state.consumeResources);

	/* ================================================================
	   LOCAL STATE
	=============================================================== */

	const [showCompleteDialog, setShowCompleteDialog] = useState(false);

	const [isCompleting, setIsCompleting] = useState(false);

	/* ================================================================
	   RESOURCES
	=============================================================== */

	const resources = result.resources ?? {
		Plans: 0,
		Alloy: 0,
		Polish: 0,
		Amber: 0,
	};

	/* ================================================================
	   STATS
	=============================================================== */

	const stats = result.stats ?? {
		attackFrom: 0,
		attackTo: 0,
		attackIncrease: 0,

		defenseFrom: 0,
		defenseTo: 0,
		defenseIncrease: 0,

		deploymentFrom: 0,
		deploymentTo: 0,
		deploymentIncrease: 0,

		powerFrom: 0,
		powerTo: 0,
		powerIncrease: 0,
	};

	/* ================================================================
	   ACTIVE RESOURCE COMPARISON
	=============================================================== */

	const { createResourceItem } = useCompareResources(resources);

	/* ================================================================
	   RESOURCE CHECKS
	=============================================================== */

	const resourceChecks: ResourceCheck[] = [
		{
			key: "Plans",
			label: RESOURCES.Plans.label,
			icon: RESOURCES.Plans.icon,
			inventoryId: RESOURCES.Plans.id,
			required: toNumber(resources.Plans),
			available: toNumber(inventoryResources[RESOURCES.Plans.id]),
			sufficient:
				toNumber(inventoryResources[RESOURCES.Plans.id]) >=
				toNumber(resources.Plans),
		},

		{
			key: "Alloy",
			label: RESOURCES.Alloy.label,
			icon: RESOURCES.Alloy.icon,
			inventoryId: RESOURCES.Alloy.id,
			required: toNumber(resources.Alloy),
			available: toNumber(inventoryResources[RESOURCES.Alloy.id]),
			sufficient:
				toNumber(inventoryResources[RESOURCES.Alloy.id]) >=
				toNumber(resources.Alloy),
		},

		{
			key: "Polish",
			label: RESOURCES.Polish.label,
			icon: RESOURCES.Polish.icon,
			inventoryId: RESOURCES.Polish.id,
			required: toNumber(resources.Polish),
			available: toNumber(inventoryResources[RESOURCES.Polish.id]),
			sufficient:
				toNumber(inventoryResources[RESOURCES.Polish.id]) >=
				toNumber(resources.Polish),
		},

		{
			key: "Amber",
			label: RESOURCES.Amber.label,
			icon: RESOURCES.Amber.icon,
			inventoryId: RESOURCES.Amber.id,
			required: toNumber(resources.Amber),
			available: toNumber(inventoryResources[RESOURCES.Amber.id]),
			sufficient:
				toNumber(inventoryResources[RESOURCES.Amber.id]) >=
				toNumber(resources.Amber),
		},
	];

	const requiredResourceChecks = resourceChecks.filter(
		(resource) => resource.required > 0,
	);

	const hasEnoughResources =
		requiredResourceChecks.length === 0 ||
		requiredResourceChecks.every((resource) => resource.sufficient);

	const insufficientResources = requiredResourceChecks.filter(
		(resource) => !resource.sufficient,
	);

	/* ================================================================
	   OPEN DIALOG
	=============================================================== */

	function handleOpenCompleteDialog() {
		if (completed) {
			return;
		}

		if (!history || !entryId) {
			toast.error("Unable to complete this result", {
				description: "This calculation is not connected to a History entry.",
			});

			return;
		}

		setShowCompleteDialog(true);
	}

	/* ================================================================
	   CLOSE DIALOG
	=============================================================== */

	function handleCloseCompleteDialog() {
		if (isCompleting) {
			return;
		}

		setShowCompleteDialog(false);
	}

	/* ================================================================
	   CONFIRM COMPLETE
	=============================================================== */

	function handleConfirmComplete() {
		if (completed || isCompleting) {
			return;
		}

		if (!history || !entryId) {
			toast.error("Unable to complete this result", {
				description: "This calculation is not connected to a History entry.",
			});

			return;
		}

		/*
		 * Re-check immediately before consuming.
		 */

		if (!hasEnoughResources) {
			toast.error("Not enough resources", {
				description:
					"You don't have enough resources in your inventory to complete this upgrade.",
			});

			return;
		}

		setIsCompleting(true);

		try {
			const requiredResources: Record<string, number> = {
				[RESOURCES.Plans.id]: toNumber(resources.Plans),

				[RESOURCES.Alloy.id]: toNumber(resources.Alloy),

				[RESOURCES.Polish.id]: toNumber(resources.Polish),

				[RESOURCES.Amber.id]: toNumber(resources.Amber),
			};

			/*
			 * Atomic inventory consumption.
			 */

			const consumed = consumeResources(requiredResources);

			if (!consumed) {
				toast.error("Not enough resources", {
					description:
						"Your inventory changed and no longer contains enough resources for this upgrade.",
				});

				return;
			}

			/*
			 * Mark ONLY this History entry completed.
			 */

			onCompleted?.();

			setShowCompleteDialog(false);

			toast.success("Upgrade completed", {
				description: `${
					result.gear ?? "Gear"
				} resources have been deducted from your inventory.`,
			});
		} catch (error) {
			console.error("Failed to complete Gear upgrade:", error);

			toast.error("Failed to complete upgrade", {
				description: "Something went wrong while updating your inventory.",
			});
		} finally {
			setIsCompleting(false);
		}
	}

	/* ================================================================
	   RESOURCE SECTION
	=============================================================== */

	/**
	 * IMPORTANT:
	 *
	 * Active:
	 *   compare required vs inventory
	 *
	 * Completed:
	 *   show required only
	 *
	 * This prevents values such as -88 from appearing
	 * after the resources have already been consumed.
	 */

	const resourceItems = completed
		? [
				createCompletedResourceItem("Plans", resources.Plans),

				createCompletedResourceItem("Alloy", resources.Alloy),

				createCompletedResourceItem("Polish", resources.Polish),

				createCompletedResourceItem("Amber", resources.Amber),
			]
		: [
				createResourceItem("Plans"),

				createResourceItem("Alloy"),

				createResourceItem("Polish"),

				createResourceItem("Amber"),
			];

	/* ================================================================
	   RESULT SECTIONS
	=============================================================== */

	const resultSections = [
		{
			id: "required-resources",

			title: "Required Resources",

			tutorialTarget: completed ? undefined : "bag-compare-result",

			items: resourceItems,
		},

		{
			id: "stats",

			title: "Stats Increase",

			items: [
				{
					id: "attack",

					label: "Attack",

					icon: "/icons/attack.png",

					value: formatStatResult(stats.attackTo, stats.attackIncrease),
				},

				{
					id: "defense",

					label: "Defense",

					icon: "/icons/defense.png",

					value: formatStatResult(stats.defenseTo, stats.defenseIncrease),
				},

				{
					id: "deployment-capacity",

					label: "Deployment Capacity",

					icon: "/icons/deployment.png",

					value: formatDeploymentResult(
						stats.deploymentTo,
						stats.deploymentIncrease,
					),
				},
			],
		},
	];

	/* ================================================================
	   RENDER
	=============================================================== */

	return (
		<>
			<div className="space-y-3">
				{/* ======================================================
				    RESULT CARD
				====================================================== */}

				<div
					className={[
						"transition-all duration-300",
						completed ? "opacity-65" : "opacity-100",
					].join(" ")}
				>
					<CalculatorResult
						title={title}
						categoryTitle={category?.title ?? "Chief Gear"}
						categoryIcon={category?.icon ?? "/category/chief-gear.png"}
						name={result.gear}
						subtitle={
							<span className="inline-flex flex-wrap items-center gap-2">
								<span>{result.fromLevel}</span>

								<ArrowRight
									className="size-3.5 text-[var(--sl-text-muted)]"
									aria-hidden="true"
								/>

								<span>{result.toLevel}</span>
							</span>
						}
						highlightLabel="SvS Points"
						highlightValue={formatSvs(result.svsPoints)}
						createdAt={history?.createdAt}
						updatedAt={history?.updatedAt}
						sections={resultSections}
					/>
				</div>

				{/* ======================================================
				    COMPLETED STATUS / BUTTON
				====================================================== */}

				{history && entryId && (
					<div className="flex justify-end">
						{completed ? (
							<div className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-500/5 px-5 text-sm font-semibold text-emerald-400/80">
								<Check className="size-4" />

								<span>Completed</span>
							</div>
						) : (
							<button
								type="button"
								onClick={handleOpenCompleteDialog}
								className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--sl-input-hover)] px-5 text-sm font-semibold text-[var(--sl-text)] transition-all hover:bg-[var(--sl-hover)] active:scale-[0.98]"
							>
								<span>Completed</span>
							</button>
						)}
					</div>
				)}

				{/* ======================================================
				    ADD MORE ITEMS
				====================================================== */}

				{showAddButton && onAddItem && (
					<button
						type="button"
						onClick={onAddItem}
						className="mt-5 flex h-28 w-full flex-col items-center justify-center gap-2 rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-input-hover)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)]"
					>
						<Plus className="size-5" />

						<span className="text-base font-medium">Add more items</span>
					</button>
				)}
			</div>

			{/* ========================================================
			    COMPLETE DIALOG
			======================================================== */}

			{showCompleteDialog && !completed && (
				<div
					className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
					role="presentation"
					onMouseDown={(event) => {
						if (event.target === event.currentTarget) {
							handleCloseCompleteDialog();
						}
					}}
				>
					<div
						className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[var(--sl-input)] shadow-2xl"
						role="dialog"
						aria-modal="true"
						aria-labelledby="complete-gear-title"
						aria-describedby="complete-gear-description"
					>
						{/* ==================================================
						    HEADER
						================================================== */}

						<div className="flex items-start justify-between gap-4 border-b border-[var(--sl-border)] p-5">
							<div className="flex min-w-0 items-start gap-3">
								<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
									<AlertTriangle className="size-5" />
								</div>

								<div className="min-w-0">
									<h2
										id="complete-gear-title"
										className="text-base font-bold text-[var(--sl-text)]"
									>
										Complete Upgrade?
									</h2>

									<p
										id="complete-gear-description"
										className="mt-1 text-sm leading-5 text-[var(--sl-text-muted)]"
									>
										The required resources will be deducted from your inventory.
									</p>
								</div>
							</div>

							<button
								type="button"
								onClick={handleCloseCompleteDialog}
								disabled={isCompleting}
								className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)] disabled:pointer-events-none disabled:opacity-50"
								aria-label="Close"
							>
								<X className="size-4" />
							</button>
						</div>

						{/* ==================================================
						    BODY
						================================================== */}

						<div className="p-5">
							{/* UPGRADE SUMMARY */}

							<div className="rounded-2xl bg-black/10 p-4">
								<div className="flex items-center justify-between gap-4">
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold text-[var(--sl-text)]">
											{result.gear ?? "Chief Gear"}
										</p>

										<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
											{result.fromLevel} → {result.toLevel}
										</p>
									</div>

									<div className="shrink-0 text-right">
										<p className="text-xs text-[var(--sl-text-muted)]">
											Required
										</p>

										<p className="mt-1 text-sm font-bold text-amber-400">
											Resources
										</p>
									</div>
								</div>
							</div>

							{/* RESOURCE LIST */}

							<div className="mt-5">
								<div className="mb-3 flex items-center justify-between gap-3">
									<p className="text-xs font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
										Resources to deduct
									</p>

									{hasEnoughResources ? (
										<div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
											<CheckCircle2 className="size-3.5" />

											<span>All available</span>
										</div>
									) : (
										<div className="flex items-center gap-1.5 text-xs font-semibold text-red-400">
											<AlertTriangle className="size-3.5" />

											<span>Insufficient</span>
										</div>
									)}
								</div>

								<div className="space-y-2">
									{requiredResourceChecks.map((resource) => (
										<ConfirmResourceRow
											key={resource.inventoryId}
											resource={resource}
										/>
									))}
								</div>
							</div>

							{/* INSUFFICIENT WARNING */}

							{!hasEnoughResources && (
								<div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/5 p-3.5">
									<div className="flex gap-3">
										<AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />

										<div className="min-w-0">
											<p className="text-sm font-semibold text-red-400">
												Not enough resources
											</p>

											<p className="mt-1 text-xs leading-5 text-red-300/80">
												You need more resources in your inventory before this
												upgrade can be completed.
											</p>

											<div className="mt-2 space-y-1">
												{insufficientResources.map((resource) => (
													<p
														key={resource.inventoryId}
														className="text-xs font-medium text-red-300"
													>
														{resource.label}: need{" "}
														{formatResourceAmount(
															resource.required - resource.available,
														)}{" "}
														more
													</p>
												))}
											</div>
										</div>
									</div>
								</div>
							)}

							{/* AVAILABLE */}

							{hasEnoughResources && (
								<div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-3.5">
									<div className="flex gap-3">
										<CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />

										<p className="text-xs leading-5 text-emerald-300">
											You have enough resources. Clicking Confirm & Complete
											will deduct the required amount from your inventory.
										</p>
									</div>
								</div>
							)}

							{/* ACTIONS */}

							<div className="mt-5 grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={handleCloseCompleteDialog}
									disabled={isCompleting}
									className="h-11 rounded-xl bg-[var(--sl-input-hover)] px-4 text-sm font-semibold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-hover)] disabled:pointer-events-none disabled:opacity-50"
								>
									Cancel
								</button>

								<button
									type="button"
									onClick={handleConfirmComplete}
									disabled={isCompleting || !hasEnoughResources}
									className={[
										"h-11 rounded-xl px-4 text-sm font-bold transition-all",

										hasEnoughResources && !isCompleting
											? "bg-emerald-500 text-white hover:brightness-110 active:scale-[0.98]"
											: "cursor-not-allowed bg-emerald-500/20 text-white/40",
									].join(" ")}
								>
									{isCompleting ? (
										<span className="inline-flex items-center justify-center gap-2">
											<span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
											Processing...
										</span>
									) : (
										"Confirm & Complete"
									)}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
