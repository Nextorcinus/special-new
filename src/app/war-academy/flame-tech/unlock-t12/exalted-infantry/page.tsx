import UnlockT12CalculatorPage from "@/modules/war-academy/flame-tech/unlock-t12/components/UnlockT12CalculatorPage";
import { UNLOCK_T12_DATA } from "@/modules/war-academy/flame-tech/unlock-t12/data";

export default function Page() {
	return (
		<UnlockT12CalculatorPage
			category="Exalted Infantry"
			data={UNLOCK_T12_DATA}
		/>
	);
}
