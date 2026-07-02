import HomeDesktop from "./HomeDesktop";
import HomeMobile from "./HomeMobile";

export default function HomePage() {
	return (
		<>
			<div className="block lg:hidden">
				<HomeMobile />
			</div>

			<div className="hidden lg:block">
				<HomeDesktop />
			</div>
		</>
	);
}
