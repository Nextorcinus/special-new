import type { CalculationModule } from "../types";

type HistoryFilterValue = CalculationModule | "all";

interface HistoryFilterTabsProps {
	value: HistoryFilterValue;
	onChange: (value: HistoryFilterValue) => void;
}

const FILTERS: {
	value: HistoryFilterValue;
	label: string;
}[] = [
	{
		value: "all",
		label: "All",
	},
	{
		value: "buildings",
		label: "Buildings",
	},
	{
		value: "gear",
		label: "Gear",
	},
	{
		value: "charm",
		label: "Charm",
	},
	{
		value: "research",
		label: "Research",
	},
	{
		value: "war-academy",
		label: "War Academy",
	},
	{
		value: "widget",
		label: "Widget",
	},
	{
		value: "pet",
		label: "Pet",
	},
	{
		value: "troops",
		label: "Troops",
	},
	{
		value: "experts",
		label: "Experts",
	},
];

export function HistoryFilterTabs({ value, onChange }: HistoryFilterTabsProps) {
	return (
		<div className="flex gap-2 overflow-x-auto pb-1">
			{FILTERS.map((filter) => {
				const active = value === filter.value;

				return (
					<button
						key={filter.value}
						type="button"
						onClick={() => onChange(filter.value)}
						className={[
							"shrink-0 rounded-lg px-3 py-2",
							"text-xs font-medium",
							"transition-colors",
							active
								? "bg-white/10 text-white"
								: "bg-white/[0.03] text-white/50",
							"hover:bg-white/[0.08]",
						].join(" ")}
					>
						{filter.label}
					</button>
				);
			})}
		</div>
	);
}
