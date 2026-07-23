"use client";

import Image from "next/image";
import Link from "next/link";

import type { PetData } from "../type";

type PetCardProps = {
	pet: PetData;
};

function getRarityClass(rarity: PetData["rarity"]) {
	switch (rarity) {
		case "Common":
			return "bg-amber-500/30 text-amber-200";

		case "Uncommon":
			return "bg-emerald-500/20 text-emerald-300";

		case "Rare":
			return "bg-blue-500/20 text-blue-300";

		case "Epic":
			return "bg-purple-500/20 text-purple-300";

		case "Legendary":
			return "bg-orange-500/20 text-orange-300";

		default:
			return "bg-[var(--sl-input)] text-[var(--sl-text-muted)]";
	}
}

export default function PetCard({ pet }: PetCardProps) {
	return (
		<Link
			href={`/pets/${pet.id}`}
			className="group rounded-2xl border border-[var(--sl-border)] bg-[var(--card)] p-3 transition"
		>
			<div className="flex flex-col items-center text-center">
				<div className="relative size-14 overflow-hidden rounded-xl bg-[var(--sl-input)]">
					<Image
						src={pet.image}
						alt={pet.name}
						fill
						className="object-contain"
						sizes="56px"
					/>
				</div>

				<p className="mt-2 text-sm font-bold text-[var(--sl-text)]">
					{pet.name}
				</p>

				<span
					className={`mt-2 w-full rounded-full px-2 py-1 text-[10px] font-bold ${getRarityClass(
						pet.rarity,
					)}`}
				>
					{pet.rarity}
				</span>

				<p className="mt-2 text-[11px] text-[var(--sl-text-muted)]">
					Max Lv.{pet.maxLevel}
				</p>
			</div>
		</Link>
	);
}
