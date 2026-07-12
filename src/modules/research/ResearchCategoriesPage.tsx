import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import ResearchCategoryGrid from "./components/ResearchCategoryGrid";

export default function ResearchCategoriesPage() {
	return (
		<MobileContainer>
			<HeaderOther title="Research" />

			<div className="mt-8">
				<ResearchCategoryGrid />
			</div>
		</MobileContainer>
	);
}