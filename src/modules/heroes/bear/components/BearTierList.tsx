"use client";

import { Info, Medal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import type { NormalizedHero } from "../../type";

export type BearTierGroup = {
	id: string;
	label: string;
	description?: string;
	heroIds: string[];
};

type BearTierListProps = {
	heroes: NormalizedHero[];
	tiers: BearTierGroup[];
	title?: string;
	description?: string;
	className?: string;
};

export default function BearTierList({
	heroes,
	tiers,
	title = "Bear Hunt Tier List",
	description = "Recommended heroes for joining Bear Hunt rallies. Place the recommended hero in the first position.",
	className,
}: BearTierListProps) {
	const heroMap = useMemo(
		() => new Map(heroes.map((hero) => [normalizeHeroId(hero.id), hero])),
		[heroes],
	);

	return (
		<section
			className={[
				"overflow-hidden rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)]",
				className ?? "",
			].join(" ")}
		>
			<div className="flex items-start gap-3 border-b border-[var(--sl-border)] bg-[var(--sl-active)] px-4 py-4">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-primary)] text-[var(--sl-primary-foreground)]">
					<Medal size={19} />
				</div>

				<div className="min-w-0">
					<h2 className="text-sm font-black text-[var(--sl-text)]">{title}</h2>

					<p className="mt-1 text-[10px] leading-5 text-[var(--sl-text-muted)]">
						{description}
					</p>
				</div>
			</div>

			<div className="space-y-3 p-4">
				{tiers.length === 0 ? (
					<EmptyTierList />
				) : (
					tiers.map((tier, tierIndex) => {
						const tierHeroes = tier.heroIds
							.map((heroId) => heroMap.get(normalizeHeroId(heroId)))
							.filter((hero): hero is NormalizedHero => Boolean(hero));

						return (
							<TierRow
								key={tier.id}
								tier={tier}
								heroes={tierHeroes}
								index={tierIndex}
							/>
						);
					})
				)}

				<div className="flex items-start gap-3 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-active)] p-3">
					<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-surface)] text-[var(--sl-text-muted)]">
						<Info size={15} />
					</div>

					<p className="text-[10px] leading-5 text-[var(--sl-text-muted)]">
						The first hero affects the rally joining bonus. The second and third
						heroes can be adjusted based on the troops and heroes available in
						your account.
					</p>
				</div>
			</div>
		</section>
	);
}

function TierRow({
	tier,
	heroes,
	index,
}: {
	tier: BearTierGroup;
	heroes: NormalizedHero[];
	index: number;
}) {
	return (
		<div className="overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-active)]">
			<div className="flex items-stretch">
				<div
					className={[
						"flex w-16 shrink-0 flex-col items-center justify-center px-2 py-4 text-center",
						getTierClassName(tier.label, index),
					].join(" ")}
				>
					<span className="text-lg font-black">{tier.label}</span>

					<span className="mt-0.5 text-[8px] font-bold uppercase tracking-wider opacity-70">
						Tier
					</span>
				</div>

				<div className="min-w-0 flex-1 p-3">
					{tier.description && (
						<p className="mb-3 text-[9px] leading-4 text-[var(--sl-text-muted)]">
							{tier.description}
						</p>
					)}

					{heroes.length === 0 ? (
						<div className="flex min-h-16 items-center justify-center rounded-xl border border-dashed border-[var(--sl-border)] bg-[var(--sl-surface)] px-3">
							<p className="text-center text-[9px] text-[var(--sl-text-muted)]">
								No matching heroes found.
							</p>
						</div>
					) : (
						<div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
							{heroes.map((hero) => (
								<TierHeroItem key={`${tier.id}-${hero.id}`} hero={hero} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function TierHeroItem({ hero }: { hero: NormalizedHero }) {
	return (
		<Link href={`/heroes/${hero.id}`} className="group min-w-0">
			<div className="relative aspect-square overflow-hidden rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
				<Image
					src={hero.thumbnail}
					alt={hero.name}
					fill
					sizes="72px"
					className="object-cover object-top transition-transform duration-200 group-hover:scale-105"
				/>

				{hero.generation && (
					<span className="absolute left-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[7px] font-black text-white">
						{formatGeneration(hero.generation)}
					</span>
				)}
			</div>

			<p className="mt-1.5 truncate text-center text-[8px] font-bold text-[var(--sl-text)]">
				{hero.name}
			</p>
		</Link>
	);
}

function EmptyTierList() {
	return (
		<div className="rounded-2xl border border-dashed border-[var(--sl-border)] bg-[var(--sl-active)] px-4 py-10 text-center">
			<Medal size={22} className="mx-auto text-[var(--sl-text-muted)]" />

			<p className="mt-3 text-xs font-bold text-[var(--sl-text)]">
				No tier list available
			</p>

			<p className="mt-1 text-[10px] text-[var(--sl-text-muted)]">
				Add at least one tier to display the Bear Hunt recommendations.
			</p>
		</div>
	);
}

function getTierClassName(label: string, index: number): string {
	const normalizedLabel = label.trim().toUpperCase();

	switch (normalizedLabel) {
		case "S+":
		case "S":
			return "bg-rose-500/20 text-rose-500";

		case "A":
			return "bg-orange-500/20 text-orange-500";

		case "B":
			return "bg-amber-500/20 text-amber-500";

		case "C":
			return "bg-emerald-500/20 text-emerald-500";

		case "D":
			return "bg-sky-500/20 text-sky-500";

		default:
			return index === 0
				? "bg-rose-500/20 text-rose-500"
				: "bg-[var(--sl-surface)] text-[var(--sl-text)]";
	}
}

function normalizeHeroId(value: unknown): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[_\s]+/g, "-")
		.replace(/[^a-z0-9-]+/g, "")
		.replace(/-+/g, "-")
		.replace(/^-+|-+$/g, "");
}

function formatGeneration(generation: string | number): string {
	const value = String(generation ?? "").trim();

	if (!value) {
		return "";
	}

	if (/^\d+$/.test(value)) {
		return `S${value}`;
	}

	if (/^s\d+$/i.test(value)) {
		return value.toUpperCase();
	}

	return value;
}
