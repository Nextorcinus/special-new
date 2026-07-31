import UnlockT12Page from "@/modules/war-academy/flame-tech/UnlockT12Page";
import { UNLOCK_T12_DATA } from "@/modules/war-academy/flame-tech/unlock-t12/data";

export default function Page() {
	return (
		<UnlockT12Page
			title="Exalted Infantry"
			category="Exalted Infantry"
			data={UNLOCK_T12_DATA}
		/>
	);
}
