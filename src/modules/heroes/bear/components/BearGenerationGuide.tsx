"use client";

import {
	CalendarDays,
	ChevronDown,
	Crown,
	Info,
	ShieldCheck,
	Sparkles,
	Swords,
	UsersRound,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import type { NormalizedHero } from "@/modules/heroes/type";

export type BearGenerationSetup = {
	type: string;
	id: string[];
	formation: string;
	suggest: string;
};

export type BearGenerationGuideItem = {
	generation: string;
	setups: BearGenerationSetup[];
};

type BearGenerationGuideProps = {
	heroes: NormalizedHero[];
	items: BearGenerationGuideItem[];
};

type HeroMap = Map<string, NormalizedHero>;

function normalizeHeroId(value: unknown): string {
	return String(value ?? "")
		.trim()
		.toLowerCase()
		.replace(/[_\s]+/g, "-");
}

function getGenerationNumber(generation: string): number {
	const result = Number.parseInt(String(generation).replace(/\D/g, ""), 10);

	return Number.isFinite(result) ? result : 0;
}

function getGenerationLabel(generation: string): string {
	const value = String(generation).trim();

	if (!value) {
		return "Unknown";
	}

	if (/^s\d+$/i.test(value)) {
		return value.toUpperCase();
	}

	if (/^\d+$/.test(value)) {
		return `S${value}`;
	}

	return value;
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

function getSetupKey(generation: string, setup: BearGenerationSetup): string {
	return [generation, setup.type, setup.formation, setup.id.join("-")].join(
		"-",
	);
}

function getSetupStyle(type: string) {
	const normalizedType = type.trim().toLowerCase();

	if (
		normalizedType.includes("best") &&
		!normalizedType.includes("alternative")
	) {
		return {
			icon: Crown,
			label: "Best Setup",
			iconClass: "bg-amber-500/15 text-amber-500",
			badgeClass: "border-amber-500/20 bg-amber-500/10 text-amber-500",
		};
	}

	if (normalizedType.includes("alternative")) {
		return {
			icon: Sparkles,
			label: "Alternative",
			iconClass: "bg-sky-500/15 text-sky-400",
			badgeClass: "border-sky-500/20 bg-sky-500/10 text-sky-400",
		};
	}

	if (normalizedType.includes("f2p")) {
		return {
			icon: ShieldCheck,
			label: "F2P",
			iconClass: "bg-emerald-500/15 text-emerald-400",
			badgeClass: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
		};
	}

	return {
		icon: Swords,
		label: type,
		iconClass: "bg-[var(--sl-active)] text-[var(--sl-text)]",
		badgeClass:
			"border-[var(--sl-border)] bg-[var(--sl-active)] text-[var(--sl-text)]",
	};
}

export default function BearGenerationGuide({
	heroes,
	items,
}: BearGenerationGuideProps) {
	const sortedItems = useMemo(() => {
		if (!Array.isArray(items)) {
			return [];
		}

		return [...items].sort(
			(a, b) =>
				getGenerationNumber(a.generation) - getGenerationNumber(b.generation),
		);
	}, [items]);

	const heroMap = useMemo<HeroMap>(() => {
		const map: HeroMap = new Map();

		for (const hero of heroes) {
			map.set(normalizeHeroId(hero.id), hero);
		}

		return map;
	}, [heroes]);

	return (
		<section className="overflow-hidden rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
			<GuideHeader />

			<div className="space-y-4 p-4">
				{sortedItems.length === 0 ? (
					<EmptyGuide />
				) : (
					sortedItems.map((item) => (
						<GenerationCard
							key={`generation-${item.generation}`}
							item={item}
							heroMap={heroMap}
						/>
					))
				)}

				<GuideInformation />
			</div>
		</section>
	);
}

function GuideHeader() {
	return (
		<header className="border-b border-[var(--sl-border)] p-4">
			<div className="flex items-start gap-3">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-active)] text-[var(--sl-text)]">
					<CalendarDays size={19} />
				</div>

				<div className="min-w-0">
					<h2 className="text-sm font-black text-[var(--sl-text)]">
						Generation Guide
					</h2>

					<p className="mt-1 text-[10px] leading-4 text-[var(--sl-text-muted)]">
						Bear Hunt recommendations based on the hero generation available in
						your state.
					</p>
				</div>
			</div>
		</header>
	);
}

function GenerationCard({
	item,
	heroMap,
}: {
	item: BearGenerationGuideItem;
	heroMap: HeroMap;
}) {
	const [isOpen, setIsOpen] = useState(true);

	const generationLabel = getGenerationLabel(item.generation);

	const setups = Array.isArray(item.setups) ? item.setups : [];

	return (
		<article className="overflow-hidden rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface-2)]">
			<button
				type="button"
				onClick={() => setIsOpen((current) => !current)}
				aria-expanded={isOpen}
				className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[var(--sl-hover)]"
			>
				<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-text)] text-sm font-black text-[var(--sl-bg)]">
					{generationLabel}
				</div>

				<div className="min-w-0 flex-1">
					<h3 className="truncate text-xs font-black text-[var(--sl-text)]">
						{generationLabel} Recommendation
					</h3>

					<p className="mt-1 text-[9px] text-[var(--sl-text-muted)]">
						{setups.length} recommended setups
					</p>
				</div>

				<span className="rounded-full border border-[var(--sl-border)] bg-[var(--sl-active)] px-2.5 py-1 text-[8px] font-black uppercase tracking-wide text-[var(--sl-text-muted)]">
					Generation
				</span>

				<ChevronDown
					size={16}
					className={cn(
						"shrink-0 text-[var(--sl-text-muted)] transition-transform",
						isOpen && "rotate-180",
					)}
				/>
			</button>

			{isOpen && (
				<div className="space-y-3 border-t border-[var(--sl-border)] p-4">
					{setups.length === 0 ? (
						<EmptySetup />
					) : (
						setups.map((setup) => (
							<SetupCard
								key={getSetupKey(item.generation, setup)}
								setup={setup}
								heroMap={heroMap}
							/>
						))
					)}
				</div>
			)}
		</article>
	);
}

function SetupCard({
	setup,
	heroMap,
}: {
	setup: BearGenerationSetup;
	heroMap: HeroMap;
}) {
	const heroes = resolveHeroes(setup.id, heroMap);
	const style = getSetupStyle(setup.type);
	const SetupIcon = style.icon;

	return (
		<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-3">
			<div className="flex items-start gap-3">
				<div
					className={cn(
						"flex size-9 shrink-0 items-center justify-center rounded-xl",
						style.iconClass,
					)}
				>
					<SetupIcon size={16} />
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<h4 className="text-xs font-black text-[var(--sl-text)]">
							{setup.type}
						</h4>

						<span
							className={cn(
								"rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wide",
								style.badgeClass,
							)}
						>
							{style.label}
						</span>
					</div>

					<p className="mt-1 text-[9px] leading-4 text-[var(--sl-text-muted)]">
						Recommended heroes for opening your Bear Hunt rally.
					</p>
				</div>
			</div>

			<div className="mt-3">
				{heroes.length === 0 ? (
					<MissingHeroes heroIds={setup.id} />
				) : (
					<div className="grid grid-cols-3 gap-2">
						{heroes.map((hero) => (
							<HeroCard key={hero.id} hero={hero} />
						))}
					</div>
				)}
			</div>

			<div className="mt-3 grid gap-2 sm:grid-cols-[120px_1fr]">
				<FormationCard formation={setup.formation} />

				<SuggestionCard suggestion={setup.suggest} />
			</div>
		</div>
	);
}

function HeroCard({ hero }: { hero: NormalizedHero }) {
	return (
		<div className="min-w-0 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-active)] p-2">
			<div className="relative mx-auto aspect-square w-full max-w-20 overflow-hidden rounded-xl bg-[var(--sl-surface-3)]">
				<Image
					src={getHeroThumbnail(hero)}
					alt={hero.name}
					fill
					sizes="80px"
					className="object-cover"
				/>

				{hero.generation && (
					<span className="absolute right-1 top-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[7px] font-black text-white">
						{hero.generation}
					</span>
				)}
			</div>

			<p className="mt-2 truncate text-center text-[9px] font-black text-[var(--sl-text)]">
				{hero.name}
			</p>

			{"heroClass" in hero && hero.heroClass && (
				<p className="mt-0.5 truncate text-center text-[8px] text-[var(--sl-text-muted)]">
					{String(hero.heroClass)}
				</p>
			)}
		</div>
	);
}

function FormationCard({ formation }: { formation: string }) {
	const values = formation
		.split("/")
		.map((value) => value.trim())
		.filter(Boolean);

	const [infantry = "0", lancer = "0", marksman = "0"] = values;

	return (
		<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-active)] p-3">
			<div className="flex items-center gap-2">
				<UsersRound size={14} className="text-[var(--sl-text-muted)]" />

				<p className="text-[9px] font-black uppercase tracking-wide text-[var(--sl-text-muted)]">
					Formation
				</p>
			</div>

			<p className="mt-2 text-lg font-black text-[var(--sl-text)]">
				{formation || "Not configured"}
			</p>

			<div className="mt-2 space-y-1">
				<FormationValue label="Infantry" value={infantry} />

				<FormationValue label="Lancer" value={lancer} />

				<FormationValue label="Marksman" value={marksman} />
			</div>
		</div>
	);
}

function FormationValue({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-2 text-[8px]">
			<span className="text-[var(--sl-text-muted)]">{label}</span>

			<span className="font-black text-[var(--sl-text)]">{value}0%</span>
		</div>
	);
}

function SuggestionCard({ suggestion }: { suggestion: string }) {
	return (
		<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-active)] p-3">
			<div className="flex items-center gap-2">
				<Info size={14} className="text-[var(--sl-text-muted)]" />

				<p className="text-[9px] font-black uppercase tracking-wide text-[var(--sl-text-muted)]">
					Recommendation
				</p>
			</div>

			<p className="mt-2 text-[9px] leading-4 text-[var(--sl-text)]">
				{suggestion || "No recommendation available."}
			</p>
		</div>
	);
}

function MissingHeroes({ heroIds }: { heroIds: string[] }) {
	return (
		<div className="rounded-2xl border border-dashed border-[var(--sl-border)] bg-[var(--sl-active)] p-4 text-center">
			<p className="text-[9px] font-bold text-[var(--sl-text-muted)]">
				Hero data could not be resolved.
			</p>

			{heroIds.length > 0 && (
				<p className="mt-1 break-words text-[8px] text-[var(--sl-text-muted)]">
					IDs: {heroIds.join(", ")}
				</p>
			)}
		</div>
	);
}

function EmptySetup() {
	return (
		<div className="rounded-2xl border border-dashed border-[var(--sl-border)] bg-[var(--sl-active)] px-4 py-8 text-center">
			<p className="text-[10px] text-[var(--sl-text-muted)]">
				No setup configured for this generation.
			</p>
		</div>
	);
}

function EmptyGuide() {
	return (
		<div className="rounded-2xl border border-dashed border-[var(--sl-border)] bg-[var(--sl-active)] px-4 py-10 text-center">
			<p className="text-xs font-black text-[var(--sl-text)]">
				No Generation Guide
			</p>

			<p className="mt-1 text-[9px] text-[var(--sl-text-muted)]">
				Add generation setup data to display the recommendations.
			</p>
		</div>
	);
}

function GuideInformation() {
	return (
		<div className="flex items-start gap-3 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-active)] p-3">
			<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-surface)] text-[var(--sl-text-muted)]">
				<Info size={15} />
			</div>

			<p className="text-[9px] leading-4 text-[var(--sl-text-muted)]">
				Use the recommendation matching the newest hero generation currently
				available in your state. Formation values use Infantry, Lancer, and
				Marksman order.
			</p>
		</div>
	);
}
