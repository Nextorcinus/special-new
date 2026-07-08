"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { CalculatorResultItem } from "./types";

type Props = {
	item: CalculatorResultItem;
};

export default function CalculatorStatItem({ item }: Props) {
	if (item.hidden) return null;

	return (
		<div
			className={cn(
				"grid grid-cols-[auto_1fr_auto] items-center gap-x-2",
				item.className,
			)}
		>
			<Image
				src={item.icon}
				alt={item.label}
				width={20}
				height={20}
				className="shrink-0"
			/>

			<span className="truncate text-sm text-[var(--sl-text-muted)]">
				{item.label}
			</span>

			<span
				className={cn(
					"whitespace-nowrap text-right text-sm  text-[var(--sl-text-muted)]",
					item.valueClassName,
				)}
			>
				{item.value}
			</span>
		</div>
	);
}
