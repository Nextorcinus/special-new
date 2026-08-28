"use client";

import { Clock3, Flame, Percent, Zap } from "lucide-react";

import type { RfcHistoryItem } from "../type";

type RfcHistoryProps = {
	history: RfcHistoryItem[];
};

function formatNumber(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "0";
	}

	return new Intl.NumberFormat("en-US").format(
		Math.max(0, Math.floor(number)),
	);
}

export default function RfcHistory({ history }: RfcHistoryProps) {
	const safeHistory = Array.isArray(history) ? history : [];

	const reversedHistory = [...safeHistory].reverse();

	const totalRfc = safeHistory.reduce(
		(total, item) => total + Number(item.rfc ?? 0),
		0,
	);

	const totalFc = safeHistory.reduce(
		(total, item) => total + Number(item.fc ?? 0),
		0,
	);

	return (
		<div className="w-full min-w-0">
			<div className="flex min-w-0 items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-input)]">
					<Clock3 className="size-5 text-[var(--sl-text)]" />
				</div>

				<div className="min-w-0">
					<h2 className="text-sm font-bold text-[var(--sl-text)]">
						Conversion History
					</h2>

					<p className="mt-1 max-w-lg text-xs leading-5 text-[var(--sl-text-muted)]">
						Review every RFC conversion performed in this session.
					</p>
				</div>
			</div>

			{safeHistory.length === 0 ? (
				<div className="mt-5 flex min-h-[150px] w-full items-center justify-center rounded-2xl border border-dashed border-[var(--sl-border)] bg-[var(--sl-input)] p-5 text-center">
					<div className="min-w-0">
						<Clock3 className="mx-auto size-7 text-[var(--sl-text-muted)]" />

						<p className="mt-3 text-sm font-bold text-[var(--sl-text)]">
							No conversions yet
						</p>

						<p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-[var(--sl-text-muted)]">
							Your conversion results will appear here after you perform an
							RFC conversion.
						</p>
					</div>
				</div>
			) : (
				<>
					<div className="mt-5 flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-[var(--sl-input)] px-4 py-3">
						<div className="flex min-w-0 items-center gap-2">
							<Clock3 className="size-4 shrink-0 text-[var(--sl-text-muted)]" />

							<div className="min-w-0">
								<p className="truncate text-xs font-bold text-[var(--sl-text)]">
									{safeHistory.length}{" "}
									{safeHistory.length === 1
										? "Conversion"
										: "Conversions"}
								</p>

								<p className="truncate text-[10px] text-[var(--sl-text-muted)]">
									Current session
								</p>
							</div>
						</div>

						<div className="shrink-0 text-right">
							<p className="text-xs font-bold text-[var(--sl-text)]">
								+{formatNumber(totalRfc)} RFC
							</p>

							<p className="mt-0.5 text-[10px] text-[var(--sl-text-muted)]">
								{formatNumber(totalFc)} FC used
							</p>
						</div>
					</div>

					<div className="mt-3 w-full min-w-0 overflow-hidden rounded-2xl bg-[var(--sl-input)]">
						<div className="flex items-center justify-between gap-3 border-b border-[var(--sl-border)] px-4 py-3">
							<p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
								Recent Conversions
							</p>

							<p className="shrink-0 text-[10px] font-semibold text-[var(--sl-text-muted)]">
								Latest first
							</p>
						</div>

						<div className="max-h-[480px] overflow-y-auto">
							<div className="divide-y divide-[var(--sl-border)]">
								{reversedHistory.map((item, index) => {
									const isDiscounted = Boolean(item.discounted);

									const displayNumber =
										safeHistory.length - index;

									return (
										<div
											key={`${item.tier}-${item.fc}-${item.rfc}-${item.discounted}-${index}`}
											className="w-full min-w-0 px-4 py-3 transition-colors hover:bg-[var(--sl-active)]"
										>
											<div className="flex min-w-0 items-center gap-3">
												<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-surface)] text-[10px] font-bold text-[var(--sl-text-muted)]">
													#{displayNumber}
												</div>

												<div className="min-w-0 flex-1">
													<div className="flex min-w-0 items-center gap-2">
														<p className="truncate text-sm font-bold text-[var(--sl-text)]">
															Tier {item.tier}
														</p>

														{isDiscounted && (
															<span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--primary)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[var(--primary)]">
																<Percent className="size-2.5" />
																50% OFF
															</span>
														)}
													</div>

													<div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
														<span className="inline-flex items-center gap-1 text-[10px] text-[var(--sl-text-muted)]">
															<Flame className="size-3 shrink-0" />
															-{formatNumber(item.fc)} FC
														</span>

														<span className="text-[10px] text-[var(--sl-text-muted)]">
															•
														</span>

														<span className="inline-flex items-center gap-1 text-[10px] text-[var(--sl-text-muted)]">
															<Zap className="size-3 shrink-0" />
															+{formatNumber(item.rfc)} RFC
														</span>
													</div>
												</div>

												<div className="shrink-0 text-right">
													<p className="text-sm font-bold text-[var(--sl-text)]">
														+{formatNumber(item.rfc)}
													</p>

													<p className="mt-1 text-[9px] text-[var(--sl-text-muted)]">
														RFC
													</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>

						<div className="flex min-w-0 items-center justify-between gap-3 border-t border-[var(--sl-border)] px-4 py-3">
							<div className="min-w-0">
								<p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
									Session Total
								</p>
							</div>

							<div className="shrink-0 text-right">
								<p className="text-xs font-bold text-[var(--sl-text)]">
									+{formatNumber(totalRfc)} RFC
								</p>

								<p className="mt-0.5 text-[10px] text-[var(--sl-text-muted)]">
									{formatNumber(totalFc)} FC
								</p>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}