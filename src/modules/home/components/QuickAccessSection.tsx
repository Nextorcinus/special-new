import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NAVIGATION } from "@/config/navigation";

export default function QuickAccessSection() {
	const quickAccessItems = NAVIGATION.slice(0, 5);

	return (
		<section className="rounded-2xl  bg-[var(--sl-surface)] border border-[var(--sl-border)] px-4 py-3 text-left transition-colors hover:bg-[var(--sl-surface-hover)]">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-[14px] sm:text-[1rem] text-[var(--sl-primary)]">
					Quick access
				</h2>

				<Link
					href="/categories"
					className="flex items-center gap-1 text-xs font-semibold text-[var(--sl-text-muted)] transition-colors hover:text-[var(--sl-primary-hover)]"
				>
					See All
					<ChevronRight size={15} />
				</Link>
			</div>

			<div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{quickAccessItems.map((item) => (
					<Link
						key={item.id}
						href={item.href}
						className="w-[72px] shrink-0 text-center"
					>
						<div className="flex h-[64px] w-[72px] items-center justify-center rounded-2xl bg-black/20 border border-solid border-[color:var(--sl-border)]">
							<Image
								src={item.icon}
								alt={item.title}
								width={44}
								height={44}
								className="object-contain"
							/>
						</div>

						<span className="mt-3 block text-xs text-[var(--sl-text-secondary)]">
							{item.title}
						</span>
					</Link>
				))}
			</div>
		</section>
	);
}
