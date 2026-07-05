import Header from "@/components/layout/Header/Header";
import MobileContainer from "@/components/layout/MobileContainer";
import WhatsInBagSection from "./components/BagSection";
import QuickAccessSection from "./components/QuickAccessSection";
import SearchSection from "./components/SearchSection";
import RecentHistorySection from "@/modules/home/components/RecentHistorySection";

export default function HomeMobile() {
	return (
		<MobileContainer>
			<Header />

			<div className="mt-8">
				<SearchSection />
			</div>

			<div className="mt-5">
				<WhatsInBagSection />
			</div>

			<div className="mt-8">
				<QuickAccessSection />
			</div>

			<div className="mt-8">
				<RecentHistorySection />
			</div>
		</MobileContainer>
	);
}
