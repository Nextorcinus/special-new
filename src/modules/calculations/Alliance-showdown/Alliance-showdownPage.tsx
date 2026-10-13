
import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import { AllianceShowdownCalculator } from "./";

export default function AllianceShowdownPage() {
	return (
		<MobileContainer>
			<HeaderOther title="Alliance Showdown" />

			<div className="mt-8 rounded-3xl px-1 py-1">
				<AllianceShowdownCalculator />
			</div>
		</MobileContainer>
	);
}
