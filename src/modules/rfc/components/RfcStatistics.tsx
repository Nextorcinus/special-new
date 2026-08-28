"use client";

import {
	BarChart3,
	Flame,
	Gauge,
	HandCoins,
	Lightbulb,
	Zap,
} from "lucide-react";

import type { RfcStatistics as RfcStatisticsType } from "../type";

type RfcStatisticsProps = {
	statistics: RfcStatisticsType;
	remainingFc: number;
};

function formatNumber(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "0";
	}

	return new Intl.NumberFormat("en-US").format(Math.max(0, Math.floor(number)));
}

function formatDecimal(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "0.00";
	}

	return number.toFixed(2);
}

function getLuckLabel(value: unknown): string {
	const normalized = String(value ?? "")
		.trim()
		.toLowerCase();

	if (
		normalized.includes("very lucky") ||
		normalized.includes("great lucky") ||
		normalized.includes("great")
	) {
		return "Very Lucky";
	}

	if (normalized.includes("lucky")) {
		return "Lucky";
	}

	if (normalized.includes("very unlucky") || normalized.includes("bad")) {
		return "Very Unlucky";
	}

	if (normalized.includes("unlucky")) {
		return "Unlucky";
	}

	if (normalized === "average" || normalized === "") {
		return "Average";
	}

	return String(value);
}

function getLuckColor(value: unknown): string {
	const label = getLuckLabel(value).toLowerCase();

	if (label.includes("very lucky") || label === "lucky") {
		return "text-emerald-400";
	}

	if (label.includes("very unlucky") || label === "unlucky") {
		return "text-red-400";
	}

	return "text-[var(--sl-text)]";
}

function getLuckIcon(value: unknown): string {
	const label = getLuckLabel(value).toLowerCase();

	if (label.includes("lucky")) {
		return "↗";
	}

	if (label.includes("unlucky")) {
		return "↘";
	}

	return "→";
}

function StatCard({
	label,
	value,
	icon,
	description,
	valueClassName,
}: {
	label: string;
	value: string;
	icon: React.ReactNode;
	description?: string;
	valueClassName?: string;
}) {
	return (
		<div className="min-w-0 rounded-2xl bg-[var(--sl-input)] p-4">
			<div className="flex min-w-0 items-center gap-2">
				<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-surface)] text-[var(--sl-text-muted)]">
					{icon}
				</div>

				<p className="min-w-0 text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
					{label}
				</p>
			</div>

			<p
				className={`mt-4 truncate text-md font-bold leading-none ${
					valueClassName ?? "text-[var(--sl-text)]"
				}`}
			>
				{value}
			</p>

			{description && (
				<p className="mt-2 text-xs leading-4 text-[var(--sl-text-muted)]">
					{description}
				</p>
			)}
		</div>
	);
}

export default function RfcStatistics({
	statistics,
	remainingFc,
}: RfcStatisticsProps) {
	const rfcGained = Number(statistics?.rfcGained ?? 0);

	const fcUsed = Number(statistics?.fcUsed ?? 0);

	const conversions = Number(statistics?.conversions ?? 0);

	const averageRfc = Number(statistics?.averageRfc ?? 0);

	const expectedRfc = Number(statistics?.expectedRfc ?? 0);

	const difference = averageRfc - expectedRfc;

	const differencePercent =
		expectedRfc > 0 ? (difference / expectedRfc) * 100 : 0;

	const luck = statistics?.luck;

	const luckLabel = getLuckLabel(luck);

	const luckColor = getLuckColor(luck);

	const luckIcon = getLuckIcon(luck);

	const differenceText =
		difference > 0 ? `+${difference.toFixed(2)}` : difference.toFixed(2);

	const differenceColor =
		difference > 0
			? "text-emerald-400"
			: difference < 0
				? "text-red-400"
				: "text-[var(--sl-text)]";

	const expectedColor =
		differencePercent > 0
			? "text-emerald-400"
			: differencePercent < 0
				? "text-red-400"
				: "text-[var(--sl-text)]";

	return (
		<div className="w-full min-w-0">
			<div className="flex min-w-0 items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-input)]">
					<BarChart3 className="size-5 text-[var(--sl-text)]" />
				</div>

				<div className="min-w-0">
					<h2 className="text-sm font-bold text-[var(--sl-text)]">
						Session Statistics
					</h2>

					<p className="mt-1 max-w-lg text-xs leading-5 text-[var(--sl-text-muted)]">
						Track your RFC results against the expected average.
					</p>
				</div>
			</div>

			<div className="mt-5 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-2">
				<StatCard
					label="RFC Gained"
					value={formatNumber(rfcGained)}
					icon={<Flame className="size-4" />}
				/>

				<StatCard
					label="FC Used"
					value={formatNumber(fcUsed)}
					icon={<Zap className="size-4" />}
				/>

				<StatCard
					label="Conversions"
					value={formatNumber(conversions)}
					icon={<HandCoins className="size-4" />}
				/>

				<StatCard
					label="Avg RFC / Conv"
					value={formatDecimal(averageRfc)}
					icon={<Gauge className="size-4" />}
				/>
			</div>

			<div className="mt-3 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-2">
				<StatCard
					label="Expected RFC"
					value={formatDecimal(expectedRfc)}
					icon={<Lightbulb className="size-4" />}
					description="Expected average RFC per conversion."
				/>

				<div className="min-w-0 rounded-2xl bg-[var(--sl-input)] p-4">
					<div className="flex min-w-0 items-center gap-2">
						<div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-surface)] text-[var(--sl-text-muted)]">
							<span className="text-base">{luckIcon}</span>
						</div>

						<p className="min-w-0 text-[10px] font-semibold uppercase tracking-wide text-[var(--sl-text-muted)]">
							Luck
						</p>
					</div>

					<div className="mt-4 flex min-w-0 items-center gap-2">
						<span className={`text-md font-bold ${luckColor}`}>{luckIcon}</span>

						<p className={`truncate text-md font-bold ${luckColor}`}>
							{luckLabel}
						</p>
					</div>

					<p className="mt-2 text-xs leading-4 text-[var(--sl-text-muted)]">
						Based on your average RFC per conversion.
					</p>
				</div>
			</div>

			<div className="mt-3 grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-2">
				<StatCard
					label="Difference"
					value={differenceText}
					icon={
						<span className="text-sm font-bold">
							{difference >= 0 ? "↗" : "↘"}
						</span>
					}
					description="Average RFC compared with expected."
					valueClassName={differenceColor}
				/>

				<StatCard
					label="Vs Expected"
					value={`${differencePercent >= 0 ? "+" : ""}${differencePercent.toFixed(0)}%`}
					icon={<span className="text-sm font-bold">%</span>}
					description="Performance against expected RFC."
					valueClassName={expectedColor}
				/>
			</div>

			<div className="mt-3 flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-[var(--sl-input)] px-4 py-3">
				<div className="flex min-w-0 items-center gap-2">
					<Flame className="size-4 shrink-0 text-[var(--sl-text-muted)]" />

					<span className="truncate text-xs font-medium text-[var(--sl-text-muted)]">
						Remaining FC
					</span>
				</div>

				<span className="shrink-0 text-lg font-bold text-[var(--sl-text)]">
					{formatNumber(remainingFc)}
				</span>
			</div>
		</div>
	);
}
