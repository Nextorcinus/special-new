// RecentHistorySection.tsx

"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

import HistoryPanel from "@/features/inventory/components/HistoryPanel";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import { getHistoryRoute } from "@/features/inventory/store/history/historyRoutes";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";

type HistoryStoreState = ReturnType<typeof useHistoryStore.getState>;

export default function RecentHistorySection() {
	const router = useRouter();

	const items = useHistoryStore((state: HistoryStoreState) => state.items);
	const loadHistory = useHistoryStore(
		(state: HistoryStoreState) => state.loadHistory,
	);
	const togglePinHistory = useHistoryStore(
		(state: HistoryStoreState) => state.togglePinHistory,
	);
	const deleteHistory = useHistoryStore(
		(state: HistoryStoreState) => state.deleteHistory,
	);

	function handleSelectHistory(item: CalculationHistoryItem) {
		router.push(getHistoryRoute(item));
	}

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	const recentItems = useMemo(() => {
		return [...items]
			.sort((a, b) => {
				if (a.isPinned && !b.isPinned) return -1;
				if (!a.isPinned && b.isPinned) return 1;

				return (
					new Date(b.updatedAt ?? b.createdAt).getTime() -
					new Date(a.updatedAt ?? a.createdAt).getTime()
				);
			})
			.slice(0, 4);
	}, [items]);

	return (
		<section className=" space-y-4 p-3">
			<div className="flex items-center justify-between">
				<h2 className="text-[14px] sm:text-[1rem] text-[var(--sl-primary)]">
					Recent History
				</h2>

				<Link
					href="/history"
					className="flex items-center gap-1 text-xs font-semibold text-[var(--sl-text-muted)] transition-colors hover:text-[var(--sl-primary-hover)"
				>
					See All
					<ChevronRight size={15} />
				</Link>
			</div>

			<HistoryPanel
				items={recentItems}
				module="all"
				compact
				hideSearch
				hideHeader
				onSelect={handleSelectHistory}
				onPin={togglePinHistory}
				onDelete={deleteHistory}
			/>
		</section>
	);
}
