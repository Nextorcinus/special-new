import type { RfcLuckResult, RfcProbability, RfcTier } from "../type";

export function calculateExpectedRfc(tier: RfcTier): number {
	if (
		!tier ||
		!Array.isArray(tier.probabilities) ||
		tier.probabilities.length === 0
	) {
		return 0;
	}

	return tier.probabilities.reduce(
		(total, probability) =>
			total + Number(probability.rfc ?? 0) * Number(probability.chance ?? 0),
		0,
	);
}

export function normalizeProbabilities(
	probabilities: RfcProbability[],
): RfcProbability[] {
	if (!Array.isArray(probabilities) || probabilities.length === 0) {
		return [];
	}

	const totalChance = probabilities.reduce(
		(total, probability) => total + Number(probability.chance ?? 0),
		0,
	);

	if (totalChance <= 0) {
		return probabilities;
	}

	return probabilities.map((probability) => ({
		...probability,
		chance: Number(probability.chance ?? 0) / totalChance,
	}));
}

export function rollRfc(tier: RfcTier): number {
	const probabilities = normalizeProbabilities(tier.probabilities);

	if (probabilities.length === 0) {
		return 0;
	}

	const random = Math.random();

	let cumulative = 0;

	for (const probability of probabilities) {
		cumulative += probability.chance;

		if (random < cumulative) {
			return probability.rfc;
		}
	}

	return probabilities[probabilities.length - 1].rfc;
}

export function calculateLuck(
	averageRfc: number,
	expectedRfc: number,
): RfcLuckResult {
	if (
		!Number.isFinite(averageRfc) ||
		!Number.isFinite(expectedRfc) ||
		expectedRfc <= 0
	) {
		return {
			label: "Average",
			luck: "neutral",
		};
	}

	const ratio = averageRfc / expectedRfc;

	if (ratio >= 1.15) {
		return {
			label: "Very Lucky",
			luck: "lucky",
		};
	}

	if (ratio > 1) {
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
