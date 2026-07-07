import Image from "next/image";
import Link from "next/link";
import type { BuildingCategory } from "../types";

type BuildingTypeCardProps = {
	item: BuildingCategory;
};

export default function BuildingTypeCard({ item }: BuildingTypeCardProps) {
	return (
		<Link href={item.href} className="group text-center">
			<div className="flex aspect-square items-center justify-center rounded-3xl bg-[var(--card)] p-3 md:p-4 lg:p-5">
				<Image
					src={item.icon}
					alt={item.title}
					width={120}
					height={120}
					className="h-[70%] w-[70%] object-contain"
				/>
			</div>

			<span className="mt-4 block text-sm text-[var(--muted-foreground)]">
				{item.title}
			</span>
		</Link>
	);
}
