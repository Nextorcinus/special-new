import { SearchX } from "lucide-react";
import type { NormalizedHero } from "../type";
import HeroCard from "./HeroCard";

type HeroListProps = {
	heroes: NormalizedHero[];
};

export default function HeroList({ heroes }: HeroListProps) {
	if (heroes.length === 0) {
		return (
			<div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--sl-border)] bg-[var(--sl-surface)] px-6 py-10 text-center">
				<div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--sl-active)] text-[var(--sl-text-muted)]">
					<SearchX size={22} />
				</div>

				<p className="mt-4 text-sm font-bold text-[var(--sl-text)]">
					No heroes found
				</p>

				<p className="mt-1 max-w-64 text-xs leading-5 text-[var(--sl-text-muted)]">
					Try changing the search term or resetting the selected filters.
				</p>
			</div>
		);
	}

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
			{heroes.map((hero) => (
				<HeroCard key={hero.id} hero={hero} />
			))}
		</div>
	);
}
