"use client";

import SLAccordion from "@/components/ui/sl-ui/SLAccordion";

import { RESOURCE_GROUPS } from "../constants";
import LunarAmberExchange from "./LunarAmberExchange";
import ResourceGroup from "./ResourceGroup";

type ResourceBagContentProps = {
	onClose: () => void;
	onTutorialSave?: () => void;
};

export default function ResourceBagContent({
	onClose,
	onTutorialSave,
}: ResourceBagContentProps) {
	function handleSaveAndClose() {
		/*
		 * ResourceInput menyimpan perubahan
		 * langsung ke inventory store.
		 *
		 * Beri tahu parent bahwa Save & Close
		 * dilakukan selama flow tutorial.
		 */
		onTutorialSave?.();

		/*
		 * Tutup drawer.
		 *
		 * MobileBottomBar akan memindahkan
		 * tutorial ke bag-compare setelah
		 * drawer benar-benar tertutup.
		 */
		onClose();
	}

	function handleClose() {
		/*
		 * Close biasa tidak mengubah
		 * progress tutorial.
		 */
		onClose();
	}

	return (
		<>
			<h2 className="mb-5 text-sm font-semibold text-[var(--sl-text)]">
				Your Resources
			</h2>

			<div className="space-y-5">
				{RESOURCE_GROUPS.map(
					(group) => (
						<div
							key={group.id}
							className="space-y-3"
						>
							<div
								data-tutorial={
									group.id ===
									"chief-gear"
										? "bag-chief-gear"
										: undefined
								}
							>
								<ResourceGroup
									group={group}
								/>
							</div>

							{group.id ===
								"chief-gear" && (
								<SLAccordion
									title="Lunar Amber Exchange"
									defaultOpen={
										false
									}
									className="border border-[var(--sl-border)] bg-[var(--sl-active)] text-[var(--sl-text)]"
								>
									<LunarAmberExchange />
								</SLAccordion>
							)}
						</div>
					),
				)}
			</div>

			<div className="sticky bottom-0 mt-4 flex gap-3 bg-[var(--sl-surface)] py-4">
				<button
					type="button"
					onClick={
						handleSaveAndClose
					}
					className="h-11 flex-1 rounded-full bg-[var(--sl-primary)] text-sm font-semibold text-[var(--sl-primary-foreground)]"
				>
					Save & Close
				</button>

				<button
					type="button"
					onClick={handleClose}
					className="h-11 flex-1 rounded-full bg-[var(--sl-input)] text-xs font-bold text-[var(--sl-text)] hover:bg-[var(--sl-input-hover)]"
				>
					Close
				</button>
			</div>
		</>
	);
}