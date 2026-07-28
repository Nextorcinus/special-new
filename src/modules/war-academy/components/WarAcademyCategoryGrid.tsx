import CategoryCard from "@/modules/categories/components/CategoryCard";

const WAR_ACADEMY_CATEGORIES = [
	{
		id: "infantry",
		title: "Infantry",
		icon: "/icons/infantry.png",
		href: "/war-academy/infantry",
	},
	{
		id: "lancer",
		title: "Lancer",
		icon: "/icons/lancer.png",
		href: "/war-academy/lancer",
	},
	{
		id: "marksman",
		title: "Marksman",
		icon: "/icons/marksman.png",
		href: "/war-academy/marksman",
	},
	{
		id: "flame-tech",
		title: "Flame Tech",
		icon: "/icons/flame-tech.png",
		href: "/war-academy/flame-tech",
	},
];

export default function WarAcademyCategoryGrid() {
	return (
		<div className="grid grid-cols-2 gap-5">
			{WAR_ACADEMY_CATEGORIES.map((item) => (
				<CategoryCard key={item.id} item={item} />
			))}
		</div>
	);
}
