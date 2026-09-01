"use client";

import type { ExpertInventoryState } from "../types";

interface ExpertInventoryProps {
	inventory: ExpertInventoryState;

	onChange: (key: keyof ExpertInventoryState, value: number) => void;
}

interface InventoryField {
	key: keyof ExpertInventoryState;
	label: string;
	description: string;
	icon: string;
}

const fields: InventoryField[] = [
	{
		key: "compassGifts",
		label: "Compass",
		description: "+10 Affinity",
		icon: "/icons/compass.png",
	},
	{
		key: "fieryHeartGifts",
		label: "Fiery Heart",
		description: "+100 Affinity",
		icon: "/icons/fiery-heart.png",
	},
	{
		key: "sailConquestGifts",
		label: "Sail of Conquest",
		description: "+1,000 Affinity",
		icon: "/icons/sail-of-conquest.png",
	},
	{
		key: "generalSigils",
		label: "General Sigils",
		description: "Universal Expert Sigils",
		icon: "/icons/sigils.png",
	},
	{
		key: "booksOfKnowledge",
		label: "Books of Knowledge",
		description: "Books of Knowledge",
		icon: "/icons/books.png",
	},
	{
		key: "learningSpeedupMinutes",
		label: "Learning Speedup",
		description: "Minutes",
		icon: "/icons/learning_speedup.png",
	},
];

function getInputValue(value: number): string | number {
	return value === 0 ? "" : value;
}

export function ExpertInventory({ inventory, onChange }: ExpertInventoryProps) {
	return (
		<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
			{/* =====================================================
			    HEADER
			    ===================================================== */}

			<div className="mb-4">
				<h2 className="text-base font-semibold text-white">Expert Inventory</h2>

				<p className="mt-1 text-xs text-white/40">
					Enter your available Expert resources.
				</p>
			</div>

			{/* =====================================================
			    INVENTORY GRID
			    ===================================================== */}

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{fields.map((field) => {
					const value = inventory[field.key];

					return (
						<div
							key={field.key}
							className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
						>
							{/* =====================================
							    RESOURCE HEADER
							    ===================================== */}

							<label htmlFor={`expert-${field.key}`} className="block">
								<div className="flex items-center gap-2">
									<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
										<img
											src={field.icon}
											alt=""
											aria-hidden="true"
											className="h-6 w-6 object-contain"
										/>
									</div>

									<div className="min-w-0">
										<span className="block text-sm font-medium text-white">
											{field.label}
										</span>

										<span className="mt-0.5 block text-xs text-white/40">
											{field.description}
										</span>
									</div>
								</div>
							</label>

							{/* =====================================
							    INPUT
							    ===================================== */}

							<input
								id={`expert-${field.key}`}
								type="number"
								min={0}
								step={1}
								inputMode="numeric"
								value={getInputValue(value)}
								placeholder="0"
								onChange={(event) => {
									const rawValue = event.target.value;

									/*
									 * Allow the input to
									 * temporarily be empty.
									 */
									if (rawValue === "") {
										onChange(field.key, 0);

										return;
									}

									const parsed = Number.parseInt(rawValue, 10);

									onChange(
										field.key,
										Number.isFinite(parsed) ? Math.max(0, parsed) : 0,
									);
								}}
								className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-white/20 focus:bg-white/10"
							/>
						</div>
					);
				})}
			</div>
		</section>
	);
}
