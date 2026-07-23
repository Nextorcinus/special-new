"use client";

import {
	ChevronDown,
	ChevronRight,
	Crown,
	ShieldCheck,
	Swords,
	UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { getHeroes } from "@/modules/heroes";
import type { NormalizedHero } from "@/modules/heroes/type";

type BearRecommendationGroup = {
	id: string;
	title: string;
	subtitle: string;
	badge?: string;
	heroIds: string[];
};

type BearRecommendationData = {
	opening: BearRecommendationGroup[];
	joining: BearRecommendationGroup[];
};

type BearRecommendationProps = {
	showReadMore?: boolean;
	readMoreHref?: string;
};

type HeroMap = Map<string, NormalizedHero>;

const BEAR_RECOMMENDATION: BearRecommendationData = {
	opening: [
		{
			id: "opening-p2w",
			title: "P2W",
			subtitle: "Best premium setup for opening your own Bear Hunt rally.",
			badge: "Premium",
			heroIds: ["jeronimo", "natalia", "molly", "zinman"],
		},
		{
			id: "opening-f2p",
			title: "F2P",
			subtitle: "Recommended setup for free-to-play players.",
			badge: "F2P",
			heroIds: ["sergey", "molly", "bahiti"],
		},
	],
	joining: [
		{
			id: "joining-priority",
			title: "Joining Priority",
			subtitle:
				"Use one of these heroes in the first position when joining another rally.",
			badge: "Priority",
			heroIds: ["jessie", "jasser", "seoyoon"],
		},
	],
};

function normalizeHeroId(value: unknown): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/[_\s]+/g, "-");
}

function getHeroThumbnail(hero: NormalizedHero): string {
	const thumbnail = String(hero.thumbnail ?? "").trim();

	if (!thumbnail) {
		return "/heroes/placeholder.png";
	}

	if (
		thumbnail.startsWith("/") ||
		thumbnail.startsWith("http://") ||
		thumbnail.startsWith("https://")
	) {
		return thumbnail;
	}

	return `/heroes/${thumbnail}`;
}

function resolveHeroes(
	heroIds: string[] | undefined,
	heroMap: HeroMap,
): NormalizedHero[] {
	if (!Array.isArray(heroIds)) {
		return [];
	}

	return heroIds
		.map((heroId) => heroMap.get(normalizeHeroId(heroId)))
		.filter((hero): hero is NormalizedHero => Boolean(hero));
}

export default function BearRecommendation({
	showReadMore = true,
	readMoreHref = "/heroes/bear",
}: BearRecommendationProps) {
	const [isOpen, setIsOpen] = useState(false);

	const heroes = useMemo(() => getHeroes(), []);

	const heroMap = useMemo<HeroMap>(() => {
		const map: HeroMap = new Map();

		for (const hero of heroes) {
			map.set(normalizeHeroId(hero.id), hero);
		}

		return map;
	}, [heroes]);

	return (
		<section className="overflow-hidden rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
			<button
				type="button"
				onClick={() => setIsOpen((current) => !current)}
				aria-expanded={isOpen}
				aria-controls="bear-recommendation-content"
				className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-[var(--sl-hover)]"
			>
				<div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-text)] text-[var(--sl-bg)]">
					<Swords size={18} />
				</div>

				<div className="min-w-0 flex-1">
					<h2 className="text-sm font-black text-[var(--sl-text)]">
						Bear Recommendation
					</h2>

					<p className="mt-1 text-[10px] leading-5 text-[var(--sl-text-muted)]">
						Hero recommendations for opening and joining Bear Hunt rallies.
					</p>
				</div>

				<ChevronDown
					size={18}
					className={cn(
						"mt-1 shrink-0 text-[var(--sl-text-muted)] transition-transform duration-200",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			{isOpen && (
				<div
					id="bear-recommendation-content"
					className="space-y-5 border-t border-[var(--sl-border)] p-4"
				>
					<RecommendationSection
						title="Opening Rally"
						description="Recommended heroes for starting your own Bear Hunt rally."
						icon="opening"
						groups={BEAR_RECOMMENDATION.opening}
						heroMap={heroMap}
					/>

					<RecommendationSection
						title="Joining Priority"
						description="Use these heroes in the first hero position when joining another rally."
						icon="joining"
						groups={BEAR_RECOMMENDATION.joining}
						heroMap={heroMap}
					/>
				</div>
			)}

			{showReadMore && (
				<Link
					href={readMoreHref}
					className="flex items-center justify-between gap-3 border-t border-[var(--sl-border)] px-4 py-3 transition-colors hover:bg-[var(--sl-hover)]"
				>
					<div className="min-w-0">
						<p className="text-[10px] font-black text-[var(--sl-text)]">
							Read More
						</p>

						<p className="mt-0.5 text-[8px] text-[var(--sl-text-muted)]">
							View complete Bear Hunt recommendations.
						</p>
					</div>

					<ChevronRight
						size={16}
						className="shrink-0 text-[var(--sl-text-muted)]"
					/>
				</Link>
			)}
		</section>
	);
}

function RecommendationSection({
	title,
	description,
	icon,
	groups,
	heroMap,
}: {
	title: string;
	description: string;
	icon: "opening" | "joining";
	groups: BearRecommendationGroup[];
	heroMap: HeroMap;
}) {
	const SectionIcon = icon === "opening" ? Swords : UsersRound;

	return (
		<section>
			<div className="flex items-start gap-3">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-active)] text-[var(--sl-text)]">
					<SectionIcon size={15} />
				</div>

				<div className="min-w-0">
					<h3 className="text-xs font-black text-[var(--sl-text)]">{title}</h3>

					<p className="mt-1 text-[9px] leading-4 text-[var(--sl-text-muted)]">
						{description}
					</p>
				</div>
			</div>

			<div className="mt-3 space-y-3">
				{groups.map((group) => (
					<RecommendationGroupCard
						key={group.id}
						group={group}
						heroMap={heroMap}
					/>
				))}
			</div>
		</section>
	);
}

function RecommendationGroupCard({
	group,
	heroMap,
}: {
	group: BearRecommendationGroup;
	heroMap: HeroMap;
}) {
	const resolvedHeroes = resolveHeroes(group.heroIds, heroMap);

	const isF2p = group.title.trim().toLowerCase() === "f2p";

	const isJoining = group.id.trim().toLowerCase().includes("joining");

	const BadgeIcon = isF2p ? ShieldCheck : Crown;

	return (
		<div className="overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface-2)]">
			<div className="flex items-center justify-between gap-3 border-b border-[var(--sl-border)] px-3 py-3">
				<div className="min-w-0">
					<p className="text-[8px] font-black uppercase tracking-[0.14em] text-[var(--sl-text-muted)]">
						{isJoining
							? "Joining"
							: group.title === "P2W"
								? "Opening"
								: group.title}
					</p>

					<h4 className="mt-0.5 text-xs font-black text-[var(--sl-text)]">
						{group.title}
					</h4>
				</div>

				{group.badge && (
					<div
						className={cn(
							"flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[8px] font-black",
							isF2p
								? "bg-emerald-500/15 text-emerald-400"
								: isJoining
									? "bg-sky-500/15 text-sky-400"
									: "bg-amber-500/15 text-amber-500",
						)}
					>
						<BadgeIcon size={10} />

						<span>{group.badge}</span>
					</div>
				)}
			</div>

			<div className="p-3">
				{resolvedHeroes.length === 0 ? (
					<EmptyHeroGroup heroIds={group.heroIds} />
				) : (
					<div
						className={cn(
							"grid gap-2",
							resolvedHeroes.length >= 4
								? "grid-cols-4"
								: resolvedHeroes.length === 2
									? "grid-cols-2"
									: "grid-cols-3",
						)}
					>
						{resolvedHeroes.map((hero, position) => (
							<RecommendationHero
								key={hero.id}
								hero={hero}
								position={position + 1}
							/>
						))}
					</div>
				)}

				<p className="mt-3 text-[9px] leading-4 text-[var(--sl-text-muted)]">
					{group.subtitle}
				</p>
			</div>
		</div>
	);
}

function RecommendationHero({
	hero,
	position,
}: {
	hero: NormalizedHero;
	position: number;
}) {
	return (
		<Link
			href={`/heroes/${hero.id}`}
			aria-label={`Open ${hero.name} hero details`}
			className="group block min-w-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--sl-primary)]"
		>
			<div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--sl-active)]">
				<Image
					src={getHeroThumbnail(hero)}
					alt={hero.name}
					fill
					sizes="(max-width: 430px) 25vw, 90px"
					className="object-cover transition-transform duration-200 group-hover:scale-105"
				/>

				<div className="absolute left-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/75 text-[8px] font-black text-white">
					{position}
				</div>

				{hero.generation && (
					<div className="absolute right-1 top-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[7px] font-black text-white">
						{hero.generation}
					</div>
				)}
			</div>

			<p className="mt-1.5 truncate text-center text-[8px] font-black text-[var(--sl-text)] transition-colors group-hover:text-[var(--sl-primary)]">
				{hero.name}
			</p>
		</Link>
	);
}

function EmptyHeroGroup({ heroIds }: { heroIds: string[] }) {
	return (
		<div className="rounded-xl border border-dashed border-[var(--sl-border)] bg-[var(--sl-active)] px-3 py-6 text-center">
			<p className="text-[9px] font-bold text-[var(--sl-text-muted)]">
				No heroes configured.
			</p>

			{heroIds.length > 0 && (
				<p className="mt-1 break-words text-[8px] text-[var(--sl-text-muted)]">
					Hero IDs: {heroIds.join(", ")}
				</p>
			)}
		</div>
	);
}
