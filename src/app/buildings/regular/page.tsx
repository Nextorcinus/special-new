import BuildingCalculatorPage from "@/modules/buildings/calculator/BuildingCalculatorPage";
import regularBuilding from "@/modules/buildings/data/regular-building.json";

export default function Page() {
	return <BuildingCalculatorPage type="regular" data={regularBuilding} />;
}