import type { Metadata } from "next";
import { Geist } from "next/font/google";
import ThemeProvider from "@/providers/ThemeProvider";
import "@/styles/globals.css";
import "@/styles/theme.css";
import MobileBottomBar from "@/components/mobile/MobileBottomBar";
import AppToaster from "@/components/ui/toaster";

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
	description: "Whiteout Survival Companion",
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
			<body className="min-h-full flex flex-col bg-[var(--sl-bg)] text-[var(--sl-text)]">
				<ThemeProvider>
					<main className="pb-28 md:pb-0">{children}</main>
					<MobileBottomBar />
					<AppToaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
