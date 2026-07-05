"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import HistoryPanel from "@/features/inventory/components/HistoryPanel";
import { useHistoryStore } from "@/features/inventory/store/history/history.store";
import type {
	CalculationHistoryItem,
	CalculationModule,
} from "@/features/inventory/store/history/types";
import { getHistoryRoute } from "@/features/inventory/store/history/historyRoutes";
import HistoryFilterTabs from "./components/HistoryFilterTabs";

type HistoryStoreState = ReturnType<typeof useHistoryStore.getState>;

export default function HistoryPage() {
	const router = useRouter();

	const [activeModule, setActiveModule] =
		useState<CalculationModule | "all">("all");

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

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	const filteredItems = useMemo(() => {
		if (activeModule === "all") return items;

		return items.filter((item) => item.module === activeModule);
	}, [items, activeModule]);

	function handleSelectHistory(item: CalculationHistoryItem) {
		router.push(getHistoryRoute(item));
	}

	return (
		<main className="min-h-screen bg-special px-4 py-6 text-white">
			<div className="mx-auto w-full max-w-md space-y-6">
				<div className="relative flex items-center justify-center">
					<button
						type="button"
						onClick={() => router.back()}
						className="absolute left-0 rounded-full bg-white p-2 text-black"
					>
						<ArrowLeft className="h-4 w-4" />
					</button>

					<h1 className="text-base font-bold">History</h1>
				</div>

				<HistoryFilterTabs
					value={activeModule}
					onChange={setActiveModule}
				/>

				<HistoryPanel
					items={filteredItems}
					module="all"
					compact
					hideHeader
					hideSearch
					onSelect={handleSelectHistory}
					onPin={togglePinHistory}
					onDelete={deleteHistory}
				/>
			</div>
		</main>
	);
}