import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import AppToaster from "@/components/ui/toaster";
import MobileBottomBar from "@/components/mobile/MobileBottomBar";
import SplashScreen from "@/components/onboarding/SplashScreen";

import ThemeProvider from "@/providers/ThemeProvider";

import "@/styles/globals.css";
import "@/styles/theme.css";

const geist = Geist({
	variable: "--font-sans",
	subsets: ["latin"],
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "Special Lazyness",
		template: "%s | Special Lazyness",
	},

	description:
		"Whiteout Survival calculator and companion for Chief Gear, Chief Charm, Research, Buildings, Heroes, Troops, War Academy, and more.",

	applicationName: "Special Lazyness",

	icons: {
		icon: "/favicon.ico",
	},

	appleWebApp: {
		capable: true,
		title: "Special Lazyness",
		statusBarStyle: "black-translucent",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#111111",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${geist.variable} h-full antialiased`}
		>
			<body className="flex min-h-full flex-col bg-[var(--sl-bg)] text-[var(--sl-text)]">
				<ThemeProvider>
					<SplashScreen />

					<main className="pb-28 md:pb-0">
						{children}
					</main>

					<MobileBottomBar />

					<AppToaster />
				</ThemeProvider>
			</body>
		</html>
	);
}