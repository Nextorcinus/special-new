import researchData from "@/modules/research/data/Research.json";
import ResearchPage from "@/modules/research/ResearchPage";
import type { ResearchDatabase } from "@/modules/research/type";

export default function Page() {
	return (
		<ResearchPage
			title="Economy Research"
			category="Economy"
			data={researchData as ResearchDatabase}
		/>
	);
}