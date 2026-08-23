import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import GearCalculatorPage from "./components/GearCalculatorPage";
import type { GearData } from "./type";

type GearPageProps = {
	title: string;
	data: GearData;
};

export default function GearPage({
	title,
	data,
}: GearPageProps) {
	return (
		<MobileContainer>
			<HeaderOther title={title} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] px-1 py-1">
				<GearCalculatorPage data={data} />
			</div>
		</MobileContainer>
	);
}