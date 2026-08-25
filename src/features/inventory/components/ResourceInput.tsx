"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useInventoryStore } from "../store/inventory.store";
import type { ResourceItem } from "../types";

type ResourceInputProps = {
	item: ResourceItem;
};

function isValidResourceValue(value: string) {
	if (value === "") return true;

	return /^\d+(?:\.\d*)?[KMB]?$/.test(value);
}

export default function ResourceInput({ item }: ResourceInputProps) {
	const storedValue = useInventoryStore(
		(state) => state.resources[item.id] ?? "",
	);
	const setResource = useInventoryStore((state) => state.setResource);

	const [value, setValue] = useState(storedValue);
	const [error, setError] = useState("");

	useEffect(() => {
		setValue(storedValue);
	}, [storedValue]);

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const nextValue = event.target.value.toUpperCase().replace(/\s/g, "");

		setValue(nextValue);

		if (!isValidResourceValue(nextValue)) {
			setError("Use numbers with an optional K, M, or B suffix.");
			return;
		}

		setError("");
		setResource(item.id, nextValue);
	}

	function handleBlur() {
		if (isValidResourceValue(value)) return;

		setValue(storedValue);
		setError("Invalid value was removed.");
	}

	const errorId = `resource-${item.id}-error`;

	return (
		<label className="block">
			<span className="mb-1 block text-[11px] text-zinc-500">{item.label}</span>

			<div
				className={`flex h-10 items-center gap-2 rounded-lg border px-3 transition-colors ${
					error
						? "border-red-500 bg-red-500/5"
						: "border-transparent bg-[var(--sl-input)] hover:border-[var(--sl-border)]"
				}`}
			>
				<Image src={item.icon} alt={item.label} width={30} height={30} />

				<input
					type="text"
					inputMode="decimal"
					autoCapitalize="characters"
					autoComplete="off"
					value={value}
					onChange={handleChange}
					onBlur={handleBlur}
					placeholder="0 / 134K / 3.4M"
					aria-invalid={Boolean(error)}
					aria-describedby={error ? errorId : undefined}
					className="w-full bg-transparent text-xs text-[var(--sl-text)] outline-none placeholder:text-zinc-500"
				/>
			</div>

			{error && (
				<span
					id={errorId}
					className="mt-1 block text-[10px] leading-4 text-red-500"
				>
					{error}
				</span>
			)}
		</label>
	);
}
