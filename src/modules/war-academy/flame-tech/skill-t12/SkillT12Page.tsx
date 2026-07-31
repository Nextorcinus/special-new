import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import SkillT12CalculatorPage from "@/modules/war-academy/flame-tech/skill-t12/components/SkillT12CalculatorPage";
import type {
	SkillT12Category,
	SkillT12Database,
} from "@/modules/war-academy/flame-tech/skill-t12/type";

type SkillT12PageProps = {
	title: string;
	category: SkillT12Category;
	data: SkillT12Database;
};

export default function SkillT12Page({
	title,
	category,
	data,
}: SkillT12PageProps) {
	return (
		<MobileContainer>
			<HeaderOther title={title} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] p-1">
				<SkillT12CalculatorPage category={category} data={data} />
			</div>
		</MobileContainer>
	);
}