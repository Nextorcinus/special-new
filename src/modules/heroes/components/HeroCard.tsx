"use client";

import { ArrowUpRight, ImageOff, Shield, Swords } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";

import {
	formatGeneration,
	getHeroClassLabel,
	getHeroRarityLabel,
} from "../helpers/hero.helpers";

import type { HeroClass, HeroRarity, NormalizedHero } from "../type";

type HeroCardProps = {
	hero: NormalizedHero;
};

export default function HeroCard({ hero }: HeroCardProps) {
	const [imageError, setImageError] = useState(false);

	return (
		<Link href={`/heroes/${hero.id}`} className="group block min-w-0">
			<article className="overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sl-primary)]">
				<div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--sl-active)]">
					{imageError ? (
						<div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--sl-text-muted)]">
							<ImageOff size={24} />

							<span className="text-[9px]">Image not found</span>
						</div>
					) : (
						<img
							src={hero.thumbnail}
							alt={hero.name}
							loading="lazy"
							onError={() => setImageError(true)}
							className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
						/>
					)}

					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

					<div className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-sm">
						{formatGeneration(hero.generation)}
					</div>

					{hero.tier && (
						<div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-lg bg-black/65 text-[10px] font-black text-white backdrop-blur-sm">
							{hero.tier}
						</div>
					)}

					<div className="absolute inset-x-0 bottom-0 p-3">
						<h3 className="truncate text-sm font-black text-white">
							{hero.name}
						</h3>
					</div>
				</div>

				<div className="p-3">
					<div className="flex items-center justify-between gap-2">
						<div className="flex min-w-0 items-center gap-1.5">
							<HeroClassIcon heroClass={hero.heroClass} />

							<span className="truncate text-[10px] font-bold text-[var(--sl-text)]">
								{getHeroClassLabel(hero.heroClass)}
							</span>
						</div>

						<span
							className={cn(
								"shrink-0 rounded-full px-2 py-1 text-[9px] font-black",
								getRarityClassName(hero.rarity),
							)}
						>
							{getHeroRarityLabel(hero.rarity)}
						</span>
					</div>
				</div>
			</article>
		</Link>
	);
}

function HeroClassIcon({ heroClass }: { heroClass: HeroClass }) {
	const normalized = String(heroClass).trim().toLowerCase();

	const iconClassName = "size-4 shrink-0 text-[var(--sl-text-muted)]";

	switch (normalized) {
		case "infantry":
			return <Shield size={16} className={iconClassName} />;

		case "lancer":
			return (
				<ArrowUpRight size={16} strokeWidth={2.4} className={iconClassName} />
			);

		case "marksman":
			return <Swords size={16} className={iconClassName} />;

		default:
			return <Shield size={16} className={iconClassName} />;
	}
}

function getRarityClassName(rarity: HeroRarity): string {
	switch (String(rarity).trim().toLowerCase()) {
		case "legendary":
			return "bg-amber-500/15 text-amber-400";

		case "mythic":
			return "bg-orange-500/15 text-orange-400";

		case "epic":
			return "bg-violet-500/15 text-violet-400";

		case "rare":
			return "bg-blue-500/15 text-blue-400";

		default:
			return "bg-[var(--sl-active)] text-[var(--sl-text-muted)]";
	}
}
