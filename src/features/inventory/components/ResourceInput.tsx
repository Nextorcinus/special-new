"use client";

import Image from "next/image";
import { useInventoryStore } from "../store/inventory.store";
import type { ResourceItem } from "../types";

type ResourceInputProps = {
	item: ResourceItem;
};

export default function ResourceInput({ item }: ResourceInputProps) {
	const value = useInventoryStore((state) => state.resources[item.id] ?? "");
	const setResource = useInventoryStore((state) => state.setResource);

	return (
		<label>
			<span className="mb-1 block text-[11px] text-zinc-400">{item.label}</span>

			<div className="flex h-10 items-center gap-2 rounded-lg bg-[#292929] px-3">
				<Image src={item.icon} alt={item.label} width={30} height={30} />

				<input
					type="text"
					inputMode="text"
					autoCapitalize="characters"
					value={value}
					onChange={(event) => setResource(item.id, event.target.value)}
					placeholder="0 / 134K / 3.4M  "
					className="w-full bg-transparent text-xs text-white outline-none placeholder:text-zinc-500"
				/>
			</div>
		</label>
	);
}
