"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/theme.store";

export default function ThemeProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const theme = useThemeStore((state) => state.theme);
	const setTheme = useThemeStore((state) => state.setTheme);

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
		setTheme(savedTheme ?? "dark");
	}, [setTheme]);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
		localStorage.setItem("theme", theme);
	}, [theme]);

	return <>{children}</>;
}
