import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

export const { auth, handlers, signIn, signOut } = NextAuth({
	providers: [
		Discord({
			clientId: process.env.AUTH_DISCORD_ID,
			clientSecret: process.env.AUTH_DISCORD_SECRET,
			authorization: {
				params: {
					scope: "identify",
				},
			},
		}),
	],
	session: {
		strategy: "jwt",
	},
	callbacks: {
		async jwt({ token, profile }) {
			if (profile) {
				token.discordId = profile.id;
				token.username = profile.username;
				token.avatar = profile.image;
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.discordId as string;
				session.user.name = token.username as string;
				session.user.image = token.avatar as string | null | undefined;
			}

			return session;
		},
	},
});