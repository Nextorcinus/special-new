"use client";

import {
	Check,
	Calculator,
	LockKeyhole,
} from "lucide-react";

import SLInput from "@/components/ui/sl-ui/SLInput";
import SLLabel from "@/components/ui/sl-ui/SLLabel";

import type { RfcSetupValues } from "../type";

type RfcSetupProps = {
	values: RfcSetupValues;
	onChange: (values: RfcSetupValues) => void;
};

function formatNumber(value: number): string {
	if (!Number.isFinite(value)) {
		return "0";
	}

	return new Intl.NumberFormat("en-US").format(
		Math.max(0, Math.floor(value)),
	);
}

export default function RfcSetup({
	values,
	onChange,
}: RfcSetupProps) {
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

		const parsedValue = Number.parseInt(
			rawValue,
			10,
		);

		if (!Number.isFinite(parsedValue)) {
			return;
		}

		onChange({
			...values,
			startingCount: Math.min(
				Math.max(parsedValue, 0),
				100,
			),
		});
	}

	return (
		<div className="rounded-2xl bg-[var(--sl-surface)] ">
			<div className="flex items-start gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
					<Calculator className="size-5 text-[var(--primary)]" />
				</div>

				<div className="min-w-0">
					<p className="text-sm font-bold text-[var(--sl-text)]">
						Simulator Setup
					</p>

					<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
						Set your current weekly conversion count. FC is
						automatically synchronized from your Resource Bag.
					</p>
				</div>
			</div>

			<div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="space-y-2">
					<SLLabel>
						Starting Count
					</SLLabel>

					<SLInput
						type="number"
						min={0}
						max={100}
						step={1}
						value={
							values.startingCount === 0
								? ""
								: values.startingCount
						}
						onChange={
							handleStartingCountChange
						}
						placeholder="0"
					/>

					<p className="text-[11px] leading-4 text-[var(--sl-text-muted)]">
						Number of RFC conversions already completed this week.
					</p>
				</div>

				<div className="space-y-2">
					<div className="flex items-center justify-between gap-2">
						<SLLabel>
							FC Inventory
						</SLLabel>

						<span className="inline-flex items-center gap-1 rounded-md bg-[var(--primary)]/10 px-1.5 py-0.5 text-[9px] font-bold text-[var(--primary)]">
							<Check className="size-2.5" />
							Synced
						</span>
					</div>

					<div className="relative">
						<SLInput
							type="number"
							value={values.fcInventory}
							readOnly
							aria-readonly="true"
							className="pr-10"
						/>

						<div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
							<LockKeyhole className="size-4 text-[var(--sl-text-muted)]" />
						</div>
					</div>

					<div className="flex items-start gap-1.5">
						<Check className="mt-0.5 size-3 shrink-0 text-[var(--primary)]" />

						<p className="text-[11px] leading-4 text-[var(--sl-text-muted)]">
							{formatNumber(values.fcInventory)} FC available
							from your Resource Bag.
						</p>
					</div>
				</div>
			</div>

			<div className="mt-4 rounded-xl border border-[var(--sl-border)] bg-[var(--sl-input)] px-3 py-3">
				<div className="flex items-center justify-between gap-3">
					<span className="text-xs font-medium text-[var(--sl-text-muted)]">
						Weekly Conversion Limit
					</span>

					<span className="text-xs font-bold text-[var(--sl-text)]">
						100
					</span>
				</div>

				<div className="mt-2 flex items-center justify-between gap-3">
					<span className="text-xs font-medium text-[var(--sl-text-muted)]">
						Starting Progress
					</span>

					<span className="text-xs font-bold text-[var(--sl-text)]">
						{values.startingCount}
						/100
					</span>
				</div>

				<div className="mt-2 flex items-center justify-between gap-3">
					<span className="text-xs font-medium text-[var(--sl-text-muted)]">
						Available FC
					</span>

					<span className="text-xs font-bold text-[var(--sl-text)]">
						{formatNumber(values.fcInventory)}
					</span>
				</div>
			</div>
		</div>
	);
}