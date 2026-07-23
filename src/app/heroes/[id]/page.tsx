import { ArrowLeft, Shield, Sparkles, Swords, Target, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import { getHero, getHeroDetail, getHeroes } from "@/modules/heroes";

import {
	formatGeneration,
	getHeroClassLabel,
	getHeroRarityLabel,
} from "@/modules/heroes/helpers/hero.helpers";

import {
	getHeroAssetPath,
	getHeroSkillIconPath,
	getHeroUniquePassiveIconPath,
} from "@/modules/heroes/helpers/hero-detail.helpers";

import type {
	HeroSkill,
	HeroSkillMap,
	HeroWidgetStats,
} from "@/modules/heroes/type";

type HeroDetailPageProps = {
	params: Promise<{
		id: string;
	}>;
};

type StatValue = string | number | undefined | null;

type StatItem = {
	label: string;
	value: StatValue;
};

type SkillStatGroup = {
	id: string;
	label: string;
	values: string[];
};

export function generateStaticParams() {
	return getHeroes().map((hero) => ({
		id: hero.id,
	}));
}

export default async function HeroDetailPage({ params }: HeroDetailPageProps) {
	const { id } = await params;

	const hero = getHero(id);
	const detail = getHeroDetail(id);

	if (!hero || !detail) {
		notFound();
	}

	const explorationStats: StatItem[] = [
		{
			label: "Attack",
			value: detail.stats?.attack,
		},
		{
			label: "Defense",
			value: detail.stats?.defense,
		},
		{
			label: "Health",
			value: detail.stats?.health,
		},
	];

	const expeditionStats: StatItem[] = [
		{
			label: "Attack",
			value: detail.expedition?.attack,
		},
		{
			label: "Defense",
			value: detail.expedition?.defense,
		},
		{
			label: "Health",
			value: detail.expedition?.health,
		},
		{
			label: "Lethality",
			value: detail.expedition?.lethality,
		},
	];

	return (
		<MobileContainer>
			<HeaderOther title={hero.name} />

			<main className="space-y-4 px-1 pb-24 pt-5">
				<Link
					href="/heroes"
					className="inline-flex items-center gap-2 text-xs font-bold text-[var(--sl-text-muted)] transition-colors hover:text-[var(--sl-text)]"
				>
					<ArrowLeft size={15} />
					Back to Heroes
				</Link>

				<HeroHeader
					name={detail.name}
					image={detail.image}
					generation={detail.generation}
					heroClass={detail.class}
					rarity={detail.rarity}
					tier={hero.tier}
				/>

				<StatsSection
					title="Exploration Stats"
					icon={<Swords size={17} />}
					items={explorationStats}
				/>

				<StatsSection
					title="Expedition Stats"
					icon={<Shield size={17} />}
					items={expeditionStats}
				/>

				<SkillSection
					title="Exploration Skills"
					icon={<Sparkles size={17} />}
					skills={detail.skills.exploration}
				/>

				<SkillSection
					title="Expedition Skills"
					icon={<Target size={17} />}
					skills={detail.skills.expedition}
				/>

				{detail.widget?.["has-widget"] && <WidgetSection detail={detail} />}

				{detail.uniquePassive?.name && (
					<UniquePassiveSection
						name={detail.uniquePassive.name}
						icon={detail.uniquePassive.icon}
						ability={detail.uniquePassive.ability}
						stats={detail.uniquePassive.stats}
					/>
				)}
			</main>
		</MobileContainer>
	);
}

type HeroHeaderProps = {
	name: string;
	image: string;
	generation: string | number;
	heroClass: string;
	rarity: string;
	tier?: string;
};

function HeroHeader({
	name,
	image,
	generation,
	heroClass,
	rarity,
	tier,
}: HeroHeaderProps) {
	return (
		<section className="overflow-hidden rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
			<div className="relative aspect-[4/5] overflow-hidden bg-[var(--sl-active)]">
				<Image
					src={getHeroAssetPath(image)}
					alt={name}
					fill
					priority
					sizes="(max-width: 768px) 100vw, 640px"
					className="object-cover object-top"
				/>

				<div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black via-black/65 to-transparent" />

				<div className="absolute inset-x-0 bottom-0 p-5">
					<p className="text-xs font-bold text-white/70">
						{formatGeneration(generation)}
					</p>

					<h1 className="mt-1 text-2xl font-black text-white">{name}</h1>

					<div className="mt-3 flex flex-wrap gap-2">
						<Badge>{getHeroClassLabel(heroClass)}</Badge>

						<Badge>{getHeroRarityLabel(rarity)}</Badge>

						{tier && <Badge>Tier {tier}</Badge>}
					</div>
				</div>
			</div>
		</section>
	);
}

function Badge({ children }: { children: ReactNode }) {
	return (
		<span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
			{children}
		</span>
	);
}

type StatsSectionProps = {
	title: string;
	icon: ReactNode;
	items: StatItem[];
};

function StatsSection({ title, icon, items }: StatsSectionProps) {
	const visibleItems = items.filter((item) => hasDisplayValue(item.value));

	if (visibleItems.length === 0) {
		return null;
	}

	const gridClassName =
		visibleItems.length === 3 ? "grid-cols-3" : "grid-cols-2";

	return (
		<section className="rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
			<SectionTitle icon={icon} title={title} />

			<div className={`mt-4 grid gap-2 ${gridClassName}`}>
				{visibleItems.map((item) => (
					<div
						key={item.label}
						className="min-w-0 rounded-2xl bg-[var(--sl-active)] p-3"
					>
						<p className="truncate text-[9px] font-bold uppercase tracking-wide text-[var(--sl-text-muted)]">
							{item.label}
						</p>

						<p className="mt-1 break-words text-sm font-black text-[var(--sl-text)]">
							{formatStatValue(item.value)}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}

type SkillSectionProps = {
	title: string;
	icon: ReactNode;
	skills: HeroSkillMap;
};

function SkillSection({ title, icon, skills }: SkillSectionProps) {
	const entries = Object.entries(skills).filter(([, skill]) =>
		isValidSkill(skill),
	);

	if (entries.length === 0) {
		return null;
	}

	return (
		<section className="rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
			<SectionTitle icon={icon} title={title} />

			<div className="mt-4 space-y-3">
				{entries.map(([skillId, skill]) => (
					<SkillCard key={skillId} skill={skill} />
				))}
			</div>
		</section>
	);
}

function SkillCard({ skill }: { skill: HeroSkill }) {
	const effect = skill.effects;

	const skillName = getTextValue(skill["skill-name"]) || "Hero Skill";

	const effectName = getTextValue(effect?.["effect-name"]);

	const description = getTextValue(effect?.description);

	const skillIcon = getHeroSkillIconPath(effect?.icon);

	const stats = normalizeSkillStats(effect?.stats);

	const statGroups = createSkillStatGroups(stats);

	return (
		<article className="overflow-hidden rounded-2xl bg-[var(--sl-active)]">
			<div className="p-3">
				<div className="flex items-start gap-3">
					<div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-black/20">
						<Image
							src={skillIcon}
							alt={skillName}
							fill
							sizes="48px"
							className="object-cover"
						/>
					</div>

					<div className="min-w-0 flex-1">
						<h3 className="text-sm font-black text-[var(--sl-text)]">
							{skillName}
						</h3>

						{effectName && (
							<p className="mt-1 text-[10px] font-bold leading-4 text-[var(--sl-primary)]">
								{effectName}
							</p>
						)}
					</div>
				</div>

				{description && (
					<p className="mt-3 text-xs leading-5 text-[var(--sl-text-muted)]">
						{description}
					</p>
				)}

				<SkillMetadata skill={skill} />

				{statGroups.length > 0 && <SkillStats groups={statGroups} />}
			</div>
		</article>
	);
}

function SkillMetadata({ skill }: { skill: HeroSkill }) {
	const triggerPoint = getTextValue(skill["trigger-point"]);

	const triggerTime = getTextValue(skill["trigger-time"]);

	if (!triggerPoint && !triggerTime) {
		return null;
	}

	return (
		<div className="mt-3 flex flex-wrap gap-2">
			{triggerPoint && <SkillMeta label="Trigger" value={triggerPoint} />}

			{triggerTime && <SkillMeta label="Time" value={triggerTime} />}
		</div>
	);
}

function SkillStats({ groups }: { groups: SkillStatGroup[] }) {
	return (
		<div className="mt-4 space-y-3">
			{groups.map((group) => (
				<div key={group.id}>
					<p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[var(--sl-text-muted)]">
						{group.label}
					</p>

					<div className="grid grid-cols-5 gap-1.5">
						{group.values.map((stat, position) => {
							const level = position + 1;

							const key = `${group.id}-level-${level}-${stat}`;

							return (
								<div
									key={key}
									className="min-w-0 rounded-xl bg-[var(--sl-surface)] px-1 py-2 text-center"
								>
									<p className="text-[8px] font-bold uppercase text-[var(--sl-text-muted)]">
										Lv.{level}
									</p>

									<p className="mt-1 break-words text-[10px] font-black leading-4 text-[var(--sl-text)]">
										{stat}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}

function SkillMeta({ label, value }: { label: string; value: string }) {
	return (
		<span className="rounded-full bg-[var(--sl-surface)] px-2.5 py-1 text-[9px] leading-4 text-[var(--sl-text-muted)]">
			<span className="font-bold text-[var(--sl-text)]">{label}:</span> {value}
		</span>
	);
}

type WidgetSectionProps = {
	detail: {
		"widget-name"?: string;
		"widget-icon"?: string;
		"widget-affect-on"?: string;
		"widget-level"?: string;
		"widget-stats"?: HeroWidgetStats;
	};
};

function WidgetSection({ detail }: WidgetSectionProps) {
	const widgetName = getTextValue(detail["widget-name"]);

	const widgetAffectOn = getTextValue(detail["widget-affect-on"]);

	const widgetLevel = getTextValue(detail["widget-level"]);

	const widgetStats = detail["widget-stats"];

	const exploration = widgetStats?.exploration;

	const expedition = widgetStats?.expedition;

	return (
		<section className="rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
			<SectionTitle icon={<Zap size={17} />} title="Widget" />

			<div className="mt-4 space-y-3">
				<div className="rounded-2xl bg-[var(--sl-active)] p-3">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0 flex-1">
							{widgetName && (
								<p className="text-sm font-black text-[var(--sl-text)]">
									{widgetName}
								</p>
							)}

							{widgetAffectOn && (
								<p className="mt-1 text-[10px] font-bold leading-4 text-[var(--sl-primary)]">
									{widgetAffectOn}
								</p>
							)}
						</div>

						{widgetLevel && (
							<span className="shrink-0 rounded-full bg-[var(--sl-surface)] px-2.5 py-1 text-[10px] font-black text-[var(--sl-text)]">
								{widgetLevel}
							</span>
						)}
					</div>
				</div>

				{exploration && (
					<WidgetEffectCard
						title="Exploration"
						name={exploration.name}
						icon={exploration.icon}
						ability={exploration.ability}
						stats={[
							{
								label: "Attack",
								value: exploration.attack,
							},
							{
								label: "Defense",
								value: exploration.defense,
							},
							{
								label: "Health",
								value: exploration.health,
							},
						]}
					/>
				)}

				{expedition && (
					<WidgetEffectCard
						title="Expedition"
						name={expedition.name}
						icon={expedition.icon}
						ability={expedition.ability}
						stats={[
							{
								label: "Lethality",
								value: expedition.lethality,
							},
							{
								label: "Health",
								value: expedition.Health ?? expedition.health,
							},
						]}
					/>
				)}

				{!exploration && !expedition && (
					<div className="rounded-2xl bg-[var(--sl-active)] p-3">
						<p className="text-xs leading-5 text-[var(--sl-text-muted)]">
							Widget effect data is not available.
						</p>
					</div>
				)}
			</div>
		</section>
	);
}

type WidgetEffectCardProps = {
	title: string;
	name?: string;
	icon?: string;
	ability?: string;
	stats: Array<{
		label: string;
		value?: string | number;
	}>;
};

function WidgetEffectCard({
	title,
	name,
	icon,
	ability,
	stats,
}: WidgetEffectCardProps) {
	const normalizedName = getTextValue(name);

	const normalizedAbility = getTextValue(ability);

	const visibleStats = stats.filter((item) => hasDisplayValue(item.value));

	const gridClassName =
		visibleStats.length === 3 ? "grid-cols-3" : "grid-cols-2";

	return (
		<article className="rounded-2xl bg-[var(--sl-active)] p-3">
			<p className="text-[10px] font-bold uppercase tracking-wide text-[var(--sl-text-muted)]">
				{title}
			</p>

			<div className="mt-2 flex items-start gap-3">
				{icon && (
					<div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-black/20">
						<Image
							src={getHeroSkillIconPath(icon)}
							alt={normalizedName || `${title} widget`}
							fill
							sizes="48px"
							className="object-cover"
						/>
					</div>
				)}

				<div className="min-w-0 flex-1">
					{normalizedName && (
						<h3 className="text-sm font-black text-[var(--sl-text)]">
							{normalizedName}
						</h3>
					)}

					{normalizedAbility && (
						<p className="mt-2 text-xs leading-5 text-[var(--sl-text-muted)]">
							{normalizedAbility}
						</p>
					)}
				</div>
			</div>

			{visibleStats.length > 0 && (
				<div className={`mt-3 grid gap-2 ${gridClassName}`}>
					{visibleStats.map((item) => (
						<div
							key={item.label}
							className="min-w-0 rounded-xl bg-[var(--sl-surface)] px-2 py-2"
						>
							<p className="truncate text-[8px] font-bold uppercase tracking-wide text-[var(--sl-text-muted)]">
								{item.label}
							</p>

							<p className="mt-1 break-words text-[11px] font-black text-[var(--sl-text)]">
								{formatStatValue(item.value)}
							</p>
						</div>
					))}
				</div>
			)}
		</article>
	);
}

type UniquePassiveSectionProps = {
	name: string;
	icon?: string;
	ability?: string;
	stats?: string;
};

function UniquePassiveSection({
	name,
	icon,
	ability,
	stats,
}: UniquePassiveSectionProps) {
	const normalizedAbility = getTextValue(ability);

	const normalizedStats = getTextValue(stats);

	return (
		<section className="rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
			<SectionTitle icon={<Sparkles size={17} />} title="Unique Passive" />

			<div className="mt-4 rounded-2xl bg-[var(--sl-active)] p-3">
				<div className="flex items-start gap-3">
					{icon && (
						<div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-black/20">
							<Image
								src={getHeroUniquePassiveIconPath(icon)}
								alt={name}
								fill
								sizes="48px"
								className="object-cover"
							/>
						</div>
					)}

					<div className="min-w-0 flex-1">
						<p className="text-sm font-black text-[var(--sl-text)]">{name}</p>

						{normalizedStats && (
							<p className="mt-1 text-[10px] font-bold text-[var(--sl-primary)]">
								{normalizedStats}
							</p>
						)}
					</div>
				</div>

				{normalizedAbility && (
					<p className="mt-3 text-xs leading-5 text-[var(--sl-text-muted)]">
						{normalizedAbility}
					</p>
				)}
			</div>
		</section>
	);
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
	return (
		<div className="flex items-center gap-2 text-[var(--sl-text)]">
			{icon}

			<h2 className="text-sm font-black">{title}</h2>
		</div>
	);
}

function normalizeSkillStats(stats: unknown): string[] {
	if (!Array.isArray(stats)) {
		return [];
	}

	return stats.map((stat) => String(stat ?? "").trim()).filter(Boolean);
}

function createSkillStatGroups(stats: string[]): SkillStatGroup[] {
	if (stats.length === 0) {
		return [];
	}

	const groups: SkillStatGroup[] = [];

	for (let startIndex = 0; startIndex < stats.length; startIndex += 5) {
		const groupNumber = Math.floor(startIndex / 5) + 1;

		const values = stats.slice(startIndex, startIndex + 5);

		groups.push({
			id: `effect-${groupNumber}-${values.join("-")}`,
			label: stats.length > 5 ? `Effect ${groupNumber}` : "Skill Level",
			values,
		});
	}

	return groups;
}

function getTextValue(value: unknown): string {
	if (value === undefined || value === null) {
		return "";
	}

	if (Array.isArray(value)) {
		return value
			.map((item) => String(item ?? "").trim())
			.filter(Boolean)
			.join(" ");
	}

	return String(value).trim();
}

function hasDisplayValue(value: StatValue): boolean {
	if (value === undefined || value === null) {
		return false;
	}

	return String(value).trim() !== "";
}

function formatStatValue(value: StatValue): string {
	if (!hasDisplayValue(value)) {
		return "-";
	}

	return String(value);
}

function isValidSkill(skill: unknown): skill is HeroSkill {
	return typeof skill === "object" && skill !== null && !Array.isArray(skill);
}
