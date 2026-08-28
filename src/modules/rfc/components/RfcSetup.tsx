"use client";

import { Calculator } from "lucide-react";

import SLInput from "@/components/ui/sl-ui/SLInput";
import SLLabel from "@/components/ui/sl-ui/SLLabel";

import type { RfcSetupValues } from "../type";

type RfcSetupProps = {
	values: RfcSetupValues;
	onChange: (values: RfcSetupValues) => void;
};

function parseInteger(value: string, fallback = 0): number {
	const parsed = Number.parseInt(value, 10);

	if (!Number.isFinite(parsed)) {
		return fallback;
	}

	return parsed;
}

export default function RfcSetup({ values, onChange }: RfcSetupProps) {
	function handleStartingCountChange(
		event: React.ChangeEvent<HTMLInputElement>,
	) {
		const rawValue = event.target.value;

		if (rawValue === "") {
			onChange({
				...values,
				startingCount: 0,
			});

			return;
		}

		const parsedValue = parseInteger(rawValue, values.startingCount);

		onChange({
			...values,
			startingCount: Math.min(Math.max(parsedValue, 0), 100),
		});
	}

	function handleFcInventoryChange(event: React.ChangeEvent<HTMLInputElement>) {
		const rawValue = event.target.value;

		if (rawValue === "") {
			onChange({
				...values,
				fcInventory: 0,
			});

			return;
		}

		const parsedValue = parseInteger(rawValue, values.fcInventory);

		onChange({
			...values,
			fcInventory: Math.max(parsedValue, 0),
		});
	}

	const startingCount = Math.min(
		Math.max(Number(values.startingCount ?? 0), 0),
		100,
	);

	const fcInventory = Math.max(Number(values.fcInventory ?? 0), 0);

	return (
		<div className="w-full min-w-0">
			<div className="flex min-w-0 items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-input)]">
					<Calculator className="size-5 text-[var(--sl-text)]" />
				</div>

				<div className="min-w-0">
					<h2 className="text-sm font-bold text-[var(--sl-text)]">
						Simulator Setup
					</h2>

					<p className="mt-1 max-w-md text-xs leading-5 text-[var(--sl-text-muted)]">
						Set your current weekly conversion count and available FC.
					</p>
				</div>
			</div>

			<div className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="min-w-0 space-y-2">
					<SLLabel>Starting Count</SLLabel>

					<SLInput
						type="number"
						min={0}
						max={100}
						step={1}
						value={startingCount === 0 ? "" : startingCount}
						onChange={handleStartingCountChange}
						placeholder="0"
					/>

					<p className="text-[11px] leading-4 text-[var(--sl-text-muted)]">
						Number of RFC conversions already completed this week.
					</p>
				</div>

				<div className="min-w-0 space-y-2">
					<SLLabel>FC Inventory</SLLabel>

					<SLInput
						type="number"
						min={0}
						step={1}
						value={fcInventory === 0 ? "" : fcInventory}
						onChange={handleFcInventoryChange}
						placeholder="0"
					/>

					<p className="text-[11px] leading-4 text-[var(--sl-text-muted)]">
						Available FC you want to use for RFC conversion.
					</p>
				</div>
			</div>

			<div className="mt-4 rounded-2xl bg-[var(--sl-input)] px-4 py-3">
				<div className="flex items-center justify-between gap-3">
					<span className="text-xs font-medium text-[var(--sl-text-muted)]">
						Weekly Conversion Limit
					</span>

					<span className="text-xs font-bold text-[var(--sl-text)]">100</span>
				</div>

				<div className="mt-2 flex items-center justify-between gap-3">
					<span className="text-xs font-medium text-[var(--sl-text-muted)]">
						Starting Progress
					</span>

					<span className="text-xs font-bold text-[var(--sl-text)]">
						{startingCount}/100
					</span>
				</div>
			</div>
		</div>
	);
}
