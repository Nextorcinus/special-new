import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import ResearchCalculatorPage from "./components/ResearchCalculatorPage";
import type {
	ResearchCategory,
	ResearchDatabase,
} from "./type";

type ResearchPageProps = {
	title: string;
	category: ResearchCategory;
	data: ResearchDatabase;
};

export default function ResearchPage({
	title,
	category,
	data,
}: ResearchPageProps) {
	return (
		<MobileContainer>
			<HeaderOther title={title} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] px-1 py-1">
				<ResearchCalculatorPage
					data={data}
					category={category}
				/>
			</div>
		</MobileContainer>
	);
}