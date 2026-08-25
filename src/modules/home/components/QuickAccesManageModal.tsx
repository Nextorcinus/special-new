"use client";

import { Check, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { NAVIGATION } from "@/config/navigation";

type Props = {
	open: boolean;
	selectedIds: string[];
	onSave: (ids: string[]) => void;
	onClose: () => void;
};

const MAX_QUICK_ACCESS = 6;

const GROUP_LABELS = {
	chief: "Chief",
	heroes: "Heroes",
	development: "Development",
};

export default function QuickAccessManageModal({
	open,
	selectedIds,
	onSave,
	onClose,
}: Props) {
	const [mounted, setMounted] = useState(false);
	const [localSelectedIds, setLocalSelectedIds] =
		useState<string[]>(selectedIds);

	/*
	 * Portal hanya dijalankan setelah component
	 * benar-benar mounted di browser.
	 */
	useEffect(() => {
		setMounted(true);

		return () => {
			setMounted(false);
		};
	}, []);

	/*
	 * Set local state ketika modal dibuka.
	 */
	useEffect(() => {
		if (open) {
			setLocalSelectedIds(selectedIds);
		}
	}, [open, selectedIds]);

	/*
	 * Lock body scroll hanya ketika modal benar-benar open.
	 */
	useEffect(() => {
		if (!open) {
			return;
		}

		const originalOverflow = document.body.style.overflow;

		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = originalOverflow;
		};
	}, [open]);

	if (!mounted || !open) {
		return null;
	}

	const selectedCount = localSelectedIds.length;
	const isMaxSelected = selectedCount >= MAX_QUICK_ACCESS;

	const toggleItem = (id: string) => {
		setLocalSelectedIds((current) => {
			/*
			 * Uncheck
			 */
			if (current.includes(id)) {
				return current.filter((item) => item !== id);
			}

			/*
			 * Maximum 6
			 */
			if (current.length >= MAX_QUICK_ACCESS) {
				return current;
			}

			return [...current, id];
		});
	};

	const handleSave = () => {
		const ids = localSelectedIds.slice(0, MAX_QUICK_ACCESS);

		onSave(ids);
		onClose();
	};

	const groupedNavigation = {
		chief: NAVIGATION.filter(
			(item) => item.group === "chief",
		),

		heroes: NAVIGATION.filter(
			(item) => item.group === "heroes",
		),

		development: NAVIGATION.filter(
			(item) => item.group === "development",
		),

		other: NAVIGATION.filter(
			(item) => !item.group,
		),
	};

	const modal = (
		<div
			className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="quick-access-modal-title"
		>
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal */}
			<div
				className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] shadow-2xl"
				onClick={(event) => event.stopPropagation()}
			>
				{/* Header */}
				<div className="flex items-start justify-between gap-4 border-b border-[var(--sl-border)] px-5 py-4">
					<div className="min-w-0">
						<h2
							id="quick-access-modal-title"
							className="text-base font-semibold text-[var(--sl-primary)]"
						>
							Manage Quick Access
						</h2>

						<p className="mt-1 text-xs leading-relaxed text-[var(--sl-text-muted)]">
							Choose up to {MAX_QUICK_ACCESS} tools to show
							on Quick Access.
						</p>
					</div>

					<div className="flex shrink-0 items-center gap-2">
						{/* Counter */}
						<div
							className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
								isMaxSelected
									? "bg-[var(--sl-primary)]/15 text-[var(--sl-primary)]"
									: "bg-white/5 text-[var(--sl-text-muted)]"
							}`}
						>
							{selectedCount} / {MAX_QUICK_ACCESS}
						</div>

						{/* Close */}
						<button
							type="button"
							onClick={onClose}
							aria-label="Close"
							className="flex size-8 items-center justify-center rounded-lg text-[var(--sl-text-muted)] transition-colors hover:bg-white/10 hover:text-[var(--sl-text-primary)]"
						>
							<X size={18} />
						</button>
					</div>
				</div>

				{/* Maximum message */}
				{isMaxSelected && (
					<div className="border-b border-[var(--sl-border)] bg-[var(--sl-primary)]/5 px-5 py-2.5">
						<p className="text-xs text-[var(--sl-text-muted)]">
							You have selected the maximum of{" "}
							<span className="font-semibold text-[var(--sl-primary)]">
								{MAX_QUICK_ACCESS}
							</span>{" "}
							items. Uncheck an item to choose another one.
						</p>
					</div>
				)}

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4">
					{Object.entries(groupedNavigation).map(
						([group, items]) => {
							if (!items.length) {
								return null;
							}

							const label =
								group === "other"
									? "Other"
									: GROUP_LABELS[
											group as keyof typeof GROUP_LABELS
										];

							return (
								<div
									key={group}
									className="mb-5 last:mb-0"
								>
									<h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--sl-text-muted)]">
										{label}
									</h3>

									<div className="space-y-1">
										{items.map((item) => {
											const checked =
												localSelectedIds.includes(
													item.id,
												);

											const disabled =
												!checked &&
												isMaxSelected;

											return (
												<label
													key={item.id}
													className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
														disabled
															? "cursor-not-allowed opacity-40"
															: "cursor-pointer hover:bg-white/5"
													}`}
												>
													<input
														type="checkbox"
														checked={checked}
														disabled={disabled}
														onChange={() =>
															toggleItem(
																item.id,
															)
														}
														className="sr-only"
													/>

													{/* Checkbox */}
													<div
														className={`flex size-5 shrink-0 items-center justify-center rounded-md border transition-all ${
															checked
																? "border-[var(--sl-primary)] bg-[var(--sl-surface-2)]"
																: "border-[var(--sl-border)] bg-black/20"
														}`}
													>
														{checked && (
															<Check
																size={14}
																className="text-white"
																strokeWidth={
																	3
																}
															/>
														)}
													</div>

													{/* Icon */}
													<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-black/20">
														<Image
															src={item.icon}
															alt={item.title}
															width={30}
															height={30}
															className="size-7 object-contain"
														/>
													</div>

													{/* Title */}
													<span
														className={`text-sm ${
															checked
																? "font-medium text-[var(--sl-text-primary)]"
																: "text-[var(--sl-text-secondary)]"
														}`}
													>
														{item.title}
													</span>
												</label>
											);
										})}
									</div>
								</div>
							);
						},
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-2 border-t border-[var(--sl-border)] px-5 py-4">
					<button
						type="button"
						onClick={onClose}
						className="rounded-xl px-4 py-2 text-sm font-medium text-[var(--sl-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--sl-text-primary)]"
					>
						Close
					</button>

					<button
						type="button"
						onClick={handleSave}
						className="rounded-xl bg-[var(--sl-active)] px-5 py-2 text-sm font-semibold text-[var(--sl-text)] hover:text-white transition-colors hover:bg-[var(--sl-surface-2)]"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);

	return createPortal(modal, document.body);
}