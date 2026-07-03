import DesktopContainer from "@/components/layout/DekstopContainer";
import Header from "@/components/layout/Header/Header";

export default function HomeDesktop() {
	return (
		<DesktopContainer sidebar={<div>Sidebar</div>}>
			<Header />

			<div className="mt-10">{/* Search */}</div>

			<div className="mt-10 grid grid-cols-2 gap-8">
				<div>{/* Quick Access */}</div>

				<div>{/* Recent History */}</div>
			</div>

			<div className="mt-10">{/* What's In Your Bag */}</div>
		</DesktopContainer>
	);
}
