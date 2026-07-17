"use client";

import type { PetDatabase } from "../type";
import PetCard from "./PetCard";

type PetCategoriesPageProps = {
	database: PetDatabase;
};

export default function PetCategoriesPage({
	database,
}: PetCategoriesPageProps) {
	const generations = [
		...new Set(database.pets.map((pet) => pet.generation)),
	].sort((a, b) => a - b);

	return (
		<div className="space-y-8">
			{generations.map((generation) => {
				const pets = database.pets.filter(
					(pet) => pet.generation === generation,
				);

				const unlockDays = pets[0]?.unlock.days ?? null;
				const furnace = pets[0]?.unlock.furnace ?? null;

				return (
					<section key={generation} className="space-y-3">
						<div className="flex items-center gap-2 px-1">
							<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--sl-text-muted)]">
								GEN {generation}
							</p>

							{unlockDays !== null && (
								<span className="text-[11px] text-[var(--sl-text-muted)]">
									· {unlockDays} days
								</span>
							)}

							{furnace !== null && (
								<span className="text-[11px] text-[var(--sl-text-muted)]">
									· F{furnace}
								</span>
							)}
						</div>

						<div className="grid grid-cols-2 gap-3">
							{pets.map((pet) => (
								<PetCard key={pet.id} pet={pet} />
							))}
						</div>
					</section>
				);
			})}
		</div>
	);
}
