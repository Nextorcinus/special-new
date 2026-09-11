"use client";

import { Gamepad2 } from "lucide-react";
import { signIn } from "next-auth/react";

const DISCORD_AUTHORIZED_KEY = "special-lazyness-discord-authorized";

export default function DiscordLoginButton() {
	async function handleLogin() {
		const authorized = localStorage.getItem(DISCORD_AUTHORIZED_KEY) === "true";

		if (!authorized) {
			await signIn(
				"discord",
				{
					redirectTo: window.location.href,
				},
				{
					prompt: "consent",
				},
			);

			return;
		}

		const result = await signIn(
			"discord",
			{
				redirect: false,
				redirectTo: window.location.href,
			},
			{
				prompt: "none",
			},
		);

		if (result && "error" in result && result.error) {
			localStorage.removeItem(DISCORD_AUTHORIZED_KEY);

			await signIn(
				"discord",
				{
					redirectTo: window.location.href,
				},
				{
					prompt: "consent",
				},
			);

			return;
		}

		if (result && "url" in result && result.url) {
			window.location.href = result.url;
		}
	}

	return (
		<button
			type="button"
			onClick={handleLogin}
			className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--button)] px-4 text-sm font-semibold text-[var(--sl-text)] transition-all duration-200 hover:bg-[var(--sl-surface-hover)] active:scale-[0.98]"
		>
			<Gamepad2 className="size-4" />
			<span>Login with Discord</span>
		</button>
	);
}
