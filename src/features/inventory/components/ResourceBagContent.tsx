"use client";

import { useEffect, useRef } from "react";

import SLAccordion from "@/components/ui/sl-ui/SLAccordion";

import { useTutorial } from "@/features/tutorial";

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
	const tutorial = useTutorial();

	const chiefGearRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!tutorial.active || tutorial.step !== "bag-chief-gear") {
			return;
		}

		let firstFrame = 0;
		let secondFrame = 0;

		const scrollToChiefGear = () => {
			const element = chiefGearRef.current;

			if (!element) {
				return;
			}

			element.scrollIntoView({
				behavior: "smooth",
				block: "center",
				inline: "nearest",
			});
		};

		firstFrame = requestAnimationFrame(() => {
			secondFrame = requestAnimationFrame(scrollToChiefGear);
		});

		const timeout = window.setTimeout(scrollToChiefGear, 250);

		return () => {
			cancelAnimationFrame(firstFrame);

			cancelAnimationFrame(secondFrame);

			window.clearTimeout(timeout);
		};
	}, [tutorial.active, tutorial.step]);

	function handleSaveAndClose() {
		onTutorialSave?.();

		onClose();
	}

	function handleClose() {
		onClose();
	}

	return (
		<>
			<h2 className="mb-5 text-sm font-semibold text-[var(--sl-text)]">
				Your Resources
			</h2>

			<div className="space-y-5">
				{RESOURCE_GROUPS.map((group) => {
					const isChiefGear = group.id === "chief-gear";

					return (
						<div key={group.id} className="space-y-3">
							<div
								ref={isChiefGear ? chiefGearRef : undefined}
								data-tutorial={isChiefGear ? "bag-chief-gear" : undefined}
							>
								<ResourceGroup group={group} />
							</div>

							{isChiefGear && (
								<SLAccordion
									title="Lunar Amber Exchange"
									defaultOpen={false}
									className="border border-[var(--sl-border)] bg-[var(--sl-active)] text-[var(--sl-text)]"
								>
									<LunarAmberExchange />
								</SLAccordion>
							)}
						</div>
					);
				})}
			</div>

			<div className="sticky bottom-0 mt-4 flex gap-3 bg-[var(--sl-surface)] py-4">
				<button
					type="button"
					onClick={handleSaveAndClose}
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
