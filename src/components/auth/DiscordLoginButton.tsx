"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

const DISCORD_AUTHORIZED_KEY =
	"special-lazyness-discord-authorized";

const DISCORD_SYNC_PENDING_KEY =
	"special-lazyness-discord-sync-pending";

export default function DiscordLoginButton() {
	const [loading, setLoading] = useState(false);

	async function handleLogin() {
		if (loading) {
			return;
		}

		setLoading(true);

		try {
			const authorized =
				localStorage.getItem(
					DISCORD_AUTHORIZED_KEY,
				) === "true";

			if (!authorized) {
				sessionStorage.setItem(
					DISCORD_SYNC_PENDING_KEY,
					"true",
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

			sessionStorage.setItem(
				DISCORD_SYNC_PENDING_KEY,
				"true",
			);

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

				sessionStorage.setItem(
					DISCORD_SYNC_PENDING_KEY,
					"true",
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

				return;
			}

			sessionStorage.removeItem(
				DISCORD_SYNC_PENDING_KEY,
			);

			setLoading(false);
		} catch {
			sessionStorage.removeItem(
				DISCORD_SYNC_PENDING_KEY,
			);

			setLoading(false);
		}
	}

	return (
		<button
			type="button"
			onClick={handleLogin}
			disabled={loading}
			aria-label="Login with Discord"
			aria-busy={loading}
			className="group inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#7289da]/40 bg-[#7289da] px-3 text-sm font-semibold whitespace-nowrap text-white transition-all duration-200 hover:border-[#7289da] hover:bg-[#424549] hover:text-white active:scale-[0.97] disabled:pointer-events-none disabled:opacity-70 sm:h-11 sm:gap-2.5 sm:px-4"
		>
			<span className="flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 group-hover:bg-[#7289da]/15">
				<img
					src="/icons/discord.png"
					alt=""
					width={18}
					height={18}
					className={`size-[18px] object-contain transition-transform duration-200 ${
						loading
							? "animate-pulse"
							: "group-hover:scale-105"
					}`}
				/>
			</span>

			<span className="hidden sm:inline">
				{loading
					? "Connecting..."
					: "Login"}
			</span>

			<span className="sm:hidden">
				{loading ? "..." : "Login"}
			</span>
		</button>
	);
}