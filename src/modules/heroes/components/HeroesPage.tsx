"use client";

import { useMemo, useState } from "react";

import BearRecommendation from "@/modules/heroes/bear/components/BearRecommendation";

import {
	DEFAULT_HERO_FILTERS,
	getFilteredHeroes,
	getHeroGenerationOptions,
} from "../helpers/hero.helpers";

import type { HeroFiltersValue, NormalizedHero } from "../type";

import HeroFilters from "./HeroFilters";
import HeroList from "./HeroList";

type HeroesPageProps = {
	heroes: NormalizedHero[];
};

export default function HeroesPage({ heroes }: HeroesPageProps) {
	const [filters, setFilters] = useState<HeroFiltersValue>(() => ({
		...DEFAULT_HERO_FILTERS,
	}));

	const generationOptions = useMemo(
		() =>
			getHeroGenerationOptions(heroes).map((option) => ({
				value: String(option.value),
				label: option.label,
			})),
		[heroes],
	);

	const filteredHeroes = useMemo(
		() => getFilteredHeroes(heroes, filters),
		[heroes, filters],
	);

	function resetFilters() {
		setFilters({
			...DEFAULT_HERO_FILTERS,
		});
	}

	return (
		<div className="space-y-5">
			<div className="rounded-3xl bg-[var(--sl-surface)] p-4">
				<HeroFilters
					value={filters}
					generationOptions={generationOptions}
					onChange={setFilters}
					onReset={resetFilters}
				/>
			</div>

			<BearRecommendation />

			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="text-sm font-bold text-[var(--sl-text)]">Heroes</p>

					<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
						{filteredHeroes.length} of {heroes.length} heroes
					</p>
				</div>

				{filters.generation !== "all" && (
					<div className="rounded-full bg-[var(--sl-active)] px-3 py-1 text-[11px] font-bold text-[var(--sl-text)]">
						Gen {filters.generation}
					</div>
				)}
			</div>

			<HeroList heroes={filteredHeroes} />
		</div>
	);
}
