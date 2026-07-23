import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import { getHeroes } from "@/modules/heroes";
import type { BearGenerationGuideItem } from "@/modules/heroes/bear/components/BearGenerationGuide";
import BearGenerationGuide from "@/modules/heroes/bear/components/BearGenerationGuide";
import BearRecommendation from "@/modules/heroes/bear/components/BearRecommendation";
import BearTierList, {
	type BearTierGroup,
} from "@/modules/heroes/bear/components/BearTierList";
import generationGuideData from "@/modules/heroes/bear/data/bear-generation-guide.json";

const BEAR_TIERS: BearTierGroup[] = [
	{
		id: "tier-ss",
		label: "SS",
		description: "Best heroes for joining another player's Bear Hunt rally.",
		heroIds: ["jessie", "jasser", "seoyoon"],
	},
	{
		id: "tier-a",
		label: "A",
		description: "Strong alternatives for joining Bear Hunt rallies.",
		heroIds: ["reina", "hendrik"],
	},
	{
		id: "tier-b",
		label: "B",
		description:
			"Situational joining heroes depending on skill and widget level.",
		heroIds: [
			"philly",
			"greg",
			"mia",
			"lynn",
			"norah",
			"gwen",
			"gregory",
			"flora",
		],
	},
];

export default function BearPage() {
	const heroes = getHeroes();

	const generationGuide = generationGuideData as BearGenerationGuideItem[];

	return (
		<MobileContainer>
			<HeaderOther title="Bear Hunt" />

			<main className="space-y-6 px-1 py-6">
				<section>
					<h1 className="text-xl font-black text-[var(--sl-text)]">
						Bear Hunt Hero Guide
					</h1>

					<p className="mt-2 text-xs leading-5 text-[var(--sl-text-muted)]">
						Choose the correct heroes and troop formation based on the newest
						generation available in your state.
					</p>
				</section>

				<BearRecommendation />

				<BearTierList heroes={heroes} tiers={BEAR_TIERS} />

				<BearGenerationGuide heroes={heroes} items={generationGuide} />
			</main>
		</MobileContainer>
	);
}
