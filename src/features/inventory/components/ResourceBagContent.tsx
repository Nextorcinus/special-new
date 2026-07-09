"use client";

import { RESOURCE_GROUPS } from "../constants";
import ResourceGroup from "./ResourceGroup";

type ResourceBagContentProps = {
	onClose: () => void;
};

export default function ResourceBagContent({
	onClose,
}: ResourceBagContentProps) {
	return (
		<>
			<h2 className="mb-5 text-sm font-semibold text-[var(--sl-text)]">
				Your Resources
			</h2>

			<div className="space-y-5">
				{RESOURCE_GROUPS.map((group) => (
					<ResourceGroup key={group.id} group={group} />
				))}
			</div>

			<div className="sticky bottom-0 mt-6 flex gap-3 bg-[var(--sl-surface)] pt-4">
				<button
					type="button"
					onClick={onClose}
					className="h-11 flex-1 rounded-full bg-[var(--sl-primary)] text-sm font-semibold text-[var(--sl-primary-foreground)]"
				>
					Update
				</button>

				<button
					type="button"
					onClick={onClose}
					className="h-11 flex-1 rounded-full bg-[var(--sl-surface-2)] text-sm font-semibold text-[var(--sl-text)]"
				>
					Close
				</button>
			</div>
		</>
	);
}
