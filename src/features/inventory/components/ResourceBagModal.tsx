"use client";

import { useEffect } from "react";
import { RESOURCE_GROUPS } from "../constants";
import { useInventoryStore } from "../store/inventory.store";
import ResourceGroup from "./ResourceGroup";

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
		if (open) loadResources();
	}, [open, loadResources]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-6 lg:items-center">
			<div className="max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-3xl border-2 border-sky-500 bg-[#1f1f1f] p-5 text-white">
				<h2 className="mb-5 text-sm font-semibold">Your Resources</h2>

				<div className="space-y-5">
					{RESOURCE_GROUPS.map((group) => (
						<ResourceGroup key={group.id} group={group} />
					))}
				</div>

				<div className="sticky bottom-0 mt-6 flex gap-3 bg-[#1f1f1f] pt-4">
					<button
						type="button"
						onClick={onClose}
						className="h-11 flex-1 rounded-full bg-yellow-400 text-sm font-semibold text-black"
					>
						Update
					</button>

					<button
						type="button"
						onClick={onClose}
						className="h-11 flex-1 rounded-full bg-zinc-400 text-sm font-semibold text-white"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
