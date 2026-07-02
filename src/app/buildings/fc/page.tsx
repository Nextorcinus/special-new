import BuildingCalculatorPage from "@/modules/buildings/calculator/BuildingCalculatorPage";
import fcBuilding from "@/modules/buildings/data/fc-building.json";

export default function Page() {
	return <BuildingCalculatorPage type="fc" data={fcBuilding} />;
}