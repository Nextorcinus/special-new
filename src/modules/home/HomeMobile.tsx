import Header from "@/components/layout/Header";
import WhatsInBagSection from "./components/BagSection";
import QuickAccessSection from "./components/QuickAccessSection";
import SearchSection from "./components/SearchSection";

export default function HomeMobile() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
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
		</main>
	);
}
