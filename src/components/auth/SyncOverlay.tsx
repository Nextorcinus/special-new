"use client";

import {
	Check,
	Database,
	Package,
	RefreshCw,
} from "lucide-react";

type SyncStatus =
	| "waiting"
	| "syncing"
	| "complete";

type SyncOverlayProps = {
	open: boolean;
	historyStatus: SyncStatus;
	inventoryStatus: SyncStatus;
};

function StatusIcon({
	status,
	type,
}: {
	status: SyncStatus;
	type: "history" | "inventory";
}) {
	if (status === "complete") {
		return (
			<span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
				<Check className="size-4" />
			</span>
		);
	}

	if (status === "syncing") {
		return (
			<span className="flex size-9 items-center justify-center rounded-xl bg-[var(--sl-primary)]/10 text-[var(--sl-primary)]">
				<RefreshCw className="size-4 animate-spin" />
			</span>
		);
	}

	return (
		<span className="flex size-9 items-center justify-center rounded-xl bg-[var(--sl-surface-hover)] text-[var(--sl-text-muted)]">
			{type === "history" ? (
				<Database className="size-4" />
			) : (
				<Package className="size-4" />
			)}
		</span>
	);
}

function getProgress(
	historyStatus: SyncStatus,
	inventoryStatus: SyncStatus,
) {
	let progress = 0;

	if (historyStatus === "syncing") {
		progress += 25;
	}

	if (historyStatus === "complete") {
		progress += 50;
	}

	if (inventoryStatus === "syncing") {
		progress += 25;
	}

	if (inventoryStatus === "complete") {
		progress += 50;
	}

	return Math.min(progress, 100);
}

export default function SyncOverlay({
	open,
	historyStatus,
	inventoryStatus,
}: SyncOverlayProps) {
	if (!open) {
		return null;
	}

	const progress = getProgress(
		historyStatus,
		inventoryStatus,
	);

	const completed =
		historyStatus === "complete" &&
		inventoryStatus === "complete";

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 backdrop-blur-md">
			<div className="w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
				<div className="p-6">
					<div className="mb-6 flex items-center gap-4">
						<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-primary)]/10">
							{completed ? (
								<Check className="size-6 text-emerald-500" />
							) : (
								<RefreshCw className="size-6 animate-spin text-[var(--sl-primary)]" />
							)}
						</div>

						<div className="min-w-0">
							<h2 className="text-base font-semibold text-[var(--sl-text)]">
								{completed
									? "Sync complete"
									: "Syncing your data"}
							</h2>

							<p className="mt-0.5 text-sm text-[var(--sl-text-muted)]">
								{completed
									? "Your account data is ready."
									: "Getting your latest data ready..."}
							</p>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-3 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface-hover)] p-3">
							<StatusIcon
								status={
									historyStatus
								}
								type="history"
							/>

							<div className="min-w-0 flex-1">
								<p className="text-sm font-semibold text-[var(--sl-text)]">
									History
								</p>

								<p className="text-xs text-[var(--sl-text-muted)]">
									{historyStatus ===
									"complete"
										? "Synced"
										: historyStatus ===
											  "syncing"
											? "Syncing..."
											: "Waiting..."}
								</p>
							</div>

							{historyStatus ===
								"complete" && (
								<span className="text-xs font-semibold text-emerald-500">
									Done
								</span>
							)}
						</div>

						<div className="flex items-center gap-3 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface-hover)] p-3">
							<StatusIcon
								status={
									inventoryStatus
								}
								type="inventory"
							/>

							<div className="min-w-0 flex-1">
								<p className="text-sm font-semibold text-[var(--sl-text)]">
									Inventory
								</p>

								<p className="text-xs text-[var(--sl-text-muted)]">
									{inventoryStatus ===
									"complete"
										? "Synced"
										: inventoryStatus ===
											  "syncing"
											? "Syncing..."
											: "Waiting..."}
								</p>
							</div>

							{inventoryStatus ===
								"complete" && (
								<span className="text-xs font-semibold text-emerald-500">
									Done
								</span>
							)}
						</div>
					</div>

					<div className="mt-6">
						<div className="mb-2 flex items-center justify-between">
							<span className="text-xs font-medium text-[var(--sl-text-muted)]">
								{completed
									? "100%"
									: "Syncing"}
							</span>

							<span className="text-xs font-semibold text-[var(--sl-text)]">
								{progress}%
							</span>
						</div>

						<div className="h-2 overflow-hidden rounded-full bg-[var(--sl-surface-hover)]">
							<div
								className="h-full rounded-full bg-[var(--sl-primary)] transition-[width] duration-500 ease-out"
								style={{
									width: `${progress}%`,
								}}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}