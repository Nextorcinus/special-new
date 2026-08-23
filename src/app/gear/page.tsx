import GearPage from "@/modules/gear/GearPage";
import chiefGearJson from "@/modules/gear/data/chief-gear.json";
import type { GearData } from "@/modules/gear/type";

export default function Page() {
	const chiefGearData = chiefGearJson as GearData;

	return (
		<GearPage
			title="Chief Gear"
			data={chiefGearData}
		/>
	);
}