"use client";

import { useState } from "react";

import BuildingForm from "@/modules/buildings/components/BuildingForm";
import BuildingResult from "@/modules/buildings/components/BuildingResult";
import type { BuildingType } from "@/modules/buildings/calculator/calculateUpgrade";

type BuildingCalculatorPageProps = {
	type: BuildingType;
	data: any[];
};

export default function BuildingCalculatorPage({
	type,
	data,
}: BuildingCalculatorPageProps) {
	const [result, setResult] = useState<any>(null);

	return (
		<div className="space-y-6">
			<BuildingForm type={type} data={data} onCalculate={setResult} />

			{result && <BuildingResult result={result} />}
		</div>
	);
}