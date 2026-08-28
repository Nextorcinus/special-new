import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import RfcCalculatorPage from "@/modules/rfc/components/rfcCalculatorPage";

type RfcPageProps = {
	title: string;
};

export default function RfcPage({ title }: RfcPageProps) {
	return (
		<MobileContainer>
			<HeaderOther title={title} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] px-1 py-1">
				<RfcCalculatorPage />
			</div>
		</MobileContainer>
	);
}
