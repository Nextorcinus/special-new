import CharmPage from "@/modules/charm/CharmPage";
import charmData from "@/modules/charm/data/chief-charm.json";
import type { CharmDataItem } from "@/modules/charm/type";

export default function Page() {
	return (
		<CharmPage
			title="Chief Charm Calculator"
			data={charmData as CharmDataItem[]}
		/>
	);
}