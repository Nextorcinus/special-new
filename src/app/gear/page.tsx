import GearPage from "@/modules/gear/GearPage";
import chiefGearJson from "@/modules/gear/data/chief-gear.json";
import type {
	ChiefGearData,
	GearDataItem,
} from "@/modules/gear/type";

export default function Page() {
	const chiefGearData = chiefGearJson as ChiefGearData;

	return (
		<GearPage
			title="Chief Gear"
			data={chiefGearData.data as GearDataItem[]}
		/>
	);
}