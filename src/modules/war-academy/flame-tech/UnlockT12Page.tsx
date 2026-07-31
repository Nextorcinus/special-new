import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import UnlockT12CalculatorPage from "@/modules/war-academy/flame-tech/unlock-t12/components/UnlockT12CalculatorPage";
import type {
	UnlockT12Category,
	UnlockT12Database,
} from "@/modules/war-academy/flame-tech/unlock-t12/type";

type UnlockT12PageProps = {
	title: string;
	category: UnlockT12Category;
	data: UnlockT12Database;
};

export default function UnlockT12Page({
	title,
	category,
	data,
}: UnlockT12PageProps) {
	return (
		<MobileContainer>
			<HeaderOther title={title} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] p-1">
				<UnlockT12CalculatorPage category={category} data={data} />
			</div>
		</MobileContainer>
	);
}
