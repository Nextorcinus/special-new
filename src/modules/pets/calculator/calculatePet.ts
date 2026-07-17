import type { PetCalculationResult, PetDatabase, PetFormValues } from "../type";

import {
	calculatePetBaseSvsPoints,
	calculatePetFinalSvsPoints,
	createPetMilestoneSnapshot,
	getPetAdvancementResources,
	getPetById,
	getPetLevelResources,
	getPetMilestoneAtLevel,
	getPetPassiveAtLevel,
	getPetPowerAtLevel,
	getReachedPetMilestones,
	getValeriaBonusPct,
	mergePetResources,
	validatePetLevelRange,
} from "./helpers";

type CalculatePetParams = {
	values: PetFormValues;
	database: PetDatabase;
};

export function calculatePet({
	values,
	database,
}: CalculatePetParams): PetCalculationResult {
	const petId = String(values.petId ?? "").trim();

	if (!petId) {
		throw new Error("Pet must be selected.");
	}

	const pet = getPetById(database.pets, petId);

	if (!pet) {
		throw new Error("Pet data not found.");
	}

	const fromLevel = Number(values.fromLevel);

	const toLevel = Number(values.toLevel);

	const valeriaLevel = Number(values.valeriaLevel ?? 0);

	const validationError = validatePetLevelRange(pet, fromLevel, toLevel);

	if (validationError) {
		throw new Error(validationError);
	}

	/**
	 * Resource yang digunakan untuk menaikkan level.
	 *
	 * Saat ini hanya Pet Food.
	 */
	const levelResources = getPetLevelResources(pet, fromLevel, toLevel);

	/**
	 * Milestone/Open Gate yang dilewati.
	 *
	 * Contoh:
	 * Lv.8 -> Lv.35:
	 * Lv.10, Lv.20, Lv.30.
	 */
	const milestonesReached = getReachedPetMilestones(pet, fromLevel, toLevel);

	/**
	 * Resource yang digunakan untuk membuka seluruh gate.
	 */
	const advancementResources = getPetAdvancementResources(milestonesReached);

	/**
	 * Total akhir resource leveling dan Open Gate.
	 */
	const resources = mergePetResources(levelResources, advancementResources);

	const currentMilestone = getPetMilestoneAtLevel(pet, fromLevel);

	const targetMilestone = getPetMilestoneAtLevel(pet, toLevel);

	const powerBefore = getPetPowerAtLevel(pet, fromLevel);

	const powerAfter = getPetPowerAtLevel(pet, toLevel);

	const passiveBeforePct = getPetPassiveAtLevel(pet, fromLevel);

	const passiveAfterPct = getPetPassiveAtLevel(pet, toLevel);

	/**
	 * SvS leveling hanya dihitung dari levelResources.
	 */
	const levelSvsPoints = calculatePetBaseSvsPoints(
		levelResources,
		database.scoringRules,
	);

	/**
	 * SvS Advancement hanya dihitung dari resource Open Gate.
	 */
	const advancementSvsPoints = calculatePetBaseSvsPoints(
		advancementResources,
		database.scoringRules,
	);

	const baseSvsPoints = levelSvsPoints + advancementSvsPoints;

	const valeriaBonusPct = getValeriaBonusPct(valeriaLevel);

	const finalSvsPoints = calculatePetFinalSvsPoints(
		baseSvsPoints,
		valeriaLevel,
	);

	return {
		petId: pet.id,
		petName: pet.name,
		rarity: pet.rarity,
		generation: pet.generation,
		image: pet.image,

		fromLevel,
		toLevel,
		maxLevel: pet.maxLevel,

		levelResources,
		advancementResources,
		resources,

		milestonesReached,

		currentMilestone: createPetMilestoneSnapshot(currentMilestone),

		targetMilestone: createPetMilestoneSnapshot(targetMilestone),

		powerBefore,
		powerAfter,
		powerIncrease: Math.max(powerAfter - powerBefore, 0),

		passiveBeforePct,
		passiveAfterPct,
		passiveIncreasePct: Math.max(passiveAfterPct - passiveBeforePct, 0),

		levelSvsPoints,
		advancementSvsPoints,
		baseSvsPoints,

		valeriaLevel,
		valeriaBonusPct,
		finalSvsPoints,
	};
}
