"use client";

import { signIn } from "next-auth/react";

const DISCORD_AUTHORIZED_KEY =
	"special-lazyness-discord-authorized";

export default function DiscordLoginButton() {
	async function handleLogin() {
		const authorized =
			localStorage.getItem(
				DISCORD_AUTHORIZED_KEY,
			) === "true";

		if (!authorized) {
			await signIn(
				"discord",
				{
					redirectTo:
						window.location.href,
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
				redirectTo:
					window.location.href,
			},
			{
				prompt: "none",
			},
		);

		if (
			result &&
			"error" in result &&
			result.error
		) {
			localStorage.removeItem(
				DISCORD_AUTHORIZED_KEY,
			);

			await signIn(
				"discord",
				{
					redirectTo:
						window.location.href,
				},
				{
					prompt: "consent",
				},
			);

			return;
		}

		if (
			result &&
			"url" in result &&
			result.url
		) {
			window.location.href =
				result.url;
		}
	}

	return (
		<button
			type="button"
			onClick={handleLogin}
			aria-label="Login with Discord"
			className="group inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#7289da]/40 bg-[#7289da] px-3 text-sm font-semibold text-white whitespace-nowrap transition-all duration-200 hover:border-[#7289da] hover:bg-[#424549] hover:text-white active:scale-[0.97] sm:h-11 sm:gap-2.5 sm:px-4"
		>
			<span className="flex size-7 shrink-0 items-center justify-center rounded-lg  transition-colors duration-200 group-hover:bg-[#7289da]/15">
				<img
					src="/icons/discord.png"
					alt=""
					width={18}
					height={18}
					className="size-[18px] object-contain transition-transform duration-200 group-hover:scale-105"
				/>
			</span>

			<span className="hidden sm:inline">
				Login with Discord
			</span>

			<span className="sm:hidden">
				Login
			</span>
		</button>
	);
}