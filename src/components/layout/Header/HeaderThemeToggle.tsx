"use client";

import { useThemeStore } from "@/store/theme.store";

export default function HeaderThemeToggle() {
	const theme = useThemeStore((state) => state.theme);
	const toggleTheme = useThemeStore((state) => state.toggleTheme);

	const isDark = theme === "dark";

	return (
		<button
			type="button"
			onClick={toggleTheme}
			className="theme-switch"
			aria-label="Switch theme"
		>
			<span className="theme-switch__icon">☀️</span>
			<span className="theme-switch__icon">🌙</span>

			<span
				className={`theme-switch__thumb ${
					isDark ? "theme-switch__thumb--dark" : ""
				}`}
			/>
		</button>
	);
}
