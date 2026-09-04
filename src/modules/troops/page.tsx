import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import TroopAssistantCalculator from "./components/TroopAssistantCalculator";

export default function TroopsPage() {
	return (
		<MobileContainer>
			<HeaderOther title="Troops Assistant" />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] px-1 py-1">
				<TroopAssistantCalculator />
			</div>
		</MobileContainer>
	);
}
