"use client";

import { useEffect, useRef, useState } from "react";

import TroopNumberInput from "./TroopNumberInput";

import {
	applyRatioToLegion,
	clampTroopValue,
	legionTotal,
} from "../utils/TroopAssistantUtils";

import type {
	TroopCounts,
	TroopLegion,
	TroopRatio,
	TroopType,
} from "../type";

type RatioTuple = [number, number, number];

type CustomRatio = TroopRatio;

type Preset = {
	name: string;
	value: RatioTuple | null;
};

type TroopLegionCardProps = {
	legion: TroopLegion;
	index: number;
	isRallyStarter: boolean;
	lockJoinerMaxSize?: boolean;
	totalTroops: TroopCounts;
	legions: TroopLegion[];
	onUpdate: (legion: TroopLegion) => void;
	onRemove: () => void;
};

const PRESETS: Preset[] = [
	{
		name: "1:1:98",
		value: [1, 1, 98],
	},
	{
		name: "3:2:95",
		value: [3, 2, 95],
	},
	{
		name: "1:2:97",
		value: [1, 2, 97],
	},
	{
		name: "2:2:96",
		value: [2, 2, 96],
	},
	{
		name: "5:2:93",
		value: [5, 2, 93],
	},
	{
		name: "Custom",
		value: null,
	},
];

const CUSTOM_PRESET_INDEX = PRESETS.length - 1;

const TROOP_TYPES: TroopType[] = [
	"infantry",
	"lancer",
	"marksman",
];

export default function TroopLegionCard({
	legion,
	index,
	isRallyStarter,
	lockJoinerMaxSize = false,
	totalTroops,
	legions,
	onUpdate,
	onRemove,
}: TroopLegionCardProps) {
	const title = isRallyStarter
		? "Rally Starter"
		: `March ${index + 1}`;

	const [activePresetIndex, setActivePresetIndex] = useState(0);

	const [customRatio, setCustomRatio] = useState<CustomRatio>({
		infantry: 0,
		lancer: 0,
		marksman: 0,
	});

	const customTotal =
		customRatio.infantry +
		customRatio.lancer +
		customRatio.marksman;

	const isValidCustom = customTotal === 100;

	const hasAppliedDefault = useRef(false);

	/*
	 * Apply default 1:1:98 once when
	 * the legion card is initialized.
	 */
	useEffect(() => {
		if (hasAppliedDefault.current) {
			return;
		}

		const defaultRatio = PRESETS[0].value;

		if (!defaultRatio) {
			return;
		}

		applyRatioToLegion({
			legion,
			ratio: defaultRatio,
			totalTroops,
			legions,
			respectGlobalLimit: false,
		});

		onUpdate({
			...legion,
			ratio: {
				infantry: defaultRatio[0],
				lancer: defaultRatio[1],
				marksman: defaultRatio[2],
			},
		});

		hasAppliedDefault.current = true;
	}, []);

	/*
	 * Keep preset selection synchronized
	 * with the legion ratio.
	 */
	useEffect(() => {
		if (!legion?.ratio) {
			return;
		}

		const foundIndex = PRESETS.findIndex((preset) => {
			if (!preset.value) {
				return false;
			}

			return (
				preset.value[0] === legion.ratio.infantry &&
				preset.value[1] === legion.ratio.lancer &&
				preset.value[2] === legion.ratio.marksman
			);
		});

		const presetIndex =
			foundIndex >= 0
				? foundIndex
				: CUSTOM_PRESET_INDEX;

		setActivePresetIndex(presetIndex);

		setCustomRatio({
			infantry: legion.ratio.infantry,
			lancer: legion.ratio.lancer,
			marksman: legion.ratio.marksman,
		});
	}, [legion?.ratio]);

	const handleChange = (
		type: TroopType,
		value: number,
	) => {
		const newValue = clampTroopValue({
			legion,
			type,
			value,
			totalTroops,
			legions,
		});

		const infantry =
			type === "infantry"
				? newValue
				: legion.infantry;

		const lancer =
			type === "lancer"
				? newValue
				: legion.lancer;

		const marksman =
			type === "marksman"
				? newValue
				: legion.marksman;

		const maxSize = legion.maxSize;

		const updatedLegion: TroopLegion = {
			...legion,
			[type]: newValue,
			ratio: {
				infantry:
					maxSize > 0
						? Math.round(
								(infantry / maxSize) * 100,
							)
						: 0,
				lancer:
					maxSize > 0
						? Math.round(
								(lancer / maxSize) * 100,
							)
						: 0,
				marksman:
					maxSize > 0
						? Math.round(
								(marksman / maxSize) * 100,
							)
						: 0,
			},
		};

		onUpdate(updatedLegion);
	};

	const toggleLock = () => {
		onUpdate({
			...legion,
			isLocked: !legion.isLocked,
		});
	};

	const handlePreset = (
		ratio: RatioTuple | null,
		presetIndex: number,
	) => {
		if (!ratio) {
			setCustomRatio({
				infantry: 0,
				lancer: 0,
				marksman: 0,
			});

			setActivePresetIndex(presetIndex);

			return;
		}

		applyRatioToLegion({
			legion,
			ratio,
			totalTroops,
			legions,
			respectGlobalLimit: false,
		});

		setActivePresetIndex(presetIndex);

		onUpdate({
			...legion,
			ratio: {
				infantry: ratio[0],
				lancer: ratio[1],
				marksman: ratio[2],
			},
		});
	};

	const handleCustomChange = (
		type: TroopType,
		value: string,
	) => {
		let num = Number(value) || 0;

		if (num < 0) {
			num = 0;
		}

		if (num > 100) {
			num = 100;
		}

		const newRatio: CustomRatio = {
			...customRatio,
			[type]: num,
		};

		setCustomRatio(newRatio);

		const capacity = Math.max(
			0,
			Number(legion.maxSize) || 0,
		);

		const infantry = Math.floor(
			capacity * (newRatio.infantry / 100),
		);

		const lancer = Math.floor(
			capacity * (newRatio.lancer / 100),
		);

		const marksman = Math.floor(
			capacity * (newRatio.marksman / 100),
		);

		onUpdate({
			...legion,
			infantry,
			lancer,
			marksman,
			ratio: newRatio,
		});
	};

	const handleNormalize = () => {
		const total =
			customRatio.infantry +
			customRatio.lancer +
			customRatio.marksman;

		if (total >= 100) {
			return;
		}

		const missing = 100 - total;

		let target: TroopType = "lancer";

		/*
		 * Prioritize an empty slot.
		 */
		if (customRatio.lancer === 0) {
			target = "lancer";
		} else if (customRatio.marksman === 0) {
			target = "marksman";
		} else if (customRatio.infantry === 0) {
			target = "infantry";
		} else {
			target =
				customRatio.lancer <
				customRatio.marksman
					? "lancer"
					: "marksman";
		}

		const filled: CustomRatio = {
			...customRatio,
			[target]: customRatio[target] + missing,
		};

		setCustomRatio(filled);

		const capacity = Math.max(
			0,
			Number(legion.maxSize) || 0,
		);

		onUpdate({
			...legion,
			infantry: Math.floor(
				capacity * (filled.infantry / 100),
			),
			lancer: Math.floor(
				capacity * (filled.lancer / 100),
			),
			marksman: Math.floor(
				capacity * (filled.marksman / 100),
			),
			ratio: filled,
		});
	};

	return (
		<div className="space-y-4 rounded-2xl border border-white/10 bg-[var(--sl-surface)] p-4 sm:p-5">
			{/* Header */}
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-3">
					<h4 className="truncate font-semibold text-white">
						{title}
					</h4>

					<button
						type="button"
						onClick={toggleLock}
						className={`
							flex
							items-center
							gap-1
							rounded-md
							border
							px-2
							py-1
							text-xs
							transition
							${
								legion.isLocked
									? "border-amber-400/40 bg-amber-500/10 text-amber-300"
									: "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
							}
						`}
					>
						<span>
							{legion.isLocked ? "🔒" : "🔓"}
						</span>

						<span>
							{legion.isLocked
								? "Locked"
								: "Unlocked"}
						</span>
					</button>
				</div>

				{!isRallyStarter && (
					<button
						type="button"
						onClick={onRemove}
						className="text-sm text-red-400 transition hover:text-red-500"
						title="Remove legion"
					>
						✕
					</button>
				)}
			</div>

			{/* Max size & total */}
			<div className="grid grid-cols-2 items-center gap-4">
				<div>
					<label
						htmlFor={`troop-max-size-${legion.id}`}
						className="text-xs text-white"
					>
						Max March Size
					</label>

					<TroopNumberInput
						id={`troop-max-size-${legion.id}`}
						value={legion.maxSize}
						readOnly={lockJoinerMaxSize}
						disabled={lockJoinerMaxSize}
						onChange={(value) => {
							if (lockJoinerMaxSize) {
								return;
							}

							onUpdate({
								...legion,
								maxSize: Math.max(
									0,
									Number(value) || 0,
								),
							});
						}}
						className={`
							w-full
							rounded-md
							text-right
							disabled:opacity-100
							${
								lockJoinerMaxSize
									? "cursor-not-allowed bg-white/10 text-white/60"
									: "bg-special-input"
							}
						`}
					/>
				</div>

				<div>
					<label
						htmlFor={`troop-total-${legion.id}`}
						className="block text-right text-xs text-[var(--sl-text-muted)]"
					>
						Total
					</label>

					<TroopNumberInput
						id={`troop-total-${legion.id}`}
						readOnly
						value={legionTotal(legion)}
						disabled={legion.isLocked}
						onChange={() => undefined}
						className="
							w-full
							border-0
							bg-transparent
							text-right
							text-lime-300
							shadow-none
							disabled:cursor-not-allowed
							disabled:text-white
							disabled:opacity-70
						"
					/>
				</div>
			</div>

			{/* Presets */}
			<div>
				<div className="mb-2 text-xs text-white">
					Quick Presets %
				</div>

				<div className="flex flex-wrap gap-2 border-t border-white/10 pt-3">
					{PRESETS.map(
						(preset, presetIndex) => {
							const isActive =
								presetIndex ===
								activePresetIndex;

							return (
								<button
									key={preset.name}
									type="button"
									disabled={
										legion.isLocked
									}
									onClick={() =>
										handlePreset(
											preset.value,
											presetIndex,
										)
									}
									className={`
										rounded-md
										border
										px-3
										py-1
										text-sm
										transition
										${
											legion.isLocked
												? "cursor-not-allowed border-white/40 bg-white/5 text-zinc-300/90 opacity-90"
												: isActive
													? "border-cyan-300 bg-cyan-400/30 text-cyan-200"
													: "border-cyan-300/80 bg-white/5 text-cyan-100/90 hover:bg-white/10"
										}
									`}
								>
									{preset.name}
								</button>
							);
						},
					)}
				</div>

				{/* Custom ratio */}
				{PRESETS[activePresetIndex]?.name ===
					"Custom" && (
					<div
						className={`
							mt-2
							grid
							grid-cols-3
							gap-2
							rounded-lg
							border
							p-2
							${
								isValidCustom
									? "border-green-400/40 bg-green-400/5"
									: "border-red-400/40 bg-red-400/5"
							}
						`}
					>
						{TROOP_TYPES.map((type) => (
							<div key={type}>
								<label
									htmlFor={`custom-ratio-${legion.id}-${type}`}
									className="text-xs capitalize text-white/70"
								>
									{type} %
								</label>

								<input
									id={`custom-ratio-${legion.id}-${type}`}
									type="number"
									min={0}
									max={100}
									readOnly={legion.isLocked}
									disabled={legion.isLocked}
									value={customRatio[type]}
									onChange={(event) =>
										handleCustomChange(
											type,
											event.target.value,
										)
									}
									className={`
										w-full
										rounded-md
										border
										p-2
										text-right
										text-sm
										text-white
										outline-none
										bg-special-input
										disabled:cursor-not-allowed
										disabled:text-black/60
										disabled:opacity-70
										[&::-webkit-inner-spin-button]:appearance-none
										[&::-webkit-outer-spin-button]:appearance-none
										[&::-moz-inner-spin-button]:appearance-none
										[&::-moz-appearance]:textfield
										${
											isValidCustom
												? "border-green-400/30"
												: "border-red-400/40"
										}
									`}
								/>
							</div>
						))}

						<div className="col-span-3 flex items-center justify-between gap-3">
							<button
								type="button"
								onClick={handleNormalize}
								disabled={legion.isLocked}
								className="
									rounded-md
									border
									border-cyan-400/30
									px-3
									py-1
									text-xs
									text-cyan-300
									transition
									hover:bg-cyan-400/10
									disabled:cursor-not-allowed
									disabled:opacity-50
								"
							>
								Fill
							</button>

							<div
								className={`
									text-right
									text-xs
									${
										isValidCustom
											? "text-green-400"
											: "text-red-400"
									}
								`}
							>
								Total: {customTotal} / 100
								{!isValidCustom &&
									" (must be exactly 100)"}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Troop controls */}
			{TROOP_TYPES.map((type) => (
				<div
					key={type}
					className="space-y-1"
				>
					<div className="flex items-center justify-between gap-3">
						<label
							htmlFor={`troop-${legion.id}-${type}`}
							className="text-sm capitalize text-white/80"
						>
							{type}
						</label>

						<TroopNumberInput
							id={`troop-${legion.id}-${type}`}
							disabled={legion.isLocked}
							value={legion[type]}
							onChange={(value) =>
								handleChange(
									type,
									value,
								)
							}
							className="
								w-24
								rounded-md
								border-0
								p-1
								text-right
								text-sm
								text-lime-300
								disabled:cursor-not-allowed
								disabled:text-white
								disabled:opacity-70
							"
						/>
					</div>

					<input
						aria-label={`${type} troop slider`}
						type="range"
						disabled={legion.isLocked}
						min={0}
						max={Math.max(
							0,
							legion.maxSize,
						)}
						value={Math.min(
							legion[type],
							Math.max(
								0,
								legion.maxSize,
							),
						)}
						onChange={(event) =>
							handleChange(
								type,
								Number(
									event.target.value,
								),
							)
						}
						className="
							h-2
							w-full
							cursor-pointer
							appearance-none
							rounded-lg
							bg-white/40
							disabled:cursor-not-allowed
							disabled:opacity-60
						"
					/>
				</div>
			))}
		</div>
	);
}