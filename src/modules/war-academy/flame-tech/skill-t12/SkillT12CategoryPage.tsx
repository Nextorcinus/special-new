"use client";

import {
	ArrowRight,
	Shield,
	Sparkles,
	Swords,
	Target,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";

import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

type SkillT12CategoryCardProps = {
	title: string;
	description: string;
	href: string;
	icon: string;
	fallbackIcon: ReactNode;
};

function SkillT12CategoryCard({
	title,
	description,
	href,
	icon,
	fallbackIcon,
}: SkillT12CategoryCardProps) {
	const [imageError, setImageError] = useState(false);

	return (
		<Link href={href} className="group block">
			<div
				className={[
					"relative overflow-hidden rounded-2xl",
					"border border-[var(--sl-border)]",
					"bg-[var(--sl-surface)] p-4",
					"transition-all duration-200",
					"group-hover:-translate-y-0.5",
					"group-hover:bg-[var(--sl-hover)]",
				].join(" ")}
			>
				<div className="flex items-start gap-4">
					<div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--sl-active)] text-[var(--sl-primary)]">
						{imageError ? (
							fallbackIcon
						) : (
							<Image
								src={icon}
								alt={title}
								width={42}
								height={42}
								className="size-[42px] object-contain"
								onError={() => setImageError(true)}
							/>
						)}
					</div>

					<div className="min-w-0 flex-1">
						<h2 className="text-sm font-bold text-[var(--sl-text)]">
							{title}
						</h2>

						<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
							{description}
						</p>
					</div>

					<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-active)] text-[var(--sl-text-muted)] transition-colors group-hover:text-[var(--sl-text)]">
						<ArrowRight size={17} />
					</div>
				</div>
			</div>
		</Link>
	);
}

export default function SkillT12CategoryPage() {
	return (
		<MobileContainer>
			<HeaderOther title="T12 Skills" />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] p-1">
				<div className="rounded-[20px] bg-[var(--sl-surface)] p-4">
					<div className="flex items-start gap-3">
						<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-active)] text-[var(--sl-primary)]">
							<Sparkles size={22} />
						</div>

						<div className="min-w-0">
							<h1 className="text-base font-bold text-[var(--sl-text)]">
								T12 Skills Calculator
							</h1>

							<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
								Calculate resources, research time, power, and stat
								increases required for T12 skill upgrades.
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-5 space-y-3">
				<SkillT12CategoryCard
					title="Exalted Infantry"
					description="Calculate all Infantry T12 skill upgrades."
					href="/war-academy/flame-tech/skill-t12/exalted-infantry"
					icon="/icons/infantry.png"
					fallbackIcon={<Shield size={21} />}
				/>

				<SkillT12CategoryCard
					title="Exalted Lancer"
					description="Calculate all Lancer T12 skill upgrades."
					href="/war-academy/flame-tech/skill-t12/exalted-lancer"
					icon="/icons/lancer.png"
					fallbackIcon={<Swords size={21} />}
				/>

				<SkillT12CategoryCard
					title="Exalted Marksman"
					description="Calculate all Marksman T12 skill upgrades."
					href="/war-academy/flame-tech/skill-t12/exalted-marksman"
					icon="/icons/marksman.png"
					fallbackIcon={<Target size={21} />}
				/>
			</div>
		</MobileContainer>
	);
}