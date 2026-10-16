import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import { SvsCalculator } from "./";

export default function SvSPage() {
	return (
		<MobileContainer>
			<HeaderOther title="SvS" />

			<div className="mt-8 rounded-3xl px-1 py-1">
				<SvsCalculator />
			</div>
		</MobileContainer>
	);
}
