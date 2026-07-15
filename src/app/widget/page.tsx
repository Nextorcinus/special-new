import widgetData from "@/modules/widgets/data/widget.json";
import WidgetPage from "@/modules/widgets/WidgetPage";

export default function WidgetsPage() {
	return <WidgetPage title="Hero Widget" data={widgetData} />;
}
