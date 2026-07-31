import { ArrowRight, Navigation, Shield, Swords, Target } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

type UnlockT12CategoryCardProps = {
	title: string;
	description: string;
	href: string;
	icon: string;
	fallbackIcon: React.ReactNode;
};

function UnlockT12CategoryCard({
	title,
	description,
	href,
	icon,
	fallbackIcon,
}: UnlockT12CategoryCardProps) {
	return (
		<Link
			href={href}
			className="group block rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4 transition hover:bg-[var(--sl-hover)]"
		>
			<div className="flex items-center gap-4">
				<div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--sl-active)]">
					{icon ? (
						<Image
							src={icon}
							alt={title}
							width={44}
							height={44}
							className="object-contain"
						/>
					) : (
						fallbackIcon
					)}
				</div>

				<div className="min-w-0 flex-1">
					<h2 className="text-sm font-bold text-[var(--sl-text)]">{title}</h2>

					<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
						{description}
					</p>
				</div>

				<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-active)] text-[var(--sl-text-muted)] transition group-hover:text-[var(--sl-text)]">
					<ArrowRight size={17} />
				</div>
			</div>
		</Link>
	);
}

export default function UnlockT12CategoryPage() {
	return (
		<MobileContainer>
			<HeaderOther title="Unlock T12" />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] p-1">
				<div className="rounded-[20px] bg-[var(--sl-surface)] p-5">
					<h1 className="text-base font-bold text-[var(--sl-text)]">
						Unlock T12 Calculator
					</h1>

					<p className="mt-2 text-xs leading-5 text-[var(--sl-text-muted)]">
						Select a troop type to calculate the Steel, Refined Fire Crystal,
						Fire Crystal Shards, power, and attributes required to unlock T12.
					</p>
				</div>
			</div>

			<div className="mt-5 space-y-3">
				<UnlockT12CategoryCard
					title="Infantry"
					description="Calculate all requirements needed to unlock T12 Infantry."
					href="/war-academy/flame-tech/unlock-t12/exalted-infantry"
					icon="/icons/infantry.png"
					fallbackIcon={
						<Shield size={24} className="text-[var(--sl-primary)]" />
					}
				/>

				<UnlockT12CategoryCard
					title="Lancer"
					description="Calculate all requirements needed to unlock T12 Lancer."
					href="/war-academy/flame-tech/unlock-t12/exalted-lancer"
					icon="/icons/lancer.png"
					fallbackIcon={
						<Navigation size={24} className="text-[var(--sl-primary)]" />
					}
				/>

				<UnlockT12CategoryCard
					title="Marksman"
					description="Calculate all requirements needed to unlock T12 Marksman."
					href="/war-academy/flame-tech/unlock-t12/exalted-marksman"
					icon="/icons/marksman.png"
					fallbackIcon={
						<Swords size={24} className="text-[var(--sl-primary)]" />
					}
				/>
			</div>
		</MobileContainer>
	);
}
