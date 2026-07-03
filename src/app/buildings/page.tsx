import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import BuildingTypeCard from "@/modules/buildings/components/BuildingTypeCard";
import { BUILDING_CATEGORIES } from "@/modules/buildings/data/building-categories";

export default function Page() {
	return (
		<MobileContainer>
			<HeaderOther title="Buildings" />

			<section className="mt-8">
				<h1 className="text-center text-sm font-semibold text-white">
					Category
				</h1>

				<div className="mt-8 grid grid-cols-2 gap-5">
					{BUILDING_CATEGORIES.map((item) => (
						<BuildingTypeCard key={item.id} item={item} />
					))}
				</div>
			</section>
		</MobileContainer>
	);
}
