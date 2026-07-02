"use client";

import { Search } from "lucide-react";

export default function SearchSection() {
	return (
		<section>
			<div className="flex h-14 items-center gap-3 rounded-4xl bg-[var(--card)] px-4 shadow-sm">
				<Search size={20} className="text-[var(--muted)]" />

				<input
					type="text"
					placeholder="Search calculator, history..."
					className="w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
				/>
			</div>
		</section>
	);
}
