import BuildingPage from "@/modules/buildings/BuildingPage";
import fcBuilding from "@/modules/buildings/data/fc-building.json";

export default function Page() {
	return <BuildingPage title="FC Buildings" type="fc" data={fcBuilding} />;
}
