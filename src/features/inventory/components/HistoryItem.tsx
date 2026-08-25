"use client";

import {
	Pin,
	PinOff,
	Trash2,
} from "lucide-react";

import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";

type HistoryItemProps = {
	item: CalculationHistoryItem;
	isActive?: boolean;
	onSelect: (
		item: CalculationHistoryItem,
	) => void;
	onDelete: (id: string) => void;
	onPin: (id: string) => void;
};

export default function HistoryItem({
	item,
	isActive = false,
	onSelect,
	onDelete,
	onPin,
}: HistoryItemProps) {
	const date = new Date(
		item.updatedAt ?? item.createdAt,
	).toLocaleString("en-US", {
		month: "short",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	});

	function handleSelect() {
		onSelect(item);
	}

	function handlePin(
		event: React.MouseEvent<HTMLButtonElement>,
	) {
		event.preventDefault();
		event.stopPropagation();

		onPin(item.id);
	}

	function handleDelete(
		event: React.MouseEvent<HTMLButtonElement>,
	) {
		event.preventDefault();
		event.stopPropagation();

		onDelete(item.id);
	}

	return (
		<div
			className={`rounded-xl border p-3 transition-colors ${
				isActive
					? "border-yellow-400/60 bg-yellow-400/10"
					: "border-[var(--sl-border)] bg-[var(--sl-surface)] hover:bg-[var(--sl-hover)]"
			}`}
		>
			<div className="flex items-start justify-between gap-2">
				<button
					type="button"
					onClick={handleSelect}
					className="min-w-0 flex-1 cursor-pointer space-y-2 text-left"
				>
					<h3 className="truncate text-sm font-semibold text-[var(--sl-text)]">
						{item.title}
					</h3>

					{item.subtitle && (
						<p className="truncate text-xs font-medium text-[var(--sl-text-muted)]">
							{item.subtitle}
						</p>
					)}

					<p className="text-[11px] text-[var(--sl-text-muted)]">
						{date}
					</p>
				</button>

				<div className="flex shrink-0 items-center gap-1">
					<button
						type="button"
						onClick={handlePin}
						className="rounded-md p-2 text-[var(--sl-primary)] transition-colors hover:bg-[var(--sl-hover)]"
						aria-label={
							item.isPinned
								? "Unpin history"
								: "Pin history"
						}
					>
						{item.isPinned ? (
							<PinOff className="h-4 w-4 text-amber-600" />
						) : (
							<Pin className="h-4 w-4" />
						)}
					</button>

					<button
						type="button"
						onClick={handleDelete}
						className="rounded-md p-2 text-[var(--sl-danger)] transition-colors hover:bg-red-500/10"
						aria-label="Delete history"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}