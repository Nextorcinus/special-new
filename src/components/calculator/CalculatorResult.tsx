"use client";

import Image from "next/image";
import { formatHistoryDate } from "@/lib/date";
import CalculatorSection from "./CalculatorSection";
import type { CalculatorResultProps } from "./types";

export default function CalculatorResult({
	title,
	categoryTitle,
	categoryIcon,
	name,
	subtitle,
	highlightLabel,
	highlightValue,
	createdAt,
	updatedAt,
	sections,
}: CalculatorResultProps) {
	return (
		<section className="space-y-5">
			{title && (
				<h2 className="px-1 text-[20px] font-medium text-[var(--text)]">
					{title}
				</h2>
			)}

			<div className="rounded-2xl bg-[var(--sl-surface)] p-4">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<div className="flex size-[72px] shrink-0 items-center justify-center rounded-full bg-[black/20]">
							<div className="flex size-[56px] items-center justify-center rounded-full bg-black/25">
								<Image
									src={categoryIcon}
									alt={categoryTitle}
									width={34}
									height={34}
								/>
							</div>
						</div>

						<div className="min-w-0 space-y-2">
							<h3 className="truncate text-sm font-semibold leading-tight text-[var(--sl-text)] sm:text-[16px]">
								{name}
							</h3>

							{subtitle && (
								<p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--sl-text-muted)] sm:text-[13px]">
									{subtitle}
								</p>
							)}
						</div>
					</div>

					{highlightValue !== undefined && (
						<div className="flex items-center justify-between space-y-2 gap-4 sm:block sm:shrink-0 sm:text-right">
							{highlightLabel && (
								<p className="text-sm text-[var(--sl-text-muted)] sm:text-xs">
									{highlightLabel}
								</p>
							)}

							<p className="text-xs sm:text-[16px] font-medium leading-tight text-yellow-500">
								{highlightValue}
							</p>
						</div>
					)}
				</div>

				<div className="mt-4 space-y-5">
					{sections.map((section) => (
						<CalculatorSection key={section.id} section={section} />
					))}
				</div>

				{(createdAt || updatedAt) && (
					<div className="mt-6 border-t border-[var(--divider)] pt-4">
						<div className="grid grid-cols-2 gap-4 text-xs">
							<div>
								<p className="text-[var(--sl-text)]">Created</p>

								<p className="mt-1 font-medium text-[var(--sl-text-muted)]">
									{createdAt ? formatHistoryDate(createdAt) : "-"}
								</p>
							</div>

							<div className="text-right">
								<p className="text-[var(--sl-text)]">Last Updated</p>

								<p className="mt-1 font-medium text-[var(--sl-text-muted)]">
									{updatedAt ? formatHistoryDate(updatedAt) : "Never"}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
