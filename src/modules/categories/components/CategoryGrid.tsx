import { NAVIGATION } from "@/config/navigation";
import CategoryCard from "./CategoryCard";

export default function CategoryGrid() {
	return (
		<div className="grid grid-cols-2 gap-5">
			{NAVIGATION.map((item) => (
				<CategoryCard key={item.id} item={item} />
			))}
		</div>
	);
}
