import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

import { prisma } from "@/lib/prisma";

type DiscordProfile = {
	id?: string | number;
	username?: string;
	global_name?: string | null;
	avatar?: string | null;
	email?: string | null;
	image?: string | null;
};

function getDiscordProfile(profile: unknown): DiscordProfile {
	if (!profile || typeof profile !== "object") {
		return {};
	}

	const data = profile as Record<string, unknown>;

	return {
		id:
			typeof data.id === "string" ||
			typeof data.id === "number"
				? data.id
				: undefined,

		username:
			typeof data.username === "string"
				? data.username
				: undefined,

		global_name:
			typeof data.global_name === "string"
				? data.global_name
				: null,

		avatar:
			typeof data.avatar === "string"
				? data.avatar
				: null,

		email:
			typeof data.email === "string"
				? data.email
				: null,

		image:
			typeof data.image === "string"
				? data.image
				: null,
	};
}

function getDiscordAvatarUrl(
	discordId: string,
	avatar: string | null | undefined,
) {
	if (avatar) {
		const extension = avatar.startsWith("a_")
			? "gif"
			: "png";

		return `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.${extension}`;
	}

	const defaultAvatar = Number(
		(BigInt(discordId) /
			(BigInt(2) ** BigInt(22))) %
			BigInt(6),
	);

	return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
}

export const {
	auth,
	handlers,
	signIn,
	signOut,
} = NextAuth({
	trustHost: true,

	providers: [
		Discord({
			clientId: process.env.AUTH_DISCORD_ID,
			clientSecret:
				process.env.AUTH_DISCORD_SECRET,

			authorization: {
				url: "https://discord.com/oauth2/authorize",

				params: {
					scope: "identify",
				},
			},

			profile(profile) {
				const discordProfile =
					getDiscordProfile(profile);

				if (!discordProfile.id) {
					console.error(
						"[Auth] Discord profile ID is missing.",
					);

					throw new Error(
						"Discord profile ID is missing.",
					);
				}

				const discordId = String(
					discordProfile.id,
				);

				const username =
					discordProfile.global_name ??
					discordProfile.username ??
					"Discord User";

				const image =
					getDiscordAvatarUrl(
						discordId,
						discordProfile.avatar,
					);

				console.log(
					"[Auth] Discord profile received:",
					{
						discordId,
						username,
					},
				);

				return {
					id: discordId,
					name: username,
					email:
						discordProfile.email ??
						null,
					image,
				};
			},
		}),
	],

	session: {
		strategy: "jwt",
	},

	callbacks: {
		async signIn({ user, account }) {
			try {
				if (account?.provider !== "discord") {
					console.error(
						"[Auth] Invalid authentication provider.",
					);

					throw new Error(
						"Invalid authentication provider.",
					);
				}

				/*
				 * IMPORTANT:
				 *
				 * account.providerAccountId is the real
				 * Discord account ID.
				 *
				 * Do NOT use user.id here because Auth.js
				 * may normalize the user ID independently.
				 */
				const discordId =
					account.providerAccountId?.trim();

				if (!discordId) {
					console.error(
						"[Auth] Discord account ID is missing.",
					);

					throw new Error(
						"Discord account ID is missing.",
					);
				}

				const username =
					typeof user.name === "string" &&
					user.name.trim().length > 0
						? user.name.trim()
						: "Discord User";

				const avatar =
					typeof user.image === "string"
						? user.image
						: null;

				console.log(
					"[Auth] Discord login:",
					{
						discordId,
						username,
					},
				);

				const databaseUser =
					await prisma.user.upsert({
						where: {
							discordId,
						},

						update: {
							username,
							avatar,
						},

						create: {
							discordId,
							username,
							avatar,
						},
					});

				console.log(
					"[Auth] User database sync successful:",
					{
						userId: databaseUser.id,
						discordId:
							databaseUser.discordId,
					},
				);

				return true;
			} catch (error) {
				console.error(
					"[Auth] signIn callback failed:",
					error,
				);

				throw error;
			}
		},

		async jwt({ token, user, account }) {
			/*
			 * account.providerAccountId is available
			 * during the initial OAuth login.
			 */
			if (
				account?.provider === "discord" &&
				account.providerAccountId
			) {
				token.discordId =
					account.providerAccountId;
			}

			/*
			 * Keep the username and avatar from the
			 * normalized Auth.js user.
			 */
			if (user) {
				if (
					typeof user.name === "string" &&
					user.name.trim().length > 0
				) {
					token.username =
						user.name.trim();
				}

				if (
					typeof user.image === "string"
				) {
					token.avatar = user.image;
				}
			}

			console.log("[Auth] JWT:", {
				discordId:
					typeof token.discordId ===
					"string"
						? token.discordId
						: null,
				username:
					typeof token.username ===
					"string"
						? token.username
						: null,
			});

			return token;
		},

		async session({ session, token }) {
			if (session.user) {
				session.user.id = String(
					token.discordId ?? "",
				);

				session.user.name =
					typeof token.username ===
					"string"
						? token.username
						: "Discord User";

				session.user.image =
					typeof token.avatar ===
					"string"
						? token.avatar
						: null;
			}

			return session;
		},
	},
});