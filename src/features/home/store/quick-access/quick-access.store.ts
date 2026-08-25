import { create } from "zustand";
import { persist } from "zustand/middleware";

type QuickAccessState = {
	selectedIds: string[];
	isInitialized: boolean;

	setSelectedIds: (ids: string[]) => void;
};

export const useQuickAccessStore = create<QuickAccessState>()(
	persist(
		(set) => ({
			selectedIds: [],
			isInitialized: false,

			setSelectedIds: (ids) =>
				set({
					selectedIds: ids,
					isInitialized: true,
				}),
		}),
		{
			name: "special-lazyness-quick-access",
		},
	),
);