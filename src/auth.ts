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

function getDiscordProfile(
	profile: unknown,
): DiscordProfile {
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
					throw new Error(
						"Discord profile ID is missing.",
					);
				}

				const discordId = String(
					discordProfile.id,
				);

				const image =
					getDiscordAvatarUrl(
						discordId,
						discordProfile.avatar,
					);

				return {
					id: discordId,

					name:
						discordProfile.global_name ??
						discordProfile.username ??
						"Discord User",

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
		async signIn({ user }) {
			try {
				/*
				 * user.id comes from the normalized
				 * Discord provider profile() above.
				 *
				 * Therefore we don't need to depend
				 * on the raw Discord profile here.
				 */
				const discordId = String(
					user.id ?? "",
				);

				if (!discordId) {
					console.error(
						"[Auth] Discord user ID is missing.",
					);

					throw new Error(
						"Discord user ID is missing.",
					);
				}

				const username =
					typeof user.name === "string" &&
					user.name.trim()
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
					"[Auth] User database sync successful.",
				);

				return true;
			} catch (error) {
				console.error(
					"[Auth] signIn callback failed:",
					error,
				);

				/*
				 * Don't silently convert a database/auth
				 * error into AccessDenied.
				 *
				 * Throwing allows Auth.js to expose the
				 * actual underlying error.
				 */
				throw error;
			}
		},

		async jwt({ token, user }) {
			if (user) {
				token.discordId = String(
					user.id ?? "",
				);

				token.username =
					typeof user.name === "string"
						? user.name
						: "Discord User";

				token.avatar =
					typeof user.image === "string"
						? user.image
						: null;
			}

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