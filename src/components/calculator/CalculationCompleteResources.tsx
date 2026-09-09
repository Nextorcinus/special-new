"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type {
	CalculationCompleteResourcesProps,
} from "./calculation-complete.types";

function formatAmount(value: number): string {
	if (!Number.isFinite(value)) {
		return "0";
	}

	if (value >= 1_000_000_000) {
		return `${(value / 1_000_000_000).toFixed(2)}B`;
	}

	if (value >= 1_000_000) {
		return `${(value / 1_000_000).toFixed(2)}M`;
	}

	if (value >= 1_000) {
		return `${(value / 1_000).toFixed(2)}K`;
	}

	return value.toLocaleString("en-US", {
		maximumFractionDigits: 2,
	});
}

export default function CalculationCompleteResources({
	resources,
	showInventory = true,
	showStatus = true,
	className,
}: CalculationCompleteResourcesProps) {
	return (
		<div className={className}>
			<div className="space-y-2">
				{resources.map((resource) => {
					const missing = Math.max(
						resource.required -
							resource.available,
						0,
					);

					return (
						<div
							key={resource.resourceId}
							className={[
								"rounded-2xl border p-3",
								showInventory &&
								!resource.sufficient
									? "border-red-400/30 bg-red-500/5"
									: "border-[var(--sl-border)] bg-black/10",
							].join(" ")}
						>
							<div className="flex items-center gap-3">
								<div
									className={[
										"flex size-9 shrink-0 items-center justify-center rounded-xl",
										showInventory &&
										!resource.sufficient
											? "bg-red-500/10"
											: "bg-black/10",
									].join(" ")}
								>
									<img
										src={resource.icon}
										alt=""
										className="size-6 object-contain"
									/>
								</div>

								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-medium text-[var(--sl-text)]">
										{resource.label}
									</p>
								</div>

								{showStatus &&
									showInventory &&
									(resource.sufficient ? (
										<CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
									) : (
										<AlertTriangle className="size-4 shrink-0 text-red-400" />
									))}
							</div>

							{showInventory ? (
								<div className="mt-3 grid grid-cols-2 gap-2">
									<div className="rounded-xl bg-black/10 px-3 py-2">
										<p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
											Required
										</p>

										<p className="mt-1 text-sm font-bold text-[var(--sl-text)]">
											{formatAmount(
												resource.required,
											)}
										</p>
									</div>

									<div
										className={[
											"rounded-xl px-3 py-2",
											resource.sufficient
												? "bg-emerald-500/5"
												: "bg-red-500/5",
										].join(" ")}
									>
										<p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
											Your Inventory
										</p>

										<p
											className={[
												"mt-1 text-sm font-bold",
												resource.sufficient
													? "text-emerald-400"
													: "text-red-400",
											].join(" ")}
										>
											{formatAmount(
												resource.available,
											)}
										</p>
									</div>
								</div>
							) : (
								<div className="mt-3">
									<p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
										Required
									</p>

									<p className="mt-1 text-sm font-bold text-[var(--sl-text)]">
										{formatAmount(
											resource.required,
										)}
									</p>
								</div>
							)}

							{showStatus &&
								showInventory && (
									<div className="mt-2 flex items-center justify-between gap-2">
										<span
											className={[
												"text-xs font-medium",
												resource.sufficient
													? "text-emerald-400"
													: "text-red-400",
											].join(" ")}
										>
											{resource.sufficient
												? "Available"
												: "Insufficient"}
										</span>

										{!resource.sufficient &&
											missing > 0 && (
												<span className="text-xs font-medium text-red-400">
													Need{" "}
													{formatAmount(
														missing,
													)}{" "}
													more
												</span>
											)}
									</div>
								)}
						</div>
					);
				})}
			</div>
		</div>
	);
}