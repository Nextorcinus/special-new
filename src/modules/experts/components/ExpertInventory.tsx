"use client";

import type {
	ExpertInventoryState,
} from "../types";

interface ExpertInventoryProps {
	inventory: ExpertInventoryState;
	onChange: (
		key: keyof ExpertInventoryState,
		value: number,
	) => void;
}

const fields: {
	key: keyof ExpertInventoryState;
	label: string;
	description: string;
}[] = [
	{
		key: "compassGifts",
		label: "Compass",
		description: "+10 Affinity",
	},
	{
		key: "fieryHeartGifts",
		label: "Fiery Heart",
		description: "+100 Affinity",
	},
	{
		key: "sailConquestGifts",
		label: "Sail of Conquest",
		description: "+1,000 Affinity",
	},
	{
		key: "generalSigils",
		label: "General Sigils",
		description: "Universal Expert Sigils",
	},
	{
		key: "booksOfKnowledge",
		label: "Books of Knowledge",
		description: "Books of Knowledge",
	},
	{
		key: "learningSpeedupMinutes",
		label: "Learning Speedup",
		description: "Minutes",
	},
];

export function ExpertInventory({
	inventory,
	onChange,
}: ExpertInventoryProps) {
	return (
		<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
			<div className="mb-4">
				<h2 className="text-base font-semibold text-white">
					Expert Inventory
				</h2>

				<p className="mt-1 text-xs text-white/40">
					Enter your available Expert
					resources.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{fields.map((field) => (
					<div
						key={field.key}
						className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
					>
						<label
							htmlFor={`expert-${field.key}`}
							className="block"
						>
							<span className="text-sm font-medium text-white">
								{field.label}
							</span>

							<span className="mt-0.5 block text-xs text-white/40">
								{field.description}
							</span>
						</label>

						<input
							id={`expert-${field.key}`}
							type="number"
							min={0}
							step={1}
							inputMode="numeric"
							value={
								inventory[field.key] ||
								""
							}
							placeholder="0"
							onChange={(event) => {
								const value =
									Number.parseInt(
										event.target
											.value,
										10,
									);

								onChange(
									field.key,
									Number.isFinite(
										value,
									)
										? Math.max(
												0,
												value,
											)
										: 0,
								);
							}}
							className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/20"
						/>
					</div>
				))}
			</div>
		</section>
	);
}