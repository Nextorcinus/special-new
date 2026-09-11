import { auth } from "@/auth";

import DiscordLoginButton from "./DiscordLoginButton";
import UserAccount from "./UserAccount";

export default async function AuthButton() {
	const session = await auth();

	if (!session?.user) {
		return <DiscordLoginButton />;
	}

	return (
		<UserAccount
			user={{
				id: session.user.id ?? "",
				name: session.user.name,
				image: session.user.image,
			}}
		/>
	);
}
