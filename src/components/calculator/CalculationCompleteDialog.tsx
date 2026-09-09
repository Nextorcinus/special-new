"use client";

import {
	AlertTriangle,
	ArrowRight,
	CheckCircle2,
	X,
} from "lucide-react";

import { formatNumber } from "@/components/calculator/useCompareResources";
import { parseShortNumber } from "@/lib/number";

import type {
	CalculationCompleteDialogProps,
} from "./calculation-complete.types";

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

function formatAmount(value: unknown): string {
	return formatNumber(toNumber(value));
}

function CompactResourceRow({
	resource,
}: {
	resource: CalculationCompleteDialogProps["resources"][number];
}) {
	const difference = resource.available - resource.required;

	return (
		<div
			className={[
				"rounded-xl border p-2.5",
				resource.sufficient
					? "border-[var(--sl-border)] bg-black/10"
					: "border-red-400/30 bg-red-500/5",
			].join(" ")}
		>
			<div className="flex items-center gap-2.5">
				<div
					className={[
						"flex size-8 shrink-0 items-center justify-center rounded-lg",
						resource.sufficient
							? "bg-black/10"
							: "bg-red-500/10",
					].join(" ")}
				>
					{resource.icon ? (
						<img
							src={resource.icon}
							alt=""
							className="size-5 object-contain"
						/>
					) : (
						<AlertTriangle
							className={[
								"size-4",
								resource.sufficient
									? "text-[var(--sl-text-muted)]"
									: "text-red-400",
							].join(" ")}
						/>
					)}
				</div>

				<p className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--sl-text)]">
					{resource.label}
				</p>

				{resource.sufficient ? (
					<CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
				) : (
					<AlertTriangle className="size-4 shrink-0 text-red-400" />
				)}
			</div>

			<div className="mt-2 grid grid-cols-2 gap-2">
				<div className="rounded-lg bg-black/10 px-2.5 py-1.5">
					<p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
						Required
					</p>

					<p className="mt-0.5 truncate text-xs font-bold text-[var(--sl-text)]">
						{formatAmount(resource.required)}
					</p>
				</div>

				<div
					className={[
						"rounded-lg px-2.5 py-1.5",
						resource.sufficient
							? "bg-emerald-500/5"
							: "bg-red-500/5",
					].join(" ")}
				>
					<p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
						Inventory
					</p>

					<p
						className={[
							"mt-0.5 truncate text-xs font-bold",
							resource.sufficient
								? "text-emerald-400"
								: "text-red-400",
						].join(" ")}
					>
						{formatAmount(resource.available)}
					</p>
				</div>
			</div>

			<div className="mt-1.5 flex items-center justify-between gap-2">
				<span
					className={[
						"text-[10px] font-semibold",
						resource.sufficient
							? "text-emerald-400"
							: "text-red-400",
					].join(" ")}
				>
					{resource.sufficient ? "Available" : "Insufficient"}
				</span>

				{!resource.sufficient && (
					<span className="truncate text-[10px] font-semibold text-red-400">
						Need {formatAmount(Math.abs(difference))} more
					</span>
				)}
			</div>
		</div>
	);
}

export default function CalculationCompleteDialog({
	open,
	title = "Complete Upgrade?",
	subtitle = "The required resources will be deducted from your inventory.",
	from,
	target,
	resources,
	isCompleting = false,
	hasEnoughResources,
	onCancel,
	onConfirm,
}: CalculationCompleteDialogProps) {
	if (!open) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-4"
			role="presentation"
			onMouseDown={(event) => {
				if (event.target === event.currentTarget) {
					onCancel();
				}
			}}
		>
			<div
				className="flex max-h-[calc(100dvh-24px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-input)] shadow-2xl sm:max-h-[calc(100dvh-32px)] sm:rounded-3xl"
				role="dialog"
				aria-modal="true"
				aria-labelledby="calculation-complete-title"
				aria-describedby="calculation-complete-description"
			>
				<div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--sl-border)] px-4 py-3.5 sm:px-5 sm:py-4">
					<div className="flex min-w-0 items-start gap-2.5">
						<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 sm:size-9">
							<AlertTriangle className="size-4 sm:size-5" />
						</div>

						<div className="min-w-0">
							<h2
								id="calculation-complete-title"
								className="text-sm font-bold text-[var(--sl-text)] sm:text-base"
							>
								{title}
							</h2>

							<p
								id="calculation-complete-description"
								className="mt-0.5 text-[10px] leading-4 text-[var(--sl-text-muted)] sm:text-xs"
							>
								{subtitle}
							</p>
						</div>
					</div>

					<button
						type="button"
						onClick={onCancel}
						disabled={isCompleting}
						className="flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)] disabled:pointer-events-none disabled:opacity-50"
						aria-label="Close"
					>
						<X className="size-4" />
					</button>
				</div>

				<div className="min-h-0 flex-1 overflow-y-auto px-4 py-3.5 sm:px-5 sm:py-4">
					<div className="rounded-xl bg-black/10 px-3 py-2.5 sm:rounded-2xl sm:p-3">
						<div className="flex items-center justify-between gap-3">
							<div className="min-w-0">
								<p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
									Calculation
								</p>

								<div className="mt-1.5 flex items-center gap-2">
									<div>
										<p className="text-[9px] uppercase tracking-wide text-[var(--sl-text-muted)]">
											From
										</p>

										<p className="text-xs font-bold text-[var(--sl-text)] sm:text-sm">
											{from ?? "-"}
										</p>
									</div>

									<ArrowRight className="mt-3 size-3.5 text-[var(--sl-text-muted)]" />

									<div>
										<p className="text-[9px] uppercase tracking-wide text-[var(--sl-text-muted)]">
											Target
										</p>

										<p className="text-xs font-bold text-amber-400 sm:text-sm">
											{target ?? "-"}
										</p>
									</div>
								</div>
							</div>

							<div className="shrink-0 text-right">
								<p className="text-[9px] uppercase tracking-wide text-[var(--sl-text-muted)]">
									Resources
								</p>

								<p className="mt-0.5 text-xs font-bold text-amber-400">
									{resources.length}
								</p>
							</div>
						</div>
					</div>

					<div className="mt-4">
						<div className="mb-2.5 flex items-center justify-between gap-3">
							<p className="text-[10px] font-bold uppercase tracking-wide text-[var(--sl-text-muted)]">
								Resources to deduct
							</p>

							{hasEnoughResources ? (
								<div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
									<CheckCircle2 className="size-3.5" />
									<span>All available</span>
								</div>
							) : (
								<div className="flex items-center gap-1 text-[10px] font-semibold text-red-400">
									<AlertTriangle className="size-3.5" />
									<span>Insufficient</span>
								</div>
							)}
						</div>

						<div className="space-y-1.5">
							{resources.map((resource) => (
								<CompactResourceRow
									key={resource.resourceId}
									resource={resource}
								/>
							))}
						</div>
					</div>

					{!hasEnoughResources && (
						<div className="mt-3 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-500/5 px-3 py-2.5">
							<AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-red-400" />

							<div className="min-w-0">
								<p className="text-[10px] font-semibold text-red-400">
									Not enough resources
								</p>

								<p className="mt-0.5 text-[10px] leading-4 text-red-300/80">
									You need more resources before this upgrade can be completed.
								</p>
							</div>
						</div>
					)}

					{hasEnoughResources && (
						<div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/5 px-3 py-2.5">
							<CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />

							<p className="text-[10px] leading-4 text-emerald-300">
								You have enough resources to complete this upgrade.
							</p>
						</div>
					)}
				</div>

				<div className="grid shrink-0 grid-cols-2 gap-2.5 border-t border-[var(--sl-border)] px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
					<button
						type="button"
						onClick={onCancel}
						disabled={isCompleting}
						className="h-10 rounded-xl bg-[var(--sl-input-hover)] px-3 text-xs font-semibold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-hover)] disabled:pointer-events-none disabled:opacity-50 sm:h-11 sm:text-sm"
					>
						Cancel
					</button>

					<button
						type="button"
						onClick={onConfirm}
						disabled={isCompleting || !hasEnoughResources}
						className={[
							"h-10 rounded-xl px-3 text-xs font-bold transition-all sm:h-11 sm:text-sm",
							hasEnoughResources && !isCompleting
								? "bg-emerald-500 text-black hover:brightness-110 active:scale-[0.98]"
								: "cursor-not-allowed bg-emerald-500/20 text-white/40",
						].join(" ")}
					>
						{isCompleting ? (
							<span className="inline-flex items-center justify-center gap-1.5">
								<span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
								Processing...
							</span>
						) : (
							"Confirm & Complete"
						)}
					</button>
				</div>
			</div>
		</div>
	);
}