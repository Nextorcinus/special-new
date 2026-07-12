import CategoryCard from "@/modules/categories/components/CategoryCard";

const RESEARCH_CATEGORIES = [
	{
		id: "growth",
		title: "Growth",
		icon: "/icons/growth.png",
		href: "/research/growth",
	},
	{
		id: "economy",
		title: "Economy",
		icon: "/icons/economy.png",
		href: "/research/economy",
	},
	{
		id: "battle",
		title: "Battle",
		icon: "/icons/battle.png",
		href: "/research/battle",
	},
];

export default function ResearchCategoryGrid() {
	return (
		<div className="grid grid-cols-2 gap-5">
			{RESEARCH_CATEGORIES.map((item) => (
				<CategoryCard key={item.id} item={item} />
			))}
		</div>
	);
}