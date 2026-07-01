import { create } from "zustand";

type Theme = "dark" | "light";

type ThemeStore = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
	theme: "dark",

	setTheme: (theme) => set({ theme }),

	toggleTheme: () =>
		set((state) => ({
			theme: state.theme === "dark" ? "light" : "dark",
		})),
}));
