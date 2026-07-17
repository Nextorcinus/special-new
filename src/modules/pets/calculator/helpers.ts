import type {
	PetData,
	PetMilestone,
	PetMilestoneSnapshot,
	PetResources,
	PetScoringRules,
} from "../type";

/**
 * Membuat object resource Pet dengan nilai awal 0.
 *
 * Fungsi ini hanya boleh didefinisikan di helpers.ts.
 * Jangan membuat atau mengekspor fungsi dengan nama sama dari type.ts.
 */
export function createEmptyPetResources(): PetResources {
	return {
		PetFood: 0,
		TamingManual: 0,
		EnergizingPotion: 0,
		StrengtheningSerum: 0,
	};
}

export function getPetById(pets: PetData[], petId: string): PetData | null {
	return pets.find((pet) => pet.id === petId) ?? null;
}

export function clampPetLevel(level: number, maxLevel: number): number {
	if (!Number.isFinite(level)) {
		return 0;
	}

	return Math.min(Math.max(Math.trunc(level), 0), maxLevel);
}

export function getPetLevelOptions(maxLevel: number) {
	const safeMaxLevel = Math.max(Math.trunc(maxLevel), 0);

	return Array.from({ length: safeMaxLevel + 1 }, (_, level) => ({
		value: String(level),
		label: `Lv.${level}`,
	}));
}

export function getPetTargetLevelOptions(fromLevel: number, maxLevel: number) {
	const safeMaxLevel = Math.max(Math.trunc(maxLevel), 0);

	const safeFromLevel = clampPetLevel(fromLevel, safeMaxLevel);

	if (safeFromLevel >= safeMaxLevel) {
		return [];
	}

	return Array.from({ length: safeMaxLevel - safeFromLevel }, (_, index) => {
		const level = safeFromLevel + index + 1;

		return {
			value: String(level),
			label: `Lv.${level}`,
		};
	});
}

/**
 * Pada JSON Pet:
 *
 * food[0] = biaya dari Lv.0 menuju Lv.1
 * food[1] = biaya dari Lv.1 menuju Lv.2
 * food[9] = biaya dari Lv.9 menuju Lv.10
 *
 * Karena itu, biaya menuju targetLevel mengambil:
 *
 * pet.food[targetLevel - 1]
 */
export function getPetFoodBetweenLevels(
	pet: PetData,
	fromLevel: number,
	toLevel: number,
): number {
	const from = clampPetLevel(fromLevel, pet.maxLevel);

	const to = clampPetLevel(toLevel, pet.maxLevel);

	if (to <= from) {
		return 0;
	}

	let total = 0;

	for (let targetLevel = from + 1; targetLevel <= to; targetLevel += 1) {
		total += Number(pet.food[targetLevel] ?? 0);
	}

	return total;
}
/**
 * Resource yang hanya berasal dari peningkatan level.
 *
 * Saat ini peningkatan level hanya menggunakan Pet Food.
 * Resource Open Gate dihitung secara terpisah.
 */
export function getPetLevelResources(
	pet: PetData,
	fromLevel: number,
	toLevel: number,
): PetResources {
	const resources = createEmptyPetResources();

	resources.PetFood = getPetFoodBetweenLevels(pet, fromLevel, toLevel);

	return resources;
}

/**
 * Mengambil semua milestone/Open Gate yang dilewati.
 *
 * Milestone pada fromLevel tidak dihitung ulang karena dianggap
 * sudah dibuka ketika pemain berada pada level tersebut.
 *
 * Contoh:
 * Lv.8 -> Lv.35 menghasilkan milestone Lv.10, Lv.20, Lv.30.
 * Lv.30 -> Lv.40 hanya menghasilkan milestone Lv.40.
 */
export function getReachedPetMilestones(
	pet: PetData,
	fromLevel: number,
	toLevel: number,
): PetMilestone[] {
	const from = clampPetLevel(fromLevel, pet.maxLevel);

	const to = clampPetLevel(toLevel, pet.maxLevel);

	if (to <= from) {
		return [];
	}

	return pet.milestones
		.filter((milestone) => milestone.level > from && milestone.level <= to)
		.sort((first, second) => first.level - second.level);
}

/**
 * Menghitung resource Advancement/Open Gate dari milestone
 * yang dilewati.
 */
export function getPetAdvancementResources(
	milestones: PetMilestone[],
): PetResources {
	const resources = createEmptyPetResources();

	for (const milestone of milestones) {
		resources.TamingManual += Number(milestone.advancement?.manual ?? 0);

		resources.EnergizingPotion += Number(milestone.advancement?.potion ?? 0);

		resources.StrengtheningSerum += Number(milestone.advancement?.serum ?? 0);
	}

	return resources;
}

export function mergePetResources(
	...resourceGroups: PetResources[]
): PetResources {
	const total = createEmptyPetResources();

	for (const resources of resourceGroups) {
		total.PetFood += Number(resources.PetFood ?? 0);

		total.TamingManual += Number(resources.TamingManual ?? 0);

		total.EnergizingPotion += Number(resources.EnergizingPotion ?? 0);

		total.StrengtheningSerum += Number(resources.StrengtheningSerum ?? 0);
	}

	return total;
}

/**
 * Helper gabungan untuk kompatibilitas dengan pemakaian lama.
 *
 * Hasilnya mencakup:
 * - Pet Food dari leveling
 * - Taming Manual dari Open Gate
 * - Energizing Potion dari Open Gate
 * - Strengthening Serum dari Open Gate
 */
export function getPetResourcesBetweenLevels(
	pet: PetData,
	fromLevel: number,
	toLevel: number,
): PetResources {
	const levelResources = getPetLevelResources(pet, fromLevel, toLevel);

	const milestones = getReachedPetMilestones(pet, fromLevel, toLevel);

	const advancementResources = getPetAdvancementResources(milestones);

	return mergePetResources(levelResources, advancementResources);
}

/**
 * Mengambil milestone terakhir yang level-nya tidak melebihi
 * level Pet saat ini.
 *
 * Lv.0 sampai Lv.9  -> null
 * Lv.10 sampai Lv.19 -> milestone Lv.10
 * Lv.20 sampai Lv.29 -> milestone Lv.20
 */
export function getPetMilestoneAtLevel(
	pet: PetData,
	level: number,
): PetMilestone | null {
	const safeLevel = clampPetLevel(level, pet.maxLevel);

	let result: PetMilestone | null = null;

	const sortedMilestones = [...pet.milestones].sort(
		(first, second) => first.level - second.level,
	);

	for (const milestone of sortedMilestones) {
		if (milestone.level > safeLevel) {
			break;
		}

		result = milestone;
	}

	return result;
}

export function createPetMilestoneSnapshot(
	milestone: PetMilestone | null,
): PetMilestoneSnapshot | null {
	if (!milestone) {
		return null;
	}

	return {
		level: milestone.level,
		skillLevel: milestone.skillLevel,
		skillValue: milestone.skillValue,
		cooldown: milestone.cooldown,
		passiveTroopADPct: milestone.passiveTroopADPct,
		power: milestone.power,
	};
}

export function getPetPowerAtLevel(pet: PetData, level: number): number {
	return Number(getPetMilestoneAtLevel(pet, level)?.power ?? 0);
}

export function getPetPassiveAtLevel(pet: PetData, level: number): number {
	return Number(getPetMilestoneAtLevel(pet, level)?.passiveTroopADPct ?? 0);
}

export function getValeriaBonusPct(valeriaLevel: number): number {
	if (!Number.isFinite(valeriaLevel)) {
		return 0;
	}

	const safeLevel = Math.min(Math.max(Math.trunc(valeriaLevel), 0), 10);

	return safeLevel * 2;
}

export function getValeriaMultiplier(valeriaLevel: number): number {
	return 1 + getValeriaBonusPct(valeriaLevel) / 100;
}

export function calculatePetBaseSvsPoints(
	resources: PetResources,
	scoringRules: PetScoringRules,
): number {
	const petFoodPoints =
		Number(resources.PetFood ?? 0) * Number(scoringRules.PetFood ?? 0);

	const manualPoints =
		Number(resources.TamingManual ?? 0) *
		Number(scoringRules.TamingManual ?? 0);

	const potionPoints =
		Number(resources.EnergizingPotion ?? 0) *
		Number(scoringRules.EnergizingPotion ?? 0);

	const serumPoints =
		Number(resources.StrengtheningSerum ?? 0) *
		Number(scoringRules.StrengtheningSerum ?? 0);

	return petFoodPoints + manualPoints + potionPoints + serumPoints;
}

export function calculatePetFinalSvsPoints(
	baseSvsPoints: number,
	valeriaLevel: number,
): number {
	if (!Number.isFinite(baseSvsPoints)) {
		return 0;
	}

	return Math.round(baseSvsPoints * getValeriaMultiplier(valeriaLevel));
}

export function formatPetLevelRange(
	fromLevel: number,
	toLevel: number,
): string {
	return `Lv.${fromLevel} → Lv.${toLevel}`;
}

export function formatPetGeneration(generation: number): string {
	return `GEN ${generation}`;
}

export function formatPetPassive(value: number): string {
	if (!Number.isFinite(value)) {
		return "0%";
	}

	return `${value.toFixed(2).replace(/\.?0+$/, "")}%`;
}

export function validatePetLevelRange(
	pet: PetData | null,
	fromLevel: number,
	toLevel: number,
): string | null {
	if (!pet) {
		return "Please select a pet.";
	}

	if (!Number.isFinite(fromLevel)) {
		return "Current level is invalid.";
	}

	if (!Number.isFinite(toLevel)) {
		return "Target level is invalid.";
	}

	if (!Number.isInteger(fromLevel)) {
		return "Current level must be a whole number.";
	}

	if (!Number.isInteger(toLevel)) {
		return "Target level must be a whole number.";
	}

	if (fromLevel < 0 || fromLevel >= pet.maxLevel) {
		return `Current level must be between 0 and ${pet.maxLevel - 1}.`;
	}

	if (toLevel <= fromLevel) {
		return "Target level must be higher than current level.";
	}

	if (toLevel > pet.maxLevel) {
		return `Target level cannot exceed Lv.${pet.maxLevel}.`;
	}

	return null;
}
