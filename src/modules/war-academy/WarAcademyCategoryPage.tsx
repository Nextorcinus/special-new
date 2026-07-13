import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import WarAcademyCategoryGrid from "./components/WarAcademyCategoryGrid";

export default function WarAcademyCategoryPage() {
	return (
		<MobileContainer>
			<HeaderOther title="War Academy" />

			<div className="mt-8">
				<WarAcademyCategoryGrid />
			</div>
		</MobileContainer>
	);
}
