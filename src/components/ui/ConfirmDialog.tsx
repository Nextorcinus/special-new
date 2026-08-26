"use client";

import * as React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
	open: boolean;
	title: string;
	description?: string;
	confirmText?: string;
	cancelText?: string;
	variant?: "default" | "danger";
	onConfirm: () => void;
	onClose: () => void;
};

export default function ConfirmDialog({
	open,
	title,
	description,
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "default",
	onConfirm,
	onClose,
}: ConfirmDialogProps) {
	const handleConfirm = () => {
		onConfirm();
		onClose();
	};

	return (
		<DialogPrimitive.Root
			open={open}
			onOpenChange={(value) => {
				if (!value) {
					onClose();
				}
			}}
		>
			<DialogPrimitive.Portal>
				{/* Overlay */}
				<DialogPrimitive.Overlay
					className={cn(
						"fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm",
						"data-[state=open]:animate-in",
						"data-[state=open]:fade-in-0",
						"data-[state=closed]:animate-out",
						"data-[state=closed]:fade-out-0",
					)}
				/>

				{/* Dialog */}
				<DialogPrimitive.Content
					className={cn(
						"fixed left-1/2 top-1/2 z-[101]",
						"w-[calc(100%-2rem)] max-w-[420px]",
						"-translate-x-1/2 -translate-y-1/2",
						"rounded-2xl",
						"border border-[var(--sl-border)]",
						"bg-[var(--sl-surface)]",
						"p-5",
						"shadow-2xl",
						"outline-none",
						"data-[state=open]:animate-in",
						"data-[state=open]:fade-in-0",
						"data-[state=open]:zoom-in-95",
						"data-[state=closed]:animate-out",
						"data-[state=closed]:fade-out-0",
						"data-[state=closed]:zoom-out-95",
					)}
				>
					{/* Close */}
					<DialogPrimitive.Close
						aria-label="Close"
						className={cn(
							"absolute right-4 top-4",
							"flex size-8 items-center justify-center",
							"rounded-lg",
							"text-[var(--sl-text-muted)]",
							"transition-colors",
							"hover:bg-[var(--sl-hover)]",
							"hover:text-[var(--sl-text)]",
							"focus:outline-none",
						)}
					>
						<X className="size-4" />
					</DialogPrimitive.Close>

					{/* Icon */}
					<div
						className={cn(
							"mb-4 flex size-10 items-center justify-center rounded-xl",
							variant === "danger"
								? "bg-red-500/10 text-red-400"
								: "bg-[var(--sl-primary)]/10 text-[var(--sl-primary)]",
						)}
					>
						<AlertTriangle className="size-5" />
					</div>

					{/* Title */}
					<DialogPrimitive.Title className="pr-8 text-base font-semibold text-[var(--sl-text)]">
						{title}
					</DialogPrimitive.Title>

					{/* Description */}
					{description && (
						<DialogPrimitive.Description className="mt-2 pr-4 text-sm leading-relaxed text-[var(--sl-text-muted)]">
							{description}
						</DialogPrimitive.Description>
					)}

					{/* Actions */}
					<div className="mt-6 flex justify-end gap-2">
						<DialogPrimitive.Close
							className={cn(
								"h-10 rounded-xl px-4",
								"text-sm font-semibold",
								"text-[var(--sl-text-muted)]",
								"transition-colors",
								"hover:bg-[var(--sl-hover)]",
								"hover:text-[var(--sl-text)]",
								"focus:outline-none",
							)}
						>
							{cancelText}
						</DialogPrimitive.Close>

						<button
							type="button"
							onClick={handleConfirm}
							className={cn(
								"h-10 rounded-xl px-5",
								"text-sm font-semibold",
								"transition-all",
								"active:scale-[0.98]",
								variant === "danger"
									? "bg-red-500 text-white hover:bg-red-500/90"
									: "bg-[var(--sl-primary)] text-[var(--sl-primary-foreground)] hover:opacity-90",
							)}
						>
							{confirmText}
						</button>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}