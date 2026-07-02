import Image from "next/image";
import Link from "next/link";
import type { BuildingCategory } from "../types";

type BuildingTypeCardProps = {
	item: BuildingCategory;
};

export default function BuildingTypeCard({ item }: BuildingTypeCardProps) {
	return (
		<Link href={item.href} className="text-center">
			<div className="flex aspect-square items-center justify-center rounded-3xl bg-[var(--card)]">
				<Image
					src={item.icon}
					alt={item.title}
					width={105}
					height={105}
					className="object-contain"
				/>
			</div>

			<span className="mt-4 block text-sm text-[var(--foreground)]">
				{item.title}
			</span>
		</Link>
	);
}