import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import WarAcademyCalculatorPage from "./components/WarAcademyCalculatorPage";
import type { WarAcademyCategory, WarAcademyDatabase } from "./type";

type WarAcademyPageProps = {
	title: string;
	category: WarAcademyCategory;
	data: WarAcademyDatabase;
};

export default function WarAcademyPage({
	title,
	category,
	data,
}: WarAcademyPageProps) {
	return (
		<MobileContainer>
			<HeaderOther title={title} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] px-1 py-1">
				<WarAcademyCalculatorPage category={category} data={data} />
			</div>
		</MobileContainer>
	);
}
