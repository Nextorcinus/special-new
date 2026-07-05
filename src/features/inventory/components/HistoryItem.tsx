"use client";

import { Pin, PinOff, Trash2 } from "lucide-react";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";

type HistoryItemProps = {
	item: CalculationHistoryItem;
	isActive?: boolean;
	onSelect: (item: CalculationHistoryItem) => void;
	onDelete: (id: string) => void;
	onPin: (id: string) => void;
};

export default function HistoryItem({
	item,
	isActive,
	onSelect,
	onDelete,
	onPin,
}: HistoryItemProps) {
	const date = new Date(item.updatedAt ?? item.createdAt).toLocaleString(
		"en-US",
		{
			month: "short",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		}
	);

	return (
		<div
			onClick={() => onSelect(item)}
			className={`cursor-pointer rounded-xl border p-3 transition ${
				isActive
					? "border-yellow-400/60 bg-yellow-400/10"
					: "border-white/10 bg-white/4 hover:bg-white/7"
			}`}
		>
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0 flex-1">
					<h3 className="truncate text-sm font-semibold text-white">
						{item.title}
					</h3>

					{item.subtitle && (
						<p className="mt-1 truncate text-xs font-medium text-teal-400">
							{item.subtitle}
						</p>
					)}

					<p className="mt-1 text-[11px] text-white/35">{date}</p>
				</div>

				<div className="flex shrink-0 items-center gap-1">
					<button
						type="button"
						onClick={(event) => {
							event.stopPropagation();
							onPin(item.id);
						}}
						className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"
					>
						{item.isPinned ? (
							<PinOff className="h-4 w-4" />
						) : (
							<Pin className="h-4 w-4" />
						)}
					</button>

					<button
						type="button"
						onClick={(event) => {
							event.stopPropagation();
							onDelete(item.id);
						}}
						className="rounded-md p-2 text-red-400 hover:bg-red-500/10"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			</div>
		</div>
	);
}