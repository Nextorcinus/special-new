"use client";

import CalculatorResourceItem from "./CalculatorResourceItem";
import CalculatorStatItem from "./CalculatorStatItem";
import type { CalculatorResultSection } from "./types";

type Props = {
	section: CalculatorResultSection;
};

export default function CalculatorSection({ section }: Props) {
	const visibleItems = section.items.filter((item) => !item.hidden);

	if (visibleItems.length === 0) return null;

	const isTimeSection = section.id === "time";

	return (
		<div className="rounded-[24px] bg-black/20 px-4 py-4">
			<div className="mb-4 flex items-center gap-3 text-white/45">
				{section.icon}
				<span className="text-sm font-medium">{section.title}</span>
			</div>

			<div className={isTimeSection ? "grid grid-cols-1 gap-3" : "grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-8"}>
				{visibleItems.map((item) =>
					isTimeSection ? (
						<CalculatorStatItem key={item.id} item={item} />
					) : (
						<CalculatorResourceItem key={item.id} item={item} />
					)
				)}
			</div>
		</div>
	);
}