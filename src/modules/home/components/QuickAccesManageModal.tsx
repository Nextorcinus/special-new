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
} as const;

export default function QuickAccessManageModal({
	open,
	selectedIds,
	onSave,
	onClose,
}: Props) {
	const [mounted, setMounted] = useState(false);

	const [localSelectedIds, setLocalSelectedIds] =
		useState<string[]>(selectedIds);

	useEffect(() => {
		setMounted(true);

		return () => {
			setMounted(false);
		};
	}, []);

	useEffect(() => {
		if (!open) {
			return;
		}

		setLocalSelectedIds(
			selectedIds.slice(0, MAX_QUICK_ACCESS),
		);
	}, [open, selectedIds]);

	useEffect(() => {
		if (!open) {
			return;
		}

		const originalOverflow =
			document.body.style.overflow;

		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow =
				originalOverflow;
		};
	}, [open]);

	if (!mounted || !open) {
		return null;
	}

	const selectedCount = localSelectedIds.length;

	const isMaxSelected =
		selectedCount >= MAX_QUICK_ACCESS;

	function toggleItem(id: string) {
		setLocalSelectedIds((current) => {
			/*
			 * Uncheck
			 */
			if (current.includes(id)) {
				return current.filter(
					(item) => item !== id,
				);
			}

			/*
			 * Maximum reached
			 */
			if (current.length >= MAX_QUICK_ACCESS) {
				return current;
			}

			/*
			 * Check
			 */
			return [...current, id];
		});
	}

	function handleSave() {
		onSave(
			localSelectedIds.slice(
				0,
				MAX_QUICK_ACCESS,
			),
		);

		onClose();
	}

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
			<button
				type="button"
				aria-label="Close modal"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
			/>

			{/* Modal */}
			<div
				className="
					relative z-10
					grid
					h-[min(700px,85vh)]
					w-full
					max-w-lg
					grid-rows-[auto_auto_minmax(0,1fr)_auto]
					overflow-hidden
					rounded-2xl
					border border-[var(--sl-border)]
					bg-[var(--sl-surface)]
					shadow-2xl
				"
				onClick={(event) =>
					event.stopPropagation()
				}
			>
				{/* =========================
				    HEADER
				========================= */}
				<div className="border-b border-[var(--sl-border)] px-5 py-4">
					<div className="flex items-start justify-between gap-4">
						<div className="min-w-0">
							<h2
								id="quick-access-modal-title"
								className="text-base font-semibold text-[var(--sl-primary)]"
							>
								Manage Quick Access
							</h2>

							<p className="mt-1 text-xs leading-relaxed text-[var(--sl-text-muted)]">
								Choose up to{" "}
								{MAX_QUICK_ACCESS}{" "}
								tools to show on
								Quick Access.
							</p>
						</div>

						<div className="flex shrink-0 items-center gap-2">
							{/* Counter */}
							<div
								className={[
									"rounded-lg px-2.5 py-1",
									"text-xs font-semibold",
									isMaxSelected
										? "bg-[var(--sl-primary)]/15 text-[var(--sl-primary)]"
										: "bg-white/5 text-[var(--sl-text-muted)]",
								].join(" ")}
							>
								{selectedCount} /{" "}
								{MAX_QUICK_ACCESS}
							</div>

							{/* Close */}
							<button
								type="button"
								onClick={onClose}
								aria-label="Close"
								className="
									flex size-8 shrink-0
									items-center justify-center
									rounded-lg
									text-[var(--sl-text-muted)]
									transition-colors
									hover:bg-white/10
									hover:text-[var(--sl-text)]
								"
							>
								<X size={18} />
							</button>
						</div>
					</div>
				</div>

				{/* =========================
				    MAXIMUM MESSAGE
				========================= */}
				<div
					className={[
						"flex min-h-[42px] items-center",
						"border-b border-[var(--sl-border)]",
						"bg-[var(--sl-primary)]/5",
						"px-5 py-2.5",
						"transition-opacity",
						isMaxSelected
							? "opacity-100"
							: "pointer-events-none opacity-0",
					].join(" ")}
					aria-hidden={!isMaxSelected}
				>
					<p className="text-xs leading-relaxed text-[var(--sl-text-muted)]">
						You have selected the
						maximum of{" "}
						<span className="font-semibold text-[var(--sl-primary)]">
							{MAX_QUICK_ACCESS}
						</span>{" "}
						items. Uncheck an item to
						choose another one.
					</p>
				</div>

				{/* =========================
				    CONTENT
				========================= */}
				<div
					className="
						min-h-0
						overflow-y-auto
						overscroll-contain
						px-4
						py-4
					"
				>
					{Object.entries(
						groupedNavigation,
					).map(
						([group, items]) => {
							if (
								items.length ===
								0
							) {
								return null;
							}

							const label =
								group ===
								"other"
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
										{
											label
										}
									</h3>

									<div className="space-y-1">
										{items.map(
											(
												item,
											) => {
												const checked =
													localSelectedIds.includes(
														item.id,
													);

												const disabled =
													!checked &&
													isMaxSelected;

												return (
													<button
														key={
															item.id
														}
														type="button"
														role="checkbox"
														aria-checked={
															checked
														}
														aria-disabled={
															disabled
														}
														disabled={
															disabled
														}
														onClick={() =>
															toggleItem(
																item.id,
															)
														}
														className={[
															"flex w-full items-center gap-3",
															"rounded-xl px-3 py-2.5",
															"text-left",
															"transition-colors",
															"outline-none",
															"focus-visible:ring-2",
															"focus-visible:ring-[var(--sl-primary)]/50",
															disabled
																? "cursor-not-allowed opacity-40"
																: "cursor-pointer hover:bg-white/5 active:bg-white/10",
														].join(
															" ",
														)}
													>
														{/* Checkbox */}
														<div
															className={[
																"flex size-5 shrink-0",
																"items-center justify-center",
																"rounded-md border",
																"transition-colors",
																checked
																	? "border-[var(--sl-primary)] bg-[var(--sl-primary)]"
																	: "border-[var(--sl-border)] bg-black/20",
															].join(
																" ",
															)}
														>
															{checked && (
																<Check
																	size={
																		14
																	}
																	className="text-[var(--sl-primary-foreground)]"
																	strokeWidth={
																		3
																	}
																/>
															)}
														</div>

														{/* Icon */}
														<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-black/20">
															<Image
																src={
																	item.icon
																}
																alt=""
																width={
																	30
																}
																height={
																	30
																}
																className="size-7 object-contain"
															/>
														</div>

														{/* Title */}
														<span
															className={[
																"min-w-0 flex-1 truncate text-sm",
																checked
																	? "font-medium text-[var(--sl-text)]"
																	: "text-[var(--sl-text-secondary)]",
															].join(
																" ",
															)}
														>
															{
																item.title
															}
														</span>
													</button>
												);
											},
										)}
									</div>
								</div>
							);
						},
					)}
				</div>

				{/* =========================
				    FOOTER
				========================= */}
				<div className="border-t border-[var(--sl-border)] px-5 py-4">
					<div className="flex items-center justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className="
								rounded-xl
								px-4 py-2
								text-sm font-medium
								text-[var(--sl-text-muted)]
								transition-colors
								hover:bg-white/5
								hover:text-[var(--sl-text)]
							"
						>
							Close
						</button>

						<button
							type="button"
							onClick={handleSave}
							className="
								rounded-xl
								bg-[var(--sl-primary)]
								px-5 py-2
								text-sm font-semibold
								text-[var(--sl-primary-foreground)]
								transition-colors
								hover:opacity-90
							"
						>
							Save
						</button>
					</div>
				</div>
			</div>
		</div>
	);

	return createPortal(
		modal,
		document.body,
	);
}