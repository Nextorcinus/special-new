"use client";

import { useEffect } from "react";

import { useInventoryStore } from "../store/inventory.store";
import ResourceBagContent from "./ResourceBagContent";

type ResourceBagModalProps = {
	open: boolean;
	onClose: () => void;
};

export default function ResourceBagModal({
	open,
	onClose,
}: ResourceBagModalProps) {
	const loadResources = useInventoryStore((state) => state.loadResources);

	useEffect(() => {
		if (open) {
			loadResources();
		}
	}, [open, loadResources]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-end justify-center px-4 py-6 md:items-center">
			<button
				type="button"
				aria-label="Close resource bag"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-black/60"
			/>

			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="resource-bag-title"
				className="relative z-10 max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5 text-[var(--sl-text)]"
			>
				<ResourceBagContent onClose={onClose} />
			</div>
		</div>
	);
}
