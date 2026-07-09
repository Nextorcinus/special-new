"use client";

import Image from "next/image";
import { useState } from "react";

import { ResourceBagModal } from "@/features/inventory";

export default function WhatsInBagSection() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<section>
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="flex w-full items-center gap-4 rounded-xl border border-[var(--divider)] bg-[var(--sl-surface)] px-4 py-3 text-left transition-colors hover:bg-[var(--sl-surface-hover)]"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full border border-solid border-[color:var(--sl-border)] bg-[var(--sl-surface)]">
						<Image src="/icons/bag.png" alt="Bag" width={24} height={24} />
					</div>

					<div className="flex-1">
						<h3 className="text-[11px] text-[var(--sl-text)] sm:text-[0.99rem]">
							What&apos;s in your bag?
						</h3>

						<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
							Insert here for easily compare result to your resources
						</p>
					</div>
				</button>
			</section>

			<ResourceBagModal open={open} onClose={() => setOpen(false)} />
		</>
	);
}
