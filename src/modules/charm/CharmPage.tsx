import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import CharmCalculatorPage from "./components/CharmCalculatorPage";
import type { CharmDataItem } from "./type";

type CharmPageProps = {
	title: string;
	data: CharmDataItem[];
};

export default function CharmPage({
	title,
	data,
}: CharmPageProps) {
	return (
		<MobileContainer>
			<HeaderOther title={title} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] px-1 py-1">
				<CharmCalculatorPage data={data} />
			</div>
		</MobileContainer>
	);
}