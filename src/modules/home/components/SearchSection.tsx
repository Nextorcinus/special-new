"use client";

import { Search } from "lucide-react";

export default function SearchSection() {
	return (
		<section>
			<div className="flex h-14 items-center gap-3 rounded-4xl bg-[var(--sl-surface)] border border-[var(--sl-border)] px-4">
				<Search size={20} className="text-[var(--sl-text-muted)]" />

				<input
					type="text"
					placeholder="Search calculator, history..."
					className="w-full bg-transparent text-sm text-[var(--sl-text)] outline-none placeholder:text-[var(--sl-text-muted)]"
				/>
			</div>
		</section>
	);
}
