import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { NAVIGATION } from "@/config/navigation";

export default function QuickAccessSection() {
	const quickAccessItems = NAVIGATION.slice(0, 5);

	return (
		<section className="rounded-[28px] bg-[var(--card)] p-5">
			<div className="mb-5 flex items-center justify-between">
				<h2 className="text-lg font-medium text-[var(--foreground)]">
					Quick access
				</h2>

				<Link
					href="/categories"
					className="flex items-center gap-1 text-xs font-semibold text-[#FFC632]"
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
						<div className="flex h-[64px] w-[72px] items-center justify-center rounded-2xl bg-[#292929]">
							<Image
								src={item.icon}
								alt={item.title}
								width={44}
								height={44}
								className="object-contain"
							/>
						</div>

						<span className="mt-3 block text-xs text-[var(--muted)]">
							{item.title}
						</span>
					</Link>
				))}
			</div>
		</section>
	);
}
