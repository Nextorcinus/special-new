import type { RfcLuckResult, RfcProbability } from "../type";

export function normalizeProbabilities(
	probabilities: RfcProbability[],
): RfcProbability[] {
	if (!Array.isArray(probabilities) || probabilities.length === 0) {
		return [];
	}

	const safeProbabilities = probabilities
		.map((item) => ({
			rfc: normalizeRfc(item?.rfc),
			chance: normalizeChance(item?.chance),
		}))
		.filter((item) => item.rfc > 0 && item.chance > 0);

	if (safeProbabilities.length === 0) {
		return [];
	}

	const totalChance = safeProbabilities.reduce(
		(total, item) => total + item.chance,
		0,
	);

	if (totalChance <= 0) {
		return [];
	}

	return safeProbabilities.map((item) => ({
		rfc: item.rfc,
		chance: item.chance / totalChance,
	}));
}

function normalizeChance(value: unknown): number {
	const number = Number(value);

	if (!Number.isFinite(number)) {
		return 0;
	}

	return Math.max(0, number);
}

function normalizeRfc(value: unknown): number {
	const number = Number(value);

	if (!Number.isFinite(number)) {
		return 0;
	}

	return Math.max(0, Math.floor(number));
}

function normalizeRandom(value?: number): number {
	if (value === undefined) {
		return Math.random();
	}

	const number = Number(value);

	if (!Number.isFinite(number)) {
		return Math.random();
	}

	return Math.min(Math.max(number, 0), 0.999999999);
}

export function getProbabilityPercent(chance: number): number {
	const value = Number(chance);

	if (!Number.isFinite(value)) {
		return 0;
	}

	/*
	 * Probability data may be stored either as:
	 *
	 * 0.65  → 65%
	 * 65    → 65%
	 *
	 * Normalize both formats for display.
	 */
	if (value <= 1) {
		return value * 100;
	}

	return value;
}

export function calculateExpectedRfc(probabilities: RfcProbability[]): number {
	const normalized = normalizeProbabilities(probabilities);

	if (normalized.length === 0) {
		return 0;
	}

	return normalized.reduce((total, item) => total + item.rfc * item.chance, 0);
}

export function rollRfc(
	probabilities: RfcProbability[],
	randomValue?: number,
): number {
	const normalized = normalizeProbabilities(probabilities);

	if (normalized.length === 0) {
		return 0;
	}

	const random = normalizeRandom(randomValue);

	let cumulativeChance = 0;

	for (const item of normalized) {
		cumulativeChance += item.chance;

		if (random < cumulativeChance) {
			return item.rfc;
		}
	}

	return normalized[normalized.length - 1].rfc;
}

export function calculateLuck(
	averageRfc: number,
	expectedRfc: number,
): RfcLuckResult {
	const average = Number(averageRfc);
	const expected = Number(expectedRfc);

	if (
		!Number.isFinite(average) ||
		!Number.isFinite(expected) ||
		expected <= 0
	) {
		return {
			label: "Average",
			luck: "neutral",
		};
	}

	const ratio = average / expected;

	if (ratio >= 1.15) {
		return {
			label: "Lucky",
			luck: "lucky",
		};
	}

	if (ratio <= 0.85) {
		return {
			label: "Unlucky",
			luck: "unlucky",
		};
	}

	return {
		label: "Average",
		luck: "neutral",
	};
}
