import HeaderNotification from "./HeaderNotification";
import HeaderThemeToggle from "./HeaderThemeToggle";

export default function HeaderActions() {
	return (
		<div className="flex items-center gap-3">
			<HeaderThemeToggle />
			<HeaderNotification />
		</div>
	);
}
