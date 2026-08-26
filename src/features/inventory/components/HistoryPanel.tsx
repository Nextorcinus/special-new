"use client";

import { useMemo, useState } from "react";

import { toast } from "@/lib/toast";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import HistorySearch from "@/features/inventory/components/HistorySearch";
import type {
	CalculationHistoryItem,
	CalculationModule,
} from "@/features/inventory/store/history/types";
import { filterHistory } from "@/features/utils/historyFilters";

import HistoryItem from "./HistoryItem";

type HistoryPanelProps = {
	items: CalculationHistoryItem[];
	activeId?: string | null;
	module?: CalculationModule | "all";
	title?: string;

	compact?: boolean;
	hideSearch?: boolean;
	hideHeader?: boolean;

	onSelect: (
		item: CalculationHistoryItem,
	) => void;

	onPin: (id: string) => void;

	onDelete: (id: string) => void;

	onClear?: () => void;
};

type ConfirmAction =
	| {
			type: "delete";
			id: string;
			title: string;
	  }
	| {
			type: "clear";
	  };

export default function HistoryPanel({
	items,
	activeId = null,
	module = "all",
	title = "History",
	compact = false,
	hideSearch = false,
	hideHeader = false,
	onSelect,
	onPin,
	onDelete,
	onClear,
}: HistoryPanelProps) {
	const [search, setSearch] = useState("");

	const [confirmAction, setConfirmAction] =
		useState<ConfirmAction | null>(null);

	const filteredItems = useMemo(() => {
		return filterHistory({
			items,
			search,
			module,
		});
	}, [items, search, module]);

	/*
	 * Pin History
	 */
	function handlePin(id: string) {
		const item = items.find(
			(history) => history.id === id,
		);

		if (!item) {
			toast.error(
				"History not found",
				"The selected history could not be found.",
			);

			return;
		}

		try {
			onPin(id);

			if (item.isPinned) {
				toast.success(
					"History unpinned",
					`${item.title} has been removed from pinned history.`,
				);
			} else {
				toast.success(
					"History pinned",
					`${item.title} has been pinned.`,
				);
			}
		} catch (error) {
			toast.error(
				"Pin failed",
				error instanceof Error
					? error.message
					: "Failed to update history pin status.",
			);
		}
	}

	/*
	 * Request Delete Confirmation
	 *
	 * HistoryItem hanya meminta delete.
	 * Dialog confirmation dikontrol oleh HistoryPanel.
	 */
	function handleDelete(id: string) {
		const item = items.find(
			(history) => history.id === id,
		);

		if (!item) {
			toast.error(
				"History not found",
				"The selected history could not be found.",
			);

			return;
		}

		setConfirmAction({
			type: "delete",
			id: item.id,
			title: item.title,
		});
	}

	/*
	 * Request Clear Confirmation
	 */
	function handleClear() {
		if (!onClear) {
			return;
		}

		if (filteredItems.length === 0) {
			return;
		}

		setConfirmAction({
			type: "clear",
		});
	}

	/*
	 * Execute confirmed action
	 */
	function handleConfirmAction() {
		if (!confirmAction) {
			return;
		}

		if (confirmAction.type === "delete") {
			try {
				onDelete(confirmAction.id);

				toast.success(
					"History deleted",
					`${confirmAction.title} calculation history has been deleted.`,
				);
			} catch (error) {
				toast.error(
					"Delete failed",
					error instanceof Error
						? error.message
						: "Failed to delete history.",
				);
			}

			return;
		}

		if (confirmAction.type === "clear") {
			if (!onClear) {
				return;
			}

			try {
				onClear();

				toast.success(
					"History cleared",
					"All visible calculation history has been cleared.",
				);
			} catch (error) {
				toast.error(
					"Clear failed",
					error instanceof Error
						? error.message
						: "Failed to clear history.",
				);
			}
		}
	}

	/*
	 * Close Confirmation Dialog
	 */
	function handleCloseConfirm() {
		setConfirmAction(null);
	}

	const isDeleteConfirmation =
		confirmAction?.type === "delete";

	const isClearConfirmation =
		confirmAction?.type === "clear";

	return (
		<>
			<aside
				className={
					compact
						? "space-y-2"
						: "rounded-2xl border border-white/10 bg-white/[0.03] p-4"
				}
			>
				{/* Header */}
				{!hideHeader && (
					<div className="mb-4 flex items-center justify-between gap-3">
						<div className="min-w-0">
							<h2 className="text-sm font-bold text-white">
								{title}
							</h2>

							<p className="text-xs text-white/40">
								{filteredItems.length}{" "}
								saved calculation
								{filteredItems.length !==
									1 && "s"}
							</p>
						</div>

						{onClear &&
							filteredItems.length >
								0 && (
								<button
									type="button"
									onClick={
										handleClear
									}
									className="rounded-lg px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/10"
								>
									Clear
								</button>
							)}
					</div>
				)}

				{/* Search */}
				{!hideSearch && (
					<HistorySearch
						value={search}
						onChange={setSearch}
					/>
				)}

				{/* History List */}
				<div
					className={
						compact
							? "flex flex-col gap-2"
							: "mt-4 flex max-h-[520px] flex-col gap-2 overflow-y-auto pr-1"
					}
				>
					{filteredItems.length > 0 ? (
						filteredItems.map(
							(item) => (
								<HistoryItem
									key={item.id}
									item={item}
									isActive={
										activeId ===
										item.id
									}
									onSelect={
										onSelect
									}
									onDelete={
										handleDelete
									}
									onPin={
										handlePin
									}
								/>
							),
						)
					) : (
						<div className="rounded-xl border border-solid border-[color:var(--sl-border)] p-4 text-center text-sm text-[var(--sl-text-muted)]">
							No history found
						</div>
					)}
				</div>
			</aside>

			{/* Delete / Clear Confirmation */}
			<ConfirmDialog
				open={confirmAction !== null}
				title={
					isDeleteConfirmation
						? "Delete History?"
						: "Clear History?"
				}
				description={
					isDeleteConfirmation
						? `Delete "${confirmAction.title}" calculation history? This action cannot be undone.`
						: isClearConfirmation
							? "Clear all visible calculation history? This action cannot be undone."
							: undefined
				}
				confirmText={
					isDeleteConfirmation
						? "Delete"
						: "Clear"
				}
				cancelText="Cancel"
				variant="danger"
				onConfirm={
					handleConfirmAction
				}
				onClose={
					handleCloseConfirm
				}
			/>
		</>
	);
}