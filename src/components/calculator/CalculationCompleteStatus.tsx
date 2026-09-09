"use client";

import { Check } from "lucide-react";

import type {
	CalculationCompleteStatusProps,
} from "./calculation-complete.types";

export default function CalculationCompleteStatus({
	completed = false,
	onClick,
	disabled = false,
}: CalculationCompleteStatusProps) {
	if (completed) {
		return (
			<div className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-500/5 px-5 text-sm font-semibold text-emerald-400/80">
				<Check className="size-4" />

				<span>Completed</span>
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--sl-input-hover)] px-5 text-sm font-semibold text-[var(--sl-text)] transition-all hover:bg-[var(--sl-hover)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
		>
			<span>Complete Now</span>
		</button>
	);
}