import CategoryCard from "@/modules/categories/components/CategoryCard";

const CALCULATION_CATEGORIES = [
  {
    id: "alliance-showdown",
    title: "Alliance Showdown",
    icon: "/icons/alliance-showdown.png",
    href: "/calculations/alliance-showdown",
  },
  {
    id: "svs",
    title: "SvS",
    icon: "/icons/svs.png",
    href: "/calculations/svs",
  },
];

export default function CalculationCategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-5">
      {CALCULATION_CATEGORIES.map((item) => (
        <CategoryCard key={item.id} item={item} />
      ))}
    </div>
  );
}