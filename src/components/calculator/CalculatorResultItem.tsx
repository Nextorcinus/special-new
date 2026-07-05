"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { CalculatorResultItem } from "./types";

type Props = {
	item: CalculatorResultItem;
};

function getCompareClass(type?: CalculatorResultItem["compareType"]) {
	if (type === "plus") return "text-green-400";
	if (type === "minus") return "text-rose-500";
	return "text-white/30";
}

export default function CalculatorResourceItem({ item }: Props) {
	if (item.hidden) return null;

	return (
		<div className={cn("grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-2", item.className)}>
			<Image src={item.icon} alt={item.label} width={20} height={20} className="shrink-0" />

			<span className="truncate text-sm text-white/55">{item.label}</span>

			<span className={cn("justify-self-end whitespace-nowrap text-sm font-semibold text-white", item.valueClassName)}>
				{item.value}
			</span>

			{item.compareValue !== undefined && (
				<span className={cn("min-w-[56px] whitespace-nowrap text-right text-sm font-semibold", getCompareClass(item.compareType))}>
					{item.compareValue}
				</span>
			)}
		</div>
	);
}