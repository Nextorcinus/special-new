import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import BuildingCalculatorPage from "./calculator/BuildingCalculatorPage";
import type { BuildingType } from "./calculator/calculateUpgrade";

type BuildingPageProps = {
	title: string;
	type: BuildingType;
	data: any[];
};

export default function BuildingPage({ title, type, data }: BuildingPageProps) {
	return (
		<MobileContainer>
			<HeaderOther title={title} />

			<div className="mt-8">
				<BuildingCalculatorPage type={type} data={data} />
			</div>
		</MobileContainer>
	);
}
