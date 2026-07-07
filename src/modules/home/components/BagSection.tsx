"use client";

import Image from "next/image";
import { useState } from "react";
import { ResourceBagModal } from "@/features/inventory";
import "@/styles/theme.css";
import "@/styles/globals.css";

export default function WhatsInBagSection() {
	const [open, setOpen] = useState(false);

	return (
		<>
			<section>
				<button
					type="button"
					onClick={() => setOpen(true)}
					className="flex w-full items-center gap-4 rounded-xl  bg-[var(--sl-surface)] border border-[var(--sl-border)] px-4 py-3 text-left transition-colors hover:bg-[var(--sl-surface-hover)]"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sl-surface)] border border-solid border-[color:var(--sl-border)]">
						<Image src="/icons/bag.png" alt="Bag" width={24} height={24} />
					</div>

					<div className="flex-1">
						<h3 className="text-sm font-semibold text-[var(--sl-primary)]">
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
