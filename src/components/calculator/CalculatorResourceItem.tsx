"use client";

import Image from "next/image";

import { cn } from "@/lib/utils";

import type { CalculatorResultItem } from "./types";

type Props = {
	item: CalculatorResultItem;
};

function getCompareClass(type?: CalculatorResultItem["compareType"]) {
	if (type === "plus") {
		return "text-green-400";
	}

	if (type === "minus") {
		return "text-rose-500";
	}

	return "text-white/30";
}

export default function CalculatorResourceItem({ item }: Props) {
	if (item.hidden) {
		return null;
	}

	const hasCompare = item.compareValue !== undefined;

	const stringValue = typeof item.value === "string" ? item.value : null;

	const multilineLines = stringValue?.includes("\n")
		? Array.from(
				new Set(
					stringValue
						.split("\n")
						.map((line) => line.trim())
						.filter(Boolean),
				),
			)
		: null;

	return (
		<div
			className={cn(
				hasCompare
					? "grid grid-cols-[auto_minmax(0,1fr)_auto_auto]"
					: "grid grid-cols-[auto_minmax(0,1fr)_auto]",
				"items-start gap-x-2",
				item.className,
			)}
		>
			<Image
				src={item.icon}
				alt={item.label}
				width={20}
				height={20}
				className="mt-0.5 size-5 shrink-0 object-contain"
			/>

			<span className="min-w-0 truncate text-sm text-[var(--sl-text-muted)]">
				{item.label}
			</span>

			<div
				className={cn(
					"min-w-0 truncate text-right text-sm font-medium text-[var(--sl-text)]",
					item.valueClassName,
				)}
			>
				{multilineLines ? (
					<div className="flex flex-col items-end gap-1">
						{multilineLines.map((line) => (
							<span
								key={`${item.id}-${line}`}
								className="block max-w-full font-normal break-words [overflow-wrap:anywhere]"
							>
								{line}
							</span>
						))}
					</div>
				) : (
					<span className="whitespace-nowrap">{item.value}</span>
				)}
			</div>

			{hasCompare && (
				<span
					className={cn(
						"min-w-14 whitespace-nowrap text-right text-sm",
						getCompareClass(item.compareType),
					)}
				>
					{item.compareValue}
				</span>
			)}
		</div>
	);
}
