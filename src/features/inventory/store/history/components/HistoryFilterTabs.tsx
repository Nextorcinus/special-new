"use client";

import type { CalculationModule } from "@/features/inventory/store/history/types";

type FilterValue = CalculationModule | "all";

type HistoryFilterTabsProps = {
	value: FilterValue;
	onChange: (value: FilterValue) => void;
};

const tabs: { label: string; value: FilterValue }[] = [
	{ label: "All", value: "all" },
	{ label: "Buildings", value: "buildings" },
	{ label: "Research", value: "research" },
	{ label: "Chief", value: "gear" },
	{ label: "Charm", value: "charm" },
	{ label: "War Academy", value: "war-academy" },
	{ label: "Widget", value: "widget" },
	{ label: "Pet", value: "pet" },
	{ label: "Troops", value: "troops" },
];

export default function HistoryFilterTabs({
	value,
	onChange,
}: HistoryFilterTabsProps) {
	return (
		<div className="flex gap-2 overflow-x-auto pb-1">
			{tabs.map((tab) => {
				const isActive = value === tab.value;

				return (
					<button
						key={tab.value}
						type="button"
						onClick={() => onChange(tab.value)}
						className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
							isActive
								? "bg-teal-500/80 text-white"
								: "bg-white text-black"
						}`}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}