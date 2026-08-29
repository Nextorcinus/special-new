import type { Expert } from "../types";

export interface SigilCalculationResult {
	required: number;
	currentSpecific: number;
	specificUsed: number;
	remaining: number;
	generalUsed: number;
	short: number;
}

export function calculateRequiredSigils(
	expert: Expert,
	fromLevel: number,
	toLevel: number,
): number {
	if (toLevel <= fromLevel) {
		return 0;
	}

	let total = 0;

	for (
		let level = 10;
		level <= 100;
		level += 10
	) {
		if (
			level > fromLevel &&
			level <= toLevel
		) {
			const index =
				level / 10 - 1;

			total +=
				expert.sigilCosts[index] ?? 0;
		}
	}

	return total;
}

export function calculateSigils(
	expert: Expert,
	fromLevel: number,
	toLevel: number,
	currentSpecificSigils = 0,
	generalSigils = 0,
): SigilCalculationResult {
	const required =
		calculateRequiredSigils(
			expert,
			fromLevel,
			toLevel,
		);

	const currentSpecific =
		Math.max(
			0,
			currentSpecificSigils,
		);

	const availableGeneral =
		Math.max(
			0,
			generalSigils,
		);

	const specificUsed = Math.min(
		currentSpecific,
		required,
	);

	const remaining =
		required - specificUsed;

	const generalUsed = Math.min(
		availableGeneral,
		remaining,
	);

	const short =
		remaining - generalUsed;

	return {
		required,
		currentSpecific,
		specificUsed,
		remaining,
		generalUsed,
		short,
	};
}