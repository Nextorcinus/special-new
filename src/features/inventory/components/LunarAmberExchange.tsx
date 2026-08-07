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

	const canExchange = exchange > 0 && requiredPlans <= plans;

	const remainingPlans = Math.max(plans - requiredPlans, 0);

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
		<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface-2)] p-4">
			<h3 className="text-sm font-bold text-[var(--sl-text)]">
				Lunar Amber Exchange
			</h3>

			<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
				Convert 10 Design Plans into 1 Lunar Amber.
			</p>

			<div className="mt-4 grid grid-cols-2 gap-3">
				<div className="rounded-xl bg-[var(--sl-input)] p-3">
					<div className="flex items-center gap-2">
						<Image
							src={RESOURCES.Plans.icon}
							alt={RESOURCES.Plans.label}
							width={26}
							height={26}
						/>

						<div>
							<p className="text-[10px] text-[var(--sl-text-muted)]">
								Available
							</p>

							<p className="text-sm font-bold">{formatCompactNumber(plans)}</p>
						</div>
					</div>
				</div>

				<div className="rounded-xl bg-[var(--sl-input)] p-3">
					<div className="flex items-center gap-2">
						<Image
							src={RESOURCES.Amber.icon}
							alt={RESOURCES.Amber.label}
							width={26}
							height={26}
						/>

						<div>
							<p className="text-[10px] text-[var(--sl-text-muted)]">Current</p>

							<p className="text-sm font-bold">{formatCompactNumber(amber)}</p>
						</div>
					</div>
				</div>
			</div>

			<div className="mt-5">
				<label
					htmlFor="lunar-amber-exchange"
					className="mb-2 block text-xs font-semibold"
				>
					Exchange Amount
				</label>

				<div className="flex gap-2">
					<input
						id="lunar-amber-exchange"
						type="number"
						min={0}
						value={exchangeAmount}
						onChange={(event) => setExchangeAmount(event.target.value)}
						className="h-11 flex-1 rounded-xl border border-(--sl-border) bg-(--sl-input) px-3 outline-none"
					/>

					<button
						type="button"
						onClick={handleMax}
						className="rounded-xl bg-(--sl-surface) px-4 text-sm font-semibold"
					>
						Max
					</button>
				</div>
			</div>

			<div className="mt-5 space-y-2 rounded-xl bg-[var(--sl-input)] p-3 text-sm">
				<div className="flex justify-between">
					<span className="text-[var(--sl-text-muted)]">Consume</span>

					<span>{formatCompactNumber(requiredPlans)} Design Plans</span>
				</div>

				<div className="flex justify-between">
					<span className="text-[var(--sl-text-muted)]">Receive</span>

					<span>{formatCompactNumber(exchange)} Lunar Amber</span>
				</div>
			</div>

			<button
				type="button"
				disabled={!canExchange}
				onClick={handleExchange}
				className="mt-5 h-11 w-full rounded-xl bg-[var(--sl-primary)] font-semibold text-[var(--sl-primary-foreground)] disabled:cursor-not-allowed disabled:opacity-40"
			>
				Exchange
			</button>

			{requiredPlans > plans && (
				<p className="mt-2 text-center text-xs text-red-400">
					Not enough Design Plans.
				</p>
			)}
		</div>
	);
}
