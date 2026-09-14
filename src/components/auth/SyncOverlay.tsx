"use client";

import {
	Check,
	Database,
	LoaderCircle,
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

function SyncRow({
	icon,
	label,
	status,
}: {
	icon: React.ReactNode;
	label: string;
	status: SyncStatus;
}) {
	return (
		<div className="flex items-center justify-between gap-4 rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface-hover)] px-3.5 py-3">
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-surface)] text-[var(--sl-text-muted)]">
					{icon}
				</div>

				<span className="truncate text-sm font-medium text-[var(--sl-text)]">
					{label}
				</span>
			</div>

			<div className="shrink-0">
				{status === "complete" ? (
					<div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
						<Check className="size-4" />
					</div>
				) : status === "syncing" ? (
					<LoaderCircle className="size-5 animate-spin text-[var(--sl-primary)]" />
				) : (
					<div className="size-2 rounded-full bg-[var(--sl-text-muted)]/40" />
				)}
			</div>
		</div>
	);
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

	const complete =
		historyStatus === "complete" &&
		inventoryStatus === "complete";

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
			<div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.35)] sm:p-6">
				<div className="mb-6 text-center">
					<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-[var(--sl-primary)]/10 text-[var(--sl-primary)]">
						{complete ? (
							<Check className="size-7" />
						) : (
							<LoaderCircle className="size-7 animate-spin" />
						)}
					</div>

					<h2 className="text-lg font-bold text-[var(--sl-text)]">
						{complete
							? "Sync complete"
							: "Syncing your data"}
					</h2>

					<p className="mt-1 text-sm text-[var(--sl-text-muted)]">
						{complete
							? "Your data is ready."
							: "Updating your account data..."}
					</p>
				</div>

				<div className="space-y-2.5">
					<SyncRow
						icon={
							<Database className="size-4" />
						}
						label="History"
						status={
							historyStatus
						}
					/>

					<SyncRow
						icon={
							<Database className="size-4" />
						}
						label="Inventory"
						status={
							inventoryStatus
						}
					/>
				</div>

				<div className="mt-5">
					<div className="mb-2 flex items-center justify-between text-xs">
						<span className="font-medium text-[var(--sl-text-muted)]">
							Sync progress
						</span>

						<span className="font-semibold text-[var(--sl-text)]">
							{progress}%
						</span>
					</div>

					<div className="h-2 overflow-hidden rounded-full bg-[var(--sl-surface-hover)]">
						<div
							className="h-full rounded-full bg-[var(--sl-primary)] transition-all duration-500 ease-out"
							style={{
								width: `${progress}%`,
							}}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}