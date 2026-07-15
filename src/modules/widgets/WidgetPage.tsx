import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";
import type { RawWidgetItem } from "./calculator";
import WidgetCalculatorPage from "./WidgetCalculatorPage";

type WidgetPageProps = {
	title: string;
	data: RawWidgetItem[];
};

export default function WidgetPage({ title, data }: WidgetPageProps) {
	return (
		<MobileContainer>
			<HeaderOther title={title} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] px-1 py-1">
				<WidgetCalculatorPage data={data} />
			</div>
		</MobileContainer>
	);
}
