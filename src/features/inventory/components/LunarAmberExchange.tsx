"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { RESOURCES } from "@/config/resources";
import { formatCompactNumber, parseShortNumber } from "@/lib/number";
import { useInventoryStore } from "../store/inventory.store";

export default function LunarAmberExchange() {
	const resources = useInventoryStore((state) => state.resources);

	const exchangeDesignPlans = useInventoryStore(
		(state) => state.exchangeDesignPlans,
	);

	const plans = useMemo(
		() => parseShortNumber(resources[RESOURCES.Plans.id] ?? ""),
		[resources],
	);

	const amber = useMemo(
		() => parseShortNumber(resources[RESOURCES.Amber.id] ?? ""),
		[resources],
	);

	const [exchangeAmount, setExchangeAmount] = useState("");

	const exchange = Math.max(0, parseShortNumber(exchangeAmount));

	const requiredPlans = exchange * 10;

	const canExchange =
		exchange > 0 && requiredPlans <= plans;

	const resultingAmber = amber + exchange;

	function handleExchange() {
		if (!canExchange) {
			return;
		}

		const success = exchangeDesignPlans(exchange);

		if (success) {
			setExchangeAmount("");
		}
	}

	function handleMax() {
		setExchangeAmount(String(Math.floor(plans / 10)));
	}

	return (
		<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-active)] p-4 sm:p-5">
			{/* Header */}
			<div>
				<h3 className="text-sm font-semibold leading-tight text-[var(--sl-text)]">
					Lunar Amber Exchange
				</h3>

				<p className="mt-1 text-xs leading-tight text-[var(--sl-text-muted)]">
					Convert 10 Design Plans into 1 Lunar Amber.
				</p>
			</div>

			{/* Resource Summary */}
			<div className="mt-4 grid grid-cols-2 gap-3">
				{/* Design Plans */}
				<div className="rounded-xl border border-[var(--sl-border)] bg-[var(--sl-input)] p-3">
					<div className="flex items-center gap-2.5">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-black/10">
							<Image
								src={RESOURCES.Plans.icon}
								alt={RESOURCES.Plans.label}
								width={26}
								height={26}
								className="size-7 object-contain"
							/>
						</div>

						<div className="min-w-0">
							<p className="text-[10px] font-medium uppercase leading-none tracking-wide text-[var(--sl-text-muted)]">
								Available
							</p>

							<p className="mt-1 text-sm font-bold leading-none text-[var(--sl-text)]">
								{formatCompactNumber(plans)}
							</p>
						</div>
					</div>
				</div>

				{/* Lunar Amber */}
				<div className="rounded-xl border border-[var(--sl-border)] bg-[var(--sl-input)] p-3">
					<div className="flex items-center gap-2.5">
						<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-black/10">
							<Image
								src={RESOURCES.Amber.icon}
								alt={RESOURCES.Amber.label}
								width={26}
								height={26}
								className="size-7 object-contain"
							/>
						</div>

						<div className="min-w-0">
							<p className="text-[10px] font-medium uppercase leading-none tracking-wide text-[var(--sl-text-muted)]">
								Current
							</p>

							<p className="mt-1 text-sm font-bold leading-none text-[var(--sl-text)]">
								{formatCompactNumber(amber)}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Exchange Input */}
			<div className="mt-5">
				<label
					htmlFor="lunar-amber-exchange"
					className="mb-2 block text-xs font-semibold leading-none text-[var(--sl-text)]"
				>
					Exchange Amount
				</label>

				<div className="flex h-11 gap-2">
					<input
						id="lunar-amber-exchange"
						type="number"
						min={0}
						value={exchangeAmount}
						onChange={(event) =>
							setExchangeAmount(event.target.value)
						}
						placeholder="0"
						className="min-w-0 flex-1 rounded-xl border border-[var(--sl-border)] bg-[var(--sl-input)] px-3 text-sm text-[var(--sl-text)] outline-none transition-colors placeholder:text-[var(--sl-text-muted)] focus:border-[var(--sl-primary)]"
					/>

					<button
						type="button"
						onClick={handleMax}
						className="shrink-0 rounded-xl border border-[var(--sl-border)] bg-[var(--sl-input)] px-4 text-xs font-semibold text-[var(--sl-text-secondary)] transition-colors hover:bg-[var(--sl-surface)] hover:text-[var(--sl-text)]"
					>
						Max
					</button>
				</div>
			</div>

			{/* Exchange Preview */}
			<div className="mt-4 rounded-xl border border-[var(--sl-border)] bg-[var(--sl-input)] p-3">
				<div className="space-y-2.5">
					{/* Consume */}
					<div className="flex items-center justify-between gap-4">
						<span className="text-xs leading-none text-[var(--sl-text-muted)]">
							Consume
						</span>

						<div className="flex items-center gap-1.5 text-right">
							<span className="text-sm font-semibold leading-none text-[var(--sl-text)]">
								{formatCompactNumber(requiredPlans)}
							</span>

							<span className="text-xs leading-none text-[var(--sl-text-muted)]">
								Design Plans
							</span>
						</div>
					</div>

					<div className="h-px bg-[var(--sl-border)]" />

					{/* Receive */}
					<div className="flex items-center justify-between gap-4">
						<span className="text-xs leading-none text-[var(--sl-text-muted)]">
							Receive
						</span>

						<div className="flex items-center gap-1.5 text-right">
							<span className="text-sm font-semibold leading-none text-[var(--sl-primary)]">
								{formatCompactNumber(exchange)}
							</span>

							<span className="text-xs leading-none text-[var(--sl-text-muted)]">
								Lunar Amber
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Result */}
			{exchange > 0 && canExchange && (
				<div className="mt-3 rounded-xl bg-[var(--sl-primary)]/5 px-3 py-2.5">
					<div className="flex items-center justify-between gap-4">
						<span className="text-xs leading-none text-[var(--sl-text-muted)]">
							Amber after exchange
						</span>

						<span className="text-sm font-semibold leading-none text-[var(--sl-primary)]">
							{formatCompactNumber(resultingAmber)}
						</span>
					</div>
				</div>
			)}

			{/* Exchange Button */}
			<button
				type="button"
				disabled={!canExchange}
				onClick={handleExchange}
				className="mt-4 h-11 w-full rounded-xl bg-[var(--sl-primary)] text-sm font-semibold text-[var(--sl-primary-foreground)] transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
			>
				Exchange
			</button>

			{/* Error */}
			{requiredPlans > plans && (
				<p className="mt-2 text-center text-xs leading-none text-red-400">
					Not enough Design Plans.
				</p>
			)}
		</div>
	);
}