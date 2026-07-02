import Image from "next/image";
import Link from "next/link";

type CategoryItem = {
	id: string;
	title: string;
	icon: string;
	href: string;
};

export default function CategoryCard({ item }: { item: CategoryItem }) {
	return (
		<Link href={item.href} className="text-center">
			<div className="flex aspect-square items-center justify-center rounded-3xl bg-[var(--card)]">
				<Image src={item.icon} alt={item.title} width={88} height={88} />
			</div>

			<span className="mt-4 block text-sm text-[var(--foreground)]">
				{item.title}
			</span>
		</Link>
	);
}
