import type {
	ExpertInventoryState,
} from "../types";

export interface AffinityGiftResult {
	compass: number;
	fieryHeart: number;
	sailConquest: number;
	totalAffinity: number;
}

export interface SigilInventoryResult {
	specificSigilsUsed: number;
	generalSigilsUsed: number;
	specificSigilsRemaining: number;
	generalSigilsRemaining: number;
	totalSigilsUsed: number;
}

export interface InventoryResult {
	affinity: AffinityGiftResult;
	sigils: SigilInventoryResult;
	booksRemaining: number;
	learningSpeedupRemaining: number;
}

export function calculateGiftAffinity(
	inventory: ExpertInventoryState,
): AffinityGiftResult {
	const compass = Math.max(
		0,
		inventory.compassGifts,
	);

	const fieryHeart = Math.max(
		0,
		inventory.fieryHeartGifts,
	);

	const sailConquest = Math.max(
		0,
		inventory.sailConquestGifts,
	);

	return {
		compass,
		fieryHeart,
		sailConquest,
		totalAffinity:
			compass * 10 +
			fieryHeart * 100 +
			sailConquest * 1000,
	};
}

export function calculateSigilInventory(
	requiredSigils: number,
	currentSpecificSigils: number,
	generalSigils: number,
): SigilInventoryResult {
	const required = Math.max(
		0,
		requiredSigils,
	);

	const specific = Math.max(
		0,
		currentSpecificSigils,
	);

	const general = Math.max(
		0,
		generalSigils,
	);

	const specificUsed = Math.min(
		specific,
		required,
	);

	const remaining =
		required - specificUsed;

	const generalUsed = Math.min(
		general,
		remaining,
	);

	return {
		specificSigilsUsed: specificUsed,
		generalSigilsUsed: generalUsed,
		specificSigilsRemaining:
			specific - specificUsed,
		generalSigilsRemaining:
			general - generalUsed,
		totalSigilsUsed:
			specificUsed + generalUsed,
	};
}

export function calculateInventory(
	inventory: ExpertInventoryState,
	requiredSigils: number,
	currentSpecificSigils: number,
): InventoryResult {
	const affinity =
		calculateGiftAffinity(
			inventory,
		);

	const sigils =
		calculateSigilInventory(
			requiredSigils,
			currentSpecificSigils,
			inventory.generalSigils,
		);

	return {
		affinity,
		sigils,
		booksRemaining:
			Math.max(
				0,
				inventory.booksOfKnowledge,
			),
		learningSpeedupRemaining:
			Math.max(
				0,
				inventory.learningSpeedupMinutes,
			),
	};
}