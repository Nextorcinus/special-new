import { ArrowRight, Flame, LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";

import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

type FlameTechCategoryCardProps = {
	title: string;
	description: string;
	href?: string;
	icon: React.ReactNode;
	badge?: string;
	disabled?: boolean;
};

function FlameTechCategoryCard({
	title,
	description,
	href,
	icon,
	badge,
	disabled = false,
}: FlameTechCategoryCardProps) {
	const content = (
		<div
			className={[
				"group relative overflow-hidden rounded-2xl",
				"border border-[var(--sl-border)]",
				"bg-[var(--sl-surface)] p-4",
				"transition-all duration-200",
				disabled
					? "cursor-not-allowed opacity-60"
					: "hover:-translate-y-0.5 hover:bg-[var(--sl-hover)]",
			].join(" ")}
		>
			<div className="flex items-start gap-4">
				<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-active)] text-[var(--sl-primary)]">
					{icon}
				</div>

				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-2">
						<h2 className="text-sm font-bold text-[var(--sl-text)]">{title}</h2>

						{badge && (
							<span className="rounded-full bg-[var(--sl-active)] px-2 py-0.5 text-[10px] font-bold text-[var(--sl-text-muted)]">
								{badge}
							</span>
						)}
					</div>

					<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
						{description}
					</p>
				</div>

				<div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-active)] text-[var(--sl-text-muted)] transition-colors group-hover:text-[var(--sl-text)]">
					{disabled ? <LockKeyhole size={16} /> : <ArrowRight size={17} />}
				</div>
			</div>
		</div>
	);

	if (disabled || !href) {
		return content;
	}

	return (
		<Link href={href} className="block">
			{content}
		</Link>
	);
}

export default function FlameTechCategoryPage() {
	return (
		<MobileContainer>
			<HeaderOther title="Flame Tech" />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] p-1">
				<div className="rounded-[20px] bg-[var(--sl-surface)] p-4">
					<div className="flex items-start gap-3">
						<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-active)] text-orange-500">
							<Flame size={22} />
						</div>

						<div>
							<h1 className="text-base font-bold text-[var(--sl-text)]">
								Flame Tech Calculator
							</h1>

							<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
								Calculate Steel, Refined Fire Crystal, Fire Crystal Shards,
								attributes, and power required for Flame Tech.
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-5 space-y-3">
				<FlameTechCategoryCard
					title="Unlock T12"
					description="Calculate resources, attributes, and power needed to unlock T12 troops."
					href="/war-academy/flame-tech/unlock-t12"
					icon={<LockKeyhole size={21} />}
					badge="T12"
				/>

				<FlameTechCategoryCard
					title="T12 Skills"
					description="Calculate upgrades for Infantry, Lancer, and Marksman T12 skills."
					icon={<Sparkles size={21} />}
					badge="Coming Soon"
					disabled
				/>
			</div>
		</MobileContainer>
	);
}
