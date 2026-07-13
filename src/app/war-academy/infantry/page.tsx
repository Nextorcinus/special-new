import warAcademyData from "@/modules/war-academy/data";
import WarAcademyPage from "@/modules/war-academy/WarAcademyPage";

export default function Page() {
	return (
		<WarAcademyPage
			title="Infantry"
			category="Infantry"
			data={warAcademyData}
		/>
	);
}
