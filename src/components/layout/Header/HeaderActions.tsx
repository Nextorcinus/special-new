import AuthButton from "@/components/auth/AuthButton";

import HeaderNotification from "./HeaderNotification";

export default function HeaderActions() {
	return (
		<div className="flex items-center gap-3">
			<AuthButton />
			<HeaderNotification />
			
		</div>
	);
}