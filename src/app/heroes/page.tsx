import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import { getHeroes } from "@/modules/heroes";
import HeroesPage from "@/modules/heroes/components/HeroesPage";

export default function Page() {
	const heroes = getHeroes();

	return (
		<MobileContainer>
			<HeaderOther title="Heroes" />

			<div className="py-6">
				<HeroesPage heroes={heroes} />
			</div>
		</MobileContainer>
	);
}
