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
						className="w-[64px] shrink-0 text-center sm:w-[72px] md:w-[80px]"
					>
						<div className="flex h-14 w-16 items-center justify-center rounded-xl border border-solid border-[color:var(--sl-border)] bg-black/20 sm:h-16 sm:w-[72px] sm:rounded-2xl md:h-[72px] md:w-20">
							<Image
								src={item.icon}
								alt={item.title}
								width={44}
								height={44}
								className="size-9 object-contain sm:size-11 md:size-12"
							/>
						</div>

						<span className="mt-2 block truncate text-[12px] leading-tight text-[var(--sl-text-secondary)] sm:mt-3 sm:text-xs md:text-[13px]">
							{item.title}
						</span>
					</Link>
				))}
			</div>
		</section>
	);
}
