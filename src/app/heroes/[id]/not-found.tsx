import { SearchX } from "lucide-react";
import Link from "next/link";

import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

export default function HeroNotFound() {
	return (
		<MobileContainer>
			<HeaderOther title="Hero Not Found" />

			<main className="flex min-h-[70vh] items-center justify-center px-4 pb-24 pt-6">
				<div className="w-full rounded-3xl border border-dashed border-[var(--sl-border)] bg-[var(--sl-surface)] px-6 py-12 text-center">
					<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[var(--sl-active)] text-[var(--sl-text-muted)]">
						<SearchX size={26} />
					</div>

					<h1 className="mt-5 text-lg font-black text-[var(--sl-text)]">
						Hero not found
					</h1>

					<p className="mx-auto mt-2 max-w-64 text-xs leading-5 text-[var(--sl-text-muted)]">
						The hero you are looking for does not exist or has not been added to
						the database.
					</p>

					<Link
						href="/heroes"
						className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--sl-primary)] px-5 text-xs font-bold text-[var(--sl-primary-foreground)] transition-opacity hover:opacity-90"
					>
						Back to Heroes
					</Link>
				</div>
			</main>
		</MobileContainer>
	);
}
