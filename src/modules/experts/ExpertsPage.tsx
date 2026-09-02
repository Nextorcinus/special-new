import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import { ExpertsCalculator } from "./components/ExpertsCalculator";

type ExpertsPageProps = {
	title: string;
};

export default function ExpertsPage({ title }: ExpertsPageProps) {
	return (
		<MobileContainer>
			<HeaderOther title={title} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] px-1 py-1">
				<ExpertsCalculator />
			</div>
		</MobileContainer>
	);
}
