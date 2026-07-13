import warAcademyData from "@/modules/war-academy/data";
import WarAcademyPage from "@/modules/war-academy/WarAcademyPage";

export default function Page() {
	return (
		<WarAcademyPage title="Lancer Helios" category="Lancer" data={warAcademyData} />
	);
}
