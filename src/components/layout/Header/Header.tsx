import HeaderActions from "./HeaderActions";
import HeaderAvatar from "./HeaderAvatar";
import HeaderInfo from "./HeaderInfo";

export default function Header() {
	return (
		<header className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				<HeaderAvatar />
				<HeaderInfo />
			</div>

			<HeaderActions />
		</header>
	);
}
