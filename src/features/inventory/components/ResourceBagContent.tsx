"use client";

import SLAccordion from "@/components/ui/sl-ui/SLAccordion";

import { RESOURCE_GROUPS } from "../constants";
import LunarAmberExchange from "./LunarAmberExchange";
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
					<div key={group.id} className="space-y-3">
						<ResourceGroup group={group} />

						{group.id === "chief-gear" && (
							<SLAccordion
								title="Lunar Amber Exchange"
								defaultOpen={false}
								className="border border-[var(--sl-border)] bg-[var(--sl-active] text-[var(--sl-text)]"
							>
								<LunarAmberExchange />
							</SLAccordion>
						)}
					</div>
				))}
			</div>

			<div className="sticky bottom-0 mt-4 flex gap-3 bg-[var(--sl-surface)] py-4">
				<button
					type="button"
					onClick={onClose}
					className="h-11 flex-1 rounded-full bg-[var(--sl-primary)] text-sm font-semibold text-[var(--sl-primary-foreground)]"
				>
					Save & Close
				</button>

				<button
					type="button"
					onClick={onClose}
					className="h-11 flex-1 rounded-full bg-[var(--sl-input)] text-xs font-bold text-[var(--sl-text)] hover:bg-[var(--sl-input-hover)]"
				>
					Close
				</button>
			</div>
		</>
	);
}
