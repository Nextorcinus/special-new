"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import {
	formatCompactNumber,
	parseShortNumber,
} from "@/lib/number";

import type {
	TroopCounts,
	TroopLegion,
	TroopRatio,
	TroopType,
} from "../type";

import {
	autoBearTrapFormation,
} from "../utils/TroopAssistantUtils";

import TroopLegionCard from "./TroopLegionCard";
import TroopNumberInput from "./TroopNumberInput";

const TUMBLING_VALUES = [
	0,
	1500,
	3000,
	4500,
	6000,
	7500,
	9000,
	10500,
	12000,
	13500,
	15000,
] as const;

const URSA_BANE_VALUES = [
	0,
	3000,
	6000,
	9000,
	12000,
	15000,
	18000,
	21000,
	24000,
	27000,
	30000,
] as const;

const TROOP_TYPES: TroopType[] = [
	"infantry",
	"lancer",
	"marksman",
];

const DEFAULT_TROOPS: TroopCounts = {
	infantry: 0,
	lancer: 0,
	marksman: 0,
};

const DEFAULT_RATIO: TroopRatio = {
	infantry: 1,
	lancer: 1,
	marksman: 98,
};

function parseTroopValue(value: unknown): number {
	if (typeof value === "number") {
		return Number.isFinite(value)
			? Math.max(0, value)
			: 0;
	}

	const parsed = parseShortNumber(
		String(value ?? ""),
	);

	return Number.isFinite(parsed)
		? Math.max(0, parsed)
		: 0;
}

function safeNumber(value: unknown): number {
	const parsed = Number(value);

	if (!Number.isFinite(parsed)) {
		return 0;
	}

	return Math.max(0, parsed);
}

function createEmptyTroopCounts(): TroopCounts {
	return {
		infantry: 0,
		lancer: 0,
		marksman: 0,
	};
}

function normalizeRatio(
	infantry: number,
	lancer: number,
	marksman: number,
): TroopRatio {
	const total =
		infantry +
		lancer +
		marksman;

	if (total <= 0) {
		return {
			...DEFAULT_RATIO,
		};
	}

	const normalizedInfantry = Math.max(
		0,
		Math.round(
			(infantry / total) * 100,
		),
	);

	const normalizedLancer = Math.max(
		0,
		Math.round(
			(lancer / total) * 100,
		),
	);

	const normalizedMarksman =
		100 -
		normalizedInfantry -
		normalizedLancer;

	return {
		infantry: normalizedInfantry,
		lancer: normalizedLancer,
		marksman: Math.max(
			0,
			normalizedMarksman,
		),
	};
}

export default function TroopAssistantCalculator() {
	const [troops, setTroops] =
		useState<TroopCounts>(
			DEFAULT_TROOPS,
		);

	const [joinerCount, setJoinerCount] =
		useState<number>(5);

	const [rallySize, setRallySize] =
		useState<number>(0);

	const [joinerSize, setJoinerSize] =
		useState<number>(0);

	const [legions, setLegions] =
		useState<TroopLegion[]>([]);

	const [tumblingLevel, setTumblingLevel] =
		useState<number>(0);

	const [cityBuff, setCityBuff] =
		useState<number>(0);

	const [ursaBaneLevel, setUrsaBaneLevel] =
		useState<number>(0);

	/*
	 * ============================================================
	 * SAFE TROOPS
	 * ============================================================
	 */

	const safeTroops: TroopCounts = {
		infantry: parseTroopValue(
			troops.infantry,
		),
		lancer: parseTroopValue(
			troops.lancer,
		),
		marksman: parseTroopValue(
			troops.marksman,
		),
	};

	/*
	 * ============================================================
	 * TOTAL TROOPS
	 * ============================================================
	 */

	const baseTotal =
		safeTroops.infantry +
		safeTroops.lancer +
		safeTroops.marksman;

	/*
	 * ============================================================
	 * BUFF CALCULATION
	 * ============================================================
	 */

	const tumblingBuff =
		TUMBLING_VALUES[tumblingLevel] ?? 0;

	const ursaBaneBuff =
		URSA_BANE_VALUES[ursaBaneLevel] ?? 0;

	const baseRally =
		parseTroopValue(rallySize);

	const beforeCityBuff =
		baseRally +
		tumblingBuff +
		ursaBaneBuff;

	const cityBuffValue =
		Math.floor(
			beforeCityBuff *
				safeNumber(cityBuff),
		);

	const finalRallySize =
		beforeCityBuff +
		cityBuffValue;

	const safeJoinerCount =
		Math.max(
			1,
			Math.floor(
				parseTroopValue(
					joinerCount,
				),
			),
		);

	const maxJoinerCapacity =
		safeJoinerCount > 0
			? Math.floor(
					baseTotal /
						safeJoinerCount,
				)
			: 0;

	/*
	 * ============================================================
	 * TROOP INPUT
	 * ============================================================
	 */

	const onTroopChange = (
		type: TroopType,
		value: unknown,
	) => {
		const parsedValue =
			parseTroopValue(value);

		setTroops(
			(previous) => ({
				...previous,
				[type]: parsedValue,
			}),
		);
	};

	/*
	 * ============================================================
	 * LOCKED / UNLOCKED
	 * ============================================================
	 */

	const lockedLegions =
		legions.filter(
			(legion) =>
				legion.isLocked,
		);

	const unlockedLegions =
		legions.filter(
			(legion) =>
				!legion.isLocked,
		);

	/*
	 * ============================================================
	 * LOCKED TROOPS
	 * ============================================================
	 */

	const lockedUsed =
		lockedLegions.reduce<TroopCounts>(
			(accumulator, legion) => ({
				infantry:
					accumulator.infantry +
					parseTroopValue(
						legion.infantry,
					),

				lancer:
					accumulator.lancer +
					parseTroopValue(
						legion.lancer,
					),

				marksman:
					accumulator.marksman +
					parseTroopValue(
						legion.marksman,
					),
			}),
			createEmptyTroopCounts(),
		);

	/*
	 * ============================================================
	 * REMAINING TROOPS
	 * ============================================================
	 */

	const remainingTroops: TroopCounts = {
		infantry: Math.max(
			0,
			safeTroops.infantry -
				lockedUsed.infantry,
		),

		lancer: Math.max(
			0,
			safeTroops.lancer -
				lockedUsed.lancer,
		),

		marksman: Math.max(
			0,
			safeTroops.marksman -
				lockedUsed.marksman,
		),
	};

	/*
	 * ============================================================
	 * UNLOCKED CAPACITY
	 * ============================================================
	 */

	const unlockedCapacity =
		unlockedLegions.reduce(
			(sum, legion) =>
				sum +
				Math.max(
					0,
					parseTroopValue(
						legion.maxSize,
					),
				),
			0,
		);

	/*
	 * ============================================================
	 * PREFERRED RATIO
	 *
	 * Default:
	 * 1 : 1 : 98
	 *
	 * Rules:
	 * Infantry <= 5%
	 * Lancer > Infantry
	 * Marksman > Lancer
	 * ============================================================
	 */

	let preferredInfantry = 1;
	let preferredLancer = 1;
	let preferredMarksman = 98;

	if (unlockedCapacity > 0) {
		const idealMarksman =
			Math.floor(
				unlockedCapacity *
					0.98,
			);

		const hasEnoughMarksman =
			remainingTroops.marksman >=
			idealMarksman;

		if (!hasEnoughMarksman) {
			const actualMarksman =
				Math.floor(
					(remainingTroops.marksman /
						unlockedCapacity) *
						100,
				);

			preferredMarksman =
				Math.max(
					actualMarksman,
					50,
				);

			preferredMarksman =
				Math.min(
					98,
					preferredMarksman,
				);

			const remaining =
				100 -
				preferredMarksman;

			preferredLancer =
				Math.max(
					preferredInfantry +
						1,
					remaining - 1,
				);

			preferredInfantry =
				Math.min(
					5,
					Math.max(
						0,
						100 -
							preferredLancer -
							preferredMarksman,
					),
				);
		}
	}

	preferredInfantry =
		Math.min(
			5,
			Math.max(
				0,
				preferredInfantry,
			),
		);

	if (
		preferredLancer <=
		preferredInfantry
	) {
		preferredLancer =
			preferredInfantry + 1;
	}

	if (
		preferredMarksman <=
		preferredLancer
	) {
		preferredMarksman =
			preferredLancer + 1;
	}

	const preferredRatio =
		normalizeRatio(
			preferredInfantry,
			preferredLancer,
			preferredMarksman,
		);

	/*
	 * ============================================================
	 * SUGGESTED RATIO
	 * ============================================================
	 */

	let suggestedInfantry = 0;
	let suggestedLancer = 0;
	let suggestedMarksman = 0;

	if (unlockedCapacity > 0) {
		suggestedInfantry = 1;

		suggestedMarksman =
			Math.min(
				98,
				Math.floor(
					(remainingTroops.marksman /
						unlockedCapacity) *
						100,
				),
			);

		suggestedMarksman =
			Math.max(
				0,
				suggestedMarksman,
			);

		suggestedLancer =
			100 -
			suggestedInfantry -
			suggestedMarksman;

		if (
			suggestedMarksman < 98 &&
			suggestedLancer > 65
		) {
			suggestedInfantry = 10;

			suggestedLancer =
				100 -
				suggestedInfantry -
				suggestedMarksman;
		}
	}

	const suggestedRatio: TroopRatio =
		normalizeRatio(
			suggestedInfantry,
			suggestedLancer,
			suggestedMarksman,
		);

	const suggestedTotal =
		suggestedRatio.infantry +
		suggestedRatio.lancer +
		suggestedRatio.marksman;

	/*
	 * ============================================================
	 * APPLY SUGGESTED RATIO
	 * ============================================================
	 */

	const applySuggestedRatio = () => {
		if (
			unlockedLegions.length ===
			0
		) {
			toast.error(
				"All legions are locked",
			);

			return;
		}

		if (unlockedCapacity <= 0) {
			toast.error(
				"No unlocked march capacity",
			);

			return;
		}

		const updated =
			legions.map(
				(legion) => ({
					...legion,
				}),
			);

		const remaining: TroopCounts = {
			...remainingTroops,
		};

		updated
			.filter(
				(legion) =>
					!legion.isLocked,
			)
			.forEach(
				(legion) => {
					const capacity =
						parseTroopValue(
							legion.maxSize,
						);

					if (capacity <= 0) {
						return;
					}

					let infantry =
						Math.floor(
							(capacity *
								suggestedRatio.infantry) /
								100,
						);

					let lancer =
						Math.floor(
							(capacity *
								suggestedRatio.lancer) /
								100,
						);

					let marksman =
						Math.max(
							0,
							capacity -
								infantry -
								lancer,
						);

					infantry =
						Math.min(
							infantry,
							remaining.infantry,
						);

					lancer =
						Math.min(
							lancer,
							remaining.lancer,
						);

					marksman =
						Math.min(
							marksman,
							remaining.marksman,
						);

					remaining.infantry =
						Math.max(
							0,
							remaining.infantry -
								infantry,
						);

					remaining.lancer =
						Math.max(
							0,
							remaining.lancer -
								lancer,
						);

					remaining.marksman =
						Math.max(
							0,
							remaining.marksman -
								marksman,
						);

					legion.infantry =
						infantry;

					legion.lancer =
						lancer;

					legion.marksman =
						marksman;

					legion.ratio = {
						...suggestedRatio,
					};
				},
			);

		setLegions(updated);

		toast.success(
			"Suggested troops applied",
		);
	};

	/*
	 * ============================================================
	 * AUTO FORMATION
	 * ============================================================
	 */

	const handleDistribute = () => {
		if (baseTotal <= 0) {
			toast.error(
				"Please enter troop numbers first",
			);

			return;
		}

		const requestedJoinerCount =
			Math.max(
				1,
				Math.floor(
					parseTroopValue(
						joinerCount,
					),
				),
			);

		const requestedJoinerSize =
			parseTroopValue(
				joinerSize,
			);

		const hasJoinerMaxSize =
			requestedJoinerSize > 0;

		const safeJoinerSize =
			hasJoinerMaxSize
				? Math.min(
						requestedJoinerSize,
						maxJoinerCapacity,
					)
				: 0;

		const result =
			autoBearTrapFormation({
				totalTroops:
					safeTroops,

				rallySize:
					finalRallySize,

				joinerSize:
					safeJoinerSize,

				joinerCount:
					requestedJoinerCount,
			});

		if (result.length === 0) {
			toast.error(
				"Unable to create formation",
			);

			return;
		}

		const mergedResult:
			TroopLegion[] =
			result.map(
				(newLegion, index) => {
					const oldLegion =
						legions[index];

					const isJoiner =
						index > 0;

					const oldRatio =
						oldLegion?.ratio;

					return {
						...newLegion,

						maxSize:
							isJoiner &&
							hasJoinerMaxSize
								? safeJoinerSize
								: newLegion.maxSize,

						isLocked:
							oldLegion?.isLocked ??
							false,

						ratio: oldRatio
							? {
									infantry:
										parseTroopValue(
											oldRatio.infantry,
										),

									lancer:
										parseTroopValue(
											oldRatio.lancer,
										),

									marksman:
										parseTroopValue(
											oldRatio.marksman,
										),
								}
							: {
									...DEFAULT_RATIO,
								},
					};
				},
			);

		setJoinerCount(
			requestedJoinerCount,
		);

		if (hasJoinerMaxSize) {
			setJoinerSize(
				safeJoinerSize,
			);
		}

		setLegions(
			mergedResult,
		);

		toast.success(
			`Rally calculated successfully. ${result.length} formations created`,
		);
	};

	

		return (
		<div className="mx-auto w-full max-w-[760px] space-y-4">
			{/* ================================================== */}
			{/* TROOPS SETUP */}
			{/* ================================================== */}

			<section className="rounded-2xl bg-[var(--sl-surface)] p-4 sm:p-5">
				<div className="mb-5">
					<h2 className="text-xl font-semibold text-white sm:text-2xl">
						Troops Setup
					</h2>

					<p className="mt-1 text-xs text-[var(--sl-text-muted)] sm:text-sm">
						Enter the total number of troops for each type.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
					{TROOP_TYPES.map((type) => {
						const inputId = `troops-${type}`;

						return (
							<div
								key={type}
								className="min-w-0"
							>
								<label
									htmlFor={inputId}
									className="mb-1.5 block text-xs font-medium capitalize text-white/80 sm:text-sm"
								>
									{type}
								</label>

								<TroopNumberInput
									id={inputId}
									value={safeTroops[type]}
									onChange={(value) =>
										onTroopChange(
											type,
											value,
										)
									}
									className="
										h-10
										w-full
										rounded-xl
										border
										border-white/10
										bg-white/5
										px-3
										text-right
										text-sm
										font-medium
										text-white
										outline-none
										transition
										placeholder:text-white/30
										focus:border-cyan-400/50
										focus:bg-white/[0.07]
										focus:ring-1
										focus:ring-cyan-400/20
									"
								/>
							</div>
						);
					})}
				</div>

				<div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
					<div>
						<p className="text-xs text-[var(--sl-text-muted)]">
							Total Troops
						</p>

						<p className="mt-0.5 text-xs text-white/40">
							All troop types combined
						</p>
					</div>

					<span className="text-lg font-semibold text-cyan-300">
						{formatCompactNumber(baseTotal)}
					</span>
				</div>
			</section>

			{/* ================================================== */}
			{/* BEAR TRAP SETUP */}
			{/* ================================================== */}

			<section className="rounded-2xl bg-[var(--sl-surface)] p-4 sm:p-5">
				<div className="mb-5">
					<h3 className="text-lg font-semibold text-white sm:text-xl">
						Bear Trap Formation
					</h3>

					<p className="mt-1 text-xs text-[var(--sl-text-muted)] sm:text-sm">
						Configure your rally and joiner formation.
					</p>
				</div>

				{/* Rally configuration */}
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
					<div>
						<label
							htmlFor="rally-starter-size"
							className="mb-1.5 block text-xs font-medium text-white/80 sm:text-sm"
						>
							Rally Starter Size
						</label>

						<TroopNumberInput
							id="rally-starter-size"
							value={rallySize}
							onChange={(value) =>
								setRallySize(
									parseTroopValue(
										value,
									),
								)
							}
							className="
								h-10
								w-full
								rounded-xl
								border
								border-white/10
								bg-white/5
								px-3
								text-right
								text-sm
								font-medium
								text-white
								outline-none
								transition
								focus:border-cyan-400/50
								focus:bg-white/[0.07]
								focus:ring-1
								focus:ring-cyan-400/20
							"
						/>
					</div>

					<div>
						<label
							htmlFor="total-march"
							className="mb-1.5 block text-xs font-medium text-white/80 sm:text-sm"
						>
							Total March
						</label>

						<TroopNumberInput
							id="total-march"
							value={joinerCount}
							onChange={(value) =>
								setJoinerCount(
									Math.max(
										1,
										Math.floor(
											parseTroopValue(
												value,
											),
										),
									),
								)
							}
							className="
								h-10
								w-full
								rounded-xl
								border
								border-white/10
								bg-white/5
								px-3
								text-right
								text-sm
								font-medium
								text-white
								outline-none
								transition
								focus:border-cyan-400/50
								focus:bg-white/[0.07]
								focus:ring-1
								focus:ring-cyan-400/20
							"
						/>
					</div>
				</div>

				{/* Joiner capacity */}
				<div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<label
								htmlFor="joiner-march-capacity"
								className="block text-sm font-medium text-white"
							>
								Joiner March Max Capacity
							</label>

							<p className="mt-0.5 text-xs text-[var(--sl-text-muted)]">
								Maximum troops available per
								joiner march
							</p>
						</div>

						<div className="flex items-center gap-2">
							<TroopNumberInput
								id="joiner-march-capacity"
								value={joinerSize}
								onChange={(value) =>
									setJoinerSize(
										Math.min(
											parseTroopValue(
												value,
											),
											maxJoinerCapacity,
										),
									)
								}
								className="
									h-9
									w-28
									rounded-lg
									border
									border-white/10
									bg-white/5
									px-2.5
									text-right
									text-sm
									text-white
									outline-none
									transition
									focus:border-cyan-400/50
									focus:ring-1
									focus:ring-cyan-400/20
								"
							/>

							<span className="whitespace-nowrap text-xs text-white/40">
								Max{" "}
								<span className="text-white/60">
									{formatCompactNumber(
										maxJoinerCapacity,
									)}
								</span>
							</span>
						</div>
					</div>
				</div>

				{/* ================================================== */}
				{/* ADDITIONAL BUFF */}
				{/* ================================================== */}

				<div className="mt-5">
					<div className="mb-3">
						<h4 className="text-sm font-semibold text-white">
							Additional Buff
						</h4>

						<p className="mt-0.5 text-xs text-[var(--sl-text-muted)]">
							Apply available buffs to your rally size.
						</p>
					</div>

					<div className="space-y-2">
						{/* Snow Ape */}
						<div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
							<div className="flex items-center gap-3">
								<Image
									src="/icons/pets/snow-ape.png"
									alt="Snow Ape"
									width={34}
									height={34}
									className="shrink-0 rounded-lg"
								/>

								<div className="min-w-0 flex-1">
									<label
										htmlFor="tumbling-level"
										className="block text-sm font-medium text-white"
									>
										Snow Ape Pet Buff
									</label>

									<p className="mt-0.5 text-xs text-white/40">
										+ troop deployment
									</p>
								</div>

								<select
									id="tumbling-level"
									value={tumblingLevel}
									onChange={(event) =>
										setTumblingLevel(
											Number(
												event.target.value,
											),
										)
									}
									className="
										h-9
										min-w-[120px]
										rounded-lg
										border
										border-white/10
										bg-white/5
										px-2.5
										text-xs
										text-white
										outline-none
										transition
										focus:border-cyan-400/50
									"
								>
									{TUMBLING_VALUES.map(
										(value, index) => (
											<option
												key={`tumbling-${value}`}
												value={index}
												className="bg-zinc-900 text-white"
											>
												Level {index} (+
												{formatCompactNumber(
													value,
												)}
												)
											</option>
										),
									)}
								</select>
							</div>
						</div>

						{/* City Buff */}
						<div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
							<div className="flex items-center gap-3">
								<Image
									src="/icons/buff.png"
									alt="Capacity"
									width={34}
									height={34}
									className="shrink-0 rounded-lg"
								/>

								<div className="min-w-0 flex-1">
									<label
										htmlFor="city-buff"
										className="block text-sm font-medium text-white"
									>
										Buff Capacity Deployment
									</label>

									<p className="mt-0.5 text-xs text-white/40">
										Increase rally capacity
									</p>
								</div>

								<select
									id="city-buff"
									value={cityBuff}
									onChange={(event) =>
										setCityBuff(
											Number(
												event.target.value,
											),
										)
									}
									className="
										h-9
										min-w-[120px]
										rounded-lg
										border
										border-white/10
										bg-white/5
										px-2.5
										text-xs
										text-white
										outline-none
										transition
										focus:border-cyan-400/50
									"
								>
									<option
										value={0}
										className="bg-zinc-900 text-white"
									>
										None (0%)
									</option>

									<option
										value={0.1}
										className="bg-zinc-900 text-white"
									>
										10%
									</option>

									<option
										value={0.2}
										className="bg-zinc-900 text-white"
									>
										20%
									</option>
								</select>
							</div>
						</div>

						{/* Ursa's Bane */}
						<div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
							<div className="flex items-center gap-3">
								<Image
									src="/icons/pets/ursas-bane.webp"
									alt="Ursa's Bane"
									width={34}
									height={34}
									className="shrink-0 rounded-lg"
								/>

								<div className="min-w-0 flex-1">
									<label
										htmlFor="ursa-bane-level"
										className="block text-sm font-medium text-white"
									>
										Ursa's Bane
									</label>

									<p className="mt-0.5 text-xs text-white/40">
										+ troop deployment
									</p>
								</div>

								<select
									id="ursa-bane-level"
									value={ursaBaneLevel}
									onChange={(event) =>
										setUrsaBaneLevel(
											Number(
												event.target.value,
											),
										)
									}
									className="
										h-9
										min-w-[120px]
										rounded-lg
										border
										border-white/10
										bg-white/5
										px-2.5
										text-xs
										text-white
										outline-none
										transition
										focus:border-cyan-400/50
									"
								>
									{URSA_BANE_VALUES.map(
										(value, index) => (
											<option
												key={`ursa-bane-${value}`}
												value={index}
												className="bg-zinc-900 text-white"
											>
												Level {index} (+
												{formatCompactNumber(
													value,
												)}
												)
											</option>
										),
									)}
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Rally result */}
				<div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-3.5">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-xs text-white/50">
								Rally Size After Buff
							</p>

							<p className="mt-0.5 text-xs text-white/30">
								Final deployment capacity
							</p>
						</div>

						<span className="text-lg font-semibold text-cyan-300">
							{formatCompactNumber(
								finalRallySize,
							)}
						</span>
					</div>
				</div>

				{/* Calculate */}
				<div className="mt-4 border-t border-white/10 pt-4">
					<button
						type="button"
						onClick={handleDistribute}
						className="
							flex
							h-11
							w-full
							items-center
							justify-center
							rounded-xl
							border
							border-cyan-400/30
							bg-cyan-400/10
							px-5
							text-sm
							font-semibold
							text-cyan-300
							transition-all
							duration-200
							hover:border-cyan-300/50
							hover:bg-cyan-400/20
							hover:text-cyan-200
							active:scale-[0.98]
						"
					>
						Calculate Formation
					</button>
				</div>
			</section>

			{/* ================================================== */}
			{/* LEGION CARDS */}
			{/* ================================================== */}

			{legions.length > 0 && (
				<div className="space-y-3">
					<div className="px-1">
						<h3 className="text-lg font-semibold text-white">
							Formation Result
						</h3>

						<p className="mt-0.5 text-xs text-[var(--sl-text-muted)]">
							Adjust individual marches below.
						</p>
					</div>

					{legions.map((legion, index) => (
						<TroopLegionCard
							key={legion.id}
							legion={legion}
							index={index}
							isRallyStarter={index === 0}
							lockJoinerMaxSize={
								index > 0 &&
								joinerSize > 0
							}
							totalTroops={safeTroops}
							legions={legions}
							onUpdate={(updatedLegion) => {
								setLegions(
									(previous) =>
										previous.map(
											(item) =>
												item.id ===
												updatedLegion.id
													? updatedLegion
													: item,
										),
								);
							}}
							onRemove={() => {
								setLegions(
									(previous) =>
										previous.filter(
											(item) =>
												item.id !==
												legion.id,
										),
								);
							}}
						/>
					))}
				</div>
			)}

			{/* ================================================== */}
			{/* TOTAL REQUIRED */}
			{/* ================================================== */}

			{legions.length > 0 && (
				<div className="rounded-2xl bg-[var(--sl-surface)] p-4 sm:p-5">
					<div className="mb-4">
						<h3 className="text-lg font-semibold text-white sm:text-xl">
							Total Required for {legions.length} Squads
						</h3>

						<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
							Compare your formation requirements with available troops.
						</p>
					</div>

					<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
						{TROOP_TYPES.map((type) => {
							const required =
								legions.reduce(
									(sum, legion) =>
										sum +
										parseTroopValue(
											legion[type],
										),
									0,
								);

							const totalAvailable =
								safeTroops[type];

							const remain =
								totalAvailable -
								required;

							const isEnough =
								remain >= 0;

							return (
								<div
									key={`required-${type}`}
									className={`
										rounded-xl
										border
										p-3
										${
											isEnough
												? "border-cyan-400/20 bg-cyan-400/5"
												: "border-red-400/30 bg-red-400/5"
										}
									`}
								>
									<div className="flex items-center justify-between gap-2">
										<p className="text-xs capitalize text-white/50">
											{type}
										</p>

										<span
											className={`
												rounded-full
												px-2
												py-0.5
												text-[10px]
												font-semibold
												${
													isEnough
														? "bg-green-500/15 text-green-400"
														: "bg-red-500/15 text-red-400"
												}
											`}
										>
											{isEnough
												? "OK"
												: "NOT ENOUGH"}
										</span>
									</div>

									<p className="mt-2 text-base font-semibold text-white">
										{formatCompactNumber(
											required,
										)}
									</p>

									<p className="mt-1 text-xs text-white/40">
										Available{" "}
										<span className="text-white/60">
											{formatCompactNumber(
												totalAvailable,
											)}
										</span>
									</p>

									{!isEnough && (
										<p className="mt-1 text-xs text-red-400">
											Need{" "}
											{formatCompactNumber(
												Math.abs(
													remain,
												),
											)}{" "}
											more
										</p>
									)}
								</div>
							);
						})}
					</div>

					{/* Suggested Ratio */}
					<div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p className="text-sm font-semibold text-amber-300">
									💡 Suggested Ratio
								</p>

								<p className="mt-0.5 text-xs text-white/40">
									Based on available troops
								</p>
							</div>

							<button
								type="button"
								onClick={
									applySuggestedRatio
								}
								className="
									w-full
									rounded-xl
									bg-amber-400
									px-4
									py-2.5
									text-sm
									font-semibold
									text-black
									transition
									hover:bg-amber-300
									active:scale-[0.98]
									sm:w-auto
								"
							>
								Apply to March
							</button>
						</div>

						<div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
							<div className="rounded-lg bg-white/[0.035] p-3">
								<p className="text-xs text-white/40">
									Preferred
								</p>

								<p className="mt-1 text-sm font-medium text-cyan-300">
									{preferredRatio.infantry}%{" "}
									/{" "}
									{preferredRatio.lancer}%{" "}
									/{" "}
									{preferredRatio.marksman}%
								</p>
							</div>

							<div className="rounded-lg bg-white/[0.035] p-3">
								<p className="text-xs text-white/40">
									Suggested
								</p>

								<p className="mt-1 text-sm font-medium text-green-300">
									{suggestedRatio.infantry}%{" "}
									/{" "}
									{suggestedRatio.lancer}%{" "}
									/{" "}
									{suggestedRatio.marksman}%
								</p>
							</div>
						</div>

						<div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
							<span className="text-xs text-white/40">
								Total Ratio
							</span>

							<span className="text-sm font-semibold text-green-400">
								{suggestedTotal}%
							</span>
						</div>

						<p className="mt-3 text-[11px] italic text-amber-200/60">
							🔒 Locked ratios are kept at your preferred values.
						</p>
					</div>
				</div>
			)}
		</div>
	);
}