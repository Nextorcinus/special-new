import warAcademyData from "@/modules/war-academy/data";
import WarAcademyPage from "@/modules/war-academy/WarAcademyPage";

export default function Page() {
	return (
		<WarAcademyPage title="Lancer" category="Lancer" data={warAcademyData} />
	);
}
