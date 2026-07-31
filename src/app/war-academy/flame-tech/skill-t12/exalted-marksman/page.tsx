import skillT12Data from "@/modules/war-academy/flame-tech/skill-t12/data";
import SkillT12Page from "@/modules/war-academy/flame-tech/skill-t12/SkillT12Page";

export default function Page() {
	return (
		<SkillT12Page
			title="Exalted Marksman"
			category="Exalted Marksman"
			data={skillT12Data}
		/>
	);
}