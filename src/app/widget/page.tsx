import widgetData from "@/modules/widgets/data/widget.json";
import WidgetCalculatorPage from "@/modules/widgets/WidgetCalculatorPage";

export default function WidgetsPage() {
	return <WidgetCalculatorPage data={widgetData} />;
}
