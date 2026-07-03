import BuildingPage from "@/modules/buildings/BuildingPage";
import RegularBuilding from "@/modules/buildings/data/regular-building.json";

export default function Page() {
	return (
		<BuildingPage
			title="Regular Buildings"
			type="regular"
			data={RegularBuilding}
		/>
	);
}
