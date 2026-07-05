// RecentHistorySection.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import Link from "next/link";

import HistoryPanel from "@/features/inventory/components/HistoryPanel";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import type { CalculationHistoryItem } from "@/features/inventory/store/history/types";
import { getHistoryRoute } from "@/features/inventory/store/history/historyRoutes";

type HistoryStoreState = ReturnType<typeof useHistoryStore.getState>;

export default function RecentHistorySection() {
	const router = useRouter();

	const items = useHistoryStore((state: HistoryStoreState) => state.items);
	const loadHistory = useHistoryStore(
		(state: HistoryStoreState) => state.loadHistory
	);
	const togglePinHistory = useHistoryStore(
		(state: HistoryStoreState) => state.togglePinHistory
	);
	const deleteHistory = useHistoryStore(
		(state: HistoryStoreState) => state.deleteHistory
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
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-bold text-white">Recent History</h2>

				<Link
					href="/history"
					className="text-sm font-semibold text-yellow-300"
				>
					See All
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