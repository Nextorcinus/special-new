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
					className="flex w-full items-center gap-4 rounded-2xl bg-[var(--card)] p-4 text-left"
				>
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2A2A2A]">
						<Image src="/icons/bag.png" alt="Bag" width={24} height={24} />
					</div>

					<div className="flex-1">
						<h3 className="text-sm font-semibold text-[var(--foreground)]">
							What&apos;s in your bag?
						</h3>

						<p className="mt-1 text-xs text-[var(--muted)]">
							Insert here for easily compare result to your resources
						</p>
					</div>
				</button>
			</section>

			<ResourceBagModal open={open} onClose={() => setOpen(false)} />
		</>
	);
}
