// src/features/history/components/HistoryPanel.tsx

"use client";

import { useMemo, useState } from "react";
import type {
	CalculationHistoryItem,
	CalculationModule,
} from "@/features/inventory/store/history/types";
import { filterHistory } from "@/features/utils/historyFilters";
import HistoryItem from "./HistoryItem";
import HistorySearch from "@/features/inventory/components/HistorySearch";

type HistoryPanelProps = {
	items: CalculationHistoryItem[];
	activeId?: string | null;
	module?: CalculationModule | "all";
	title?: string;

	compact?: boolean;
	hideSearch?: boolean;
	hideHeader?: boolean;

	onSelect: (item: CalculationHistoryItem) => void;
	onPin: (id: string) => void;
	onDelete: (id: string) => void;
	onClear?: () => void;
};


export default function HistoryPanel({
	items,
	activeId,
	module = "all",
	title = "History",
	compact = false,
	hideSearch = false,
	hideHeader = false,
	onSelect,
	onDelete,
	onPin,
	onClear,
}: HistoryPanelProps) {
	const [search, setSearch] = useState("");

	const filteredItems = useMemo(() => {
		return filterHistory({
			items,
			search,
			module,
		});
	}, [items, search, module]);

	return (
	<aside
		className={
			compact
				? "space-y-2"
				: "rounded-2xl border border-white/10 bg-white/[0.03] p-4"
		}
	>
		{!hideHeader && (
			<div className="mb-4 flex items-center justify-between gap-3">
				<div>
					<h2 className="text-sm font-bold text-white">{title}</h2>
					<p className="text-xs text-white/40">
						{filteredItems.length} saved calculation
					</p>
				</div>

				{onClear && filteredItems.length > 0 && (
					<button
						type="button"
						onClick={onClear}
						className="rounded-lg px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
					>
						Clear
					</button>
				)}
			</div>
		)}

		{!hideSearch && (
			<HistorySearch value={search} onChange={setSearch} />
		)}

		<div
			className={
				compact
					? "flex flex-col gap-2"
					: "mt-4 flex max-h-[520px] flex-col gap-2 overflow-y-auto pr-1"
			}
		>
			{filteredItems.length > 0 ? (
				filteredItems.map((item) => (
					<HistoryItem
						key={item.id}
						item={item}
						isActive={activeId === item.id}
						onSelect={onSelect}
						onDelete={onDelete}
						onPin={onPin}
					/>
				))
			) : (
				<div className="rounded-xl border border-solid border-[color:var(--sl-border)] p-4 text-center text-sm text-[var(--sl-text-muted)]">
					No history found
				</div>
			)}
		</div>
	</aside>
);
}