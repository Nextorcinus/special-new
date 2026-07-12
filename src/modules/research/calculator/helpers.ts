import type {
	ResearchCategoryData,
	ResearchDatabase,
	ResearchItemData,
	ResearchLevelData,
	ResearchSelectOption,
	ResearchTier,
} from "../type";

const ROMAN_NUMERAL_ORDER = [
	"I",
	"II",
	"III",
	"IV",
	"V",
	"VI",
	"VII",
	"VIII",
	"IX",
	"X",
] as const;

/**
 * Mengubah angka menjadi angka Romawi.
 */
export function numberToRoman(value: number): string {
	const romanMap: Array<[number, string]> = [
		[1000, "M"],
		[900, "CM"],
		[500, "D"],
		[400, "CD"],
		[100, "C"],
		[90, "XC"],
		[50, "L"],
		[40, "XL"],
		[10, "X"],
		[9, "IX"],
		[5, "V"],
		[4, "IV"],
		[1, "I"],
	];

	if (!Number.isFinite(value) || value <= 0) {
		return "";
	}

	let remaining = Math.floor(value);
	let result = "";

	for (const [number, roman] of romanMap) {
		while (remaining >= number) {
			result += roman;
			remaining -= number;
		}
	}

	return result;
}

/**
 * Mengubah angka Romawi menjadi number.
 *
 * Dipakai untuk sorting tier seperti:
 * I, II, III, IV, V, VI, VII
 */
export function romanToNumber(value: string): number {
	const normalizedValue = value.trim().toUpperCase();

	if (!normalizedValue) {
		return 0;
	}

	const romanValues: Record<string, number> = {
		I: 1,
		V: 5,
		X: 10,
		L: 50,
		C: 100,
		D: 500,
		M: 1000,
	};

	let total = 0;
	let previousValue = 0;

	for (let index = normalizedValue.length - 1; index >= 0; index -= 1) {
		const currentCharacter = normalizedValue[index];
		const currentValue = romanValues[currentCharacter] ?? 0;

		if (currentValue < previousValue) {
			total -= currentValue;
		} else {
			total += currentValue;
		}

		previousValue = currentValue;
	}

	return total;
}

/**
 * Mengurutkan tier berdasarkan angka Romawi.
 *
 * Tier yang tidak dikenali tetap ditempatkan setelah
 * tier angka Romawi.
 */
export function sortResearchTiers(tiers: string[]): string[] {
	return [...tiers].sort((firstTier, secondTier) => {
		const firstKnownIndex = ROMAN_NUMERAL_ORDER.indexOf(
			firstTier as (typeof ROMAN_NUMERAL_ORDER)[number],
		);

		const secondKnownIndex = ROMAN_NUMERAL_ORDER.indexOf(
			secondTier as (typeof ROMAN_NUMERAL_ORDER)[number],
		);

		const firstIsKnown = firstKnownIndex !== -1;
		const secondIsKnown = secondKnownIndex !== -1;

		if (firstIsKnown && secondIsKnown) {
			return firstKnownIndex - secondKnownIndex;
		}

		if (firstIsKnown) {
			return -1;
		}

		if (secondIsKnown) {
			return 1;
		}

		const firstNumber = romanToNumber(firstTier);
		const secondNumber = romanToNumber(secondTier);

		if (firstNumber !== secondNumber) {
			return firstNumber - secondNumber;
		}

		return firstTier.localeCompare(secondTier);
	});
}

/**
 * Mengambil seluruh kategori dari Research.json.
 *
 * Contoh hasil:
 * ["Growth", "Economy", "Battle"]
 */
export function getResearchCategories(
	data: ResearchDatabase,
): string[] {
	return Object.keys(data);
}

/**
 * Mengambil kategori sebagai option SLSelect.
 */
export function getResearchCategoryOptions(
	data: ResearchDatabase,
): ResearchSelectOption[] {
	return getResearchCategories(data).map((category) => ({
		value: category,
		label: category,
	}));
}

/**
 * Mengambil object kategori tertentu.
 */
export function getResearchCategoryData(
	data: ResearchDatabase,
	category: string,
): ResearchCategoryData | null {
	if (!category) {
		return null;
	}

	return data[category] ?? null;
}

/**
 * Mengambil seluruh nama research dari kategori tertentu.
 *
 * Contoh kategori Growth:
 * - Tooling Up
 * - Ward Expansion
 * - Camp Expansion
 * - Tool Enhancement
 */
export function getResearchNames(
	data: ResearchDatabase,
	category: string,
): string[] {
	const categoryData = getResearchCategoryData(data, category);

	if (!categoryData) {
		return [];
	}

	return Object.keys(categoryData);
}

/**
 * Mengambil nama research sebagai option SLSelect.
 */
export function getResearchNameOptions(
	data: ResearchDatabase,
	category: string,
): ResearchSelectOption[] {
	return getResearchNames(data, category).map((research) => ({
		value: research,
		label: research,
	}));
}

/**
 * Mengambil satu data research.
 */
export function getResearchItem(
	data: ResearchDatabase,
	category: string,
	research: string,
): ResearchItemData | null {
	const categoryData = getResearchCategoryData(data, category);

	if (!categoryData || !research) {
		return null;
	}

	return categoryData[research] ?? null;
}

/**
 * Mengambil seluruh tier dari satu research.
 *
 * Hasil otomatis diurutkan:
 * I, II, III, IV, V, VI, VII
 */
export function getResearchTiers(
	data: ResearchDatabase,
	category: string,
	research: string,
): string[] {
	const researchItem = getResearchItem(data, category, research);

	if (!researchItem) {
		return [];
	}

	return sortResearchTiers(Object.keys(researchItem.tiers));
}

/**
 * Mengambil tier sebagai option SLSelect.
 */
export function getResearchTierOptions(
	data: ResearchDatabase,
	category: string,
	research: string,
): ResearchSelectOption[] {
	return getResearchTiers(data, category, research).map((tier) => ({
		value: tier,
		label: `Tier ${tier}`,
	}));
}

/**
 * Mengambil daftar level pada tier tertentu.
 *
 * Hasil selalu diurutkan dari level terkecil.
 */
export function getResearchLevels(
	data: ResearchDatabase,
	category: string,
	research: string,
	tier: string,
): ResearchLevelData[] {
	const researchItem = getResearchItem(data, category, research);

	if (!researchItem || !tier) {
		return [];
	}

	const levels =
		researchItem.tiers[tier as ResearchTier] ?? [];

	return [...levels].sort(
		(firstLevel, secondLevel) =>
			Number(firstLevel.level) - Number(secondLevel.level),
	);
}

/**
 * Mengambil seluruh angka level pada tier tertentu.
 *
 * Contoh:
 * [1, 2, 3]
 */
export function getResearchLevelNumbers(
	data: ResearchDatabase,
	category: string,
	research: string,
	tier: string,
): number[] {
	return getResearchLevels(
		data,
		category,
		research,
		tier,
	).map((item) => Number(item.level));
}

/**
 * Mengambil level tertinggi pada tier.
 */
export function getResearchMaxLevel(
	data: ResearchDatabase,
	category: string,
	research: string,
	tier: string,
): number {
	const levelNumbers = getResearchLevelNumbers(
		data,
		category,
		research,
		tier,
	);

	if (levelNumbers.length === 0) {
		return 0;
	}

	return Math.max(...levelNumbers);
}

/**
 * Option untuk field From.
 *
 * Nilai 0 berarti belum mengambil level apa pun.
 *
 * Contoh jika tier memiliki Lv.1 sampai Lv.3:
 * - Lv.0
 * - Lv.1
 * - Lv.2
 *
 * Lv.3 tidak perlu ditampilkan karena tidak ada level tujuan
 * setelah Lv.3.
 */
export function getResearchFromLevelOptions(
	data: ResearchDatabase,
	category: string,
	research: string,
	tier: string,
): ResearchSelectOption[] {
	const levels = getResearchLevelNumbers(
		data,
		category,
		research,
		tier,
	);

	if (levels.length === 0) {
		return [];
	}

	const maxLevel = Math.max(...levels);

	return [
		{
			value: "0",
			label: "Lv. 0",
		},
		...levels
			.filter((level) => level < maxLevel)
			.map((level) => ({
				value: String(level),
				label: `Lv. ${level}`,
			})),
	];
}

/**
 * Option untuk field To.
 *
 * Hanya menampilkan level yang lebih besar dari From.
 */
export function getResearchToLevelOptions(
	data: ResearchDatabase,
	category: string,
	research: string,
	tier: string,
	fromLevel: string | number,
): ResearchSelectOption[] {
	const parsedFromLevel = Number(fromLevel);

	if (!Number.isFinite(parsedFromLevel)) {
		return [];
	}

	return getResearchLevelNumbers(
		data,
		category,
		research,
		tier,
	)
		.filter((level) => level > parsedFromLevel)
		.map((level) => ({
			value: String(level),
			label: `Lv. ${level}`,
		}));
}

/**
 * Mengambil satu level secara spesifik.
 */
export function getResearchLevel(
	data: ResearchDatabase,
	category: string,
	research: string,
	tier: string,
	level: string | number,
): ResearchLevelData | null {
	const parsedLevel = Number(level);

	if (!Number.isFinite(parsedLevel)) {
		return null;
	}

	const levels = getResearchLevels(
		data,
		category,
		research,
		tier,
	);

	return (
		levels.find(
			(item) => Number(item.level) === parsedLevel,
		) ?? null
	);
}

/**
 * Mengambil seluruh level yang harus dihitung.
 *
 * Contoh:
 * From Lv.0
 * To Lv.3
 *
 * Hasil:
 * Lv.1 + Lv.2 + Lv.3
 *
 * Contoh:
 * From Lv.1
 * To Lv.3
 *
 * Hasil:
 * Lv.2 + Lv.3
 */
export function getResearchLevelsInRange(
	data: ResearchDatabase,
	category: string,
	research: string,
	tier: string,
	fromLevel: string | number,
	toLevel: string | number,
): ResearchLevelData[] {
	const parsedFromLevel = Number(fromLevel);
	const parsedToLevel = Number(toLevel);

	if (
		!Number.isFinite(parsedFromLevel) ||
		!Number.isFinite(parsedToLevel) ||
		parsedToLevel <= parsedFromLevel
	) {
		return [];
	}

	return getResearchLevels(
		data,
		category,
		research,
		tier,
	).filter(
		(item) =>
			Number(item.level) > parsedFromLevel &&
			Number(item.level) <= parsedToLevel,
	);
}

/**
 * Memeriksa apakah pilihan form research valid.
 */
export function isValidResearchSelection(params: {
	data: ResearchDatabase;
	category: string;
	research: string;
	tier: string;
	fromLevel: string | number;
	toLevel: string | number;
}): boolean {
	const {
		data,
		category,
		research,
		tier,
		fromLevel,
		toLevel,
	} = params;

	if (!category || !research || !tier) {
		return false;
	}

	const parsedFromLevel = Number(fromLevel);
	const parsedToLevel = Number(toLevel);

	if (
		!Number.isFinite(parsedFromLevel) ||
		!Number.isFinite(parsedToLevel) ||
		parsedFromLevel < 0 ||
		parsedToLevel <= parsedFromLevel
	) {
		return false;
	}

	const availableLevels = getResearchLevelNumbers(
		data,
		category,
		research,
		tier,
	);

	if (availableLevels.length === 0) {
		return false;
	}

	const maxLevel = Math.max(...availableLevels);

	return (
		parsedFromLevel < maxLevel &&
		availableLevels.includes(parsedToLevel)
	);
}

/**
 * Mengubah nilai seperti:
 * - "10%"
 * - "+10%"
 * - "Lv.3"
 * - "10"
 *
 * menjadi number.
 *
 * Catatan:
 * Untuk pet level, helper ini hanya mengambil angkanya.
 * Mapping bonus pet tetap dilakukan di calculateResearch.ts.
 */
export function parseResearchNumber(
	value: unknown,
	fallback = 0,
): number {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : fallback;
	}

	if (typeof value !== "string") {
		return fallback;
	}

	const normalizedValue = value
		.trim()
		.replaceAll(",", ".")
		.replace(/[^\d.-]/g, "");

	if (!normalizedValue) {
		return fallback;
	}

	const parsedValue = Number(normalizedValue);

	return Number.isFinite(parsedValue)
		? parsedValue
		: fallback;
}

/**
 * Menghapus data duplikat dari array string.
 *
 * Berguna untuk mengumpulkan buff dan prerequisites.
 */
export function uniqueResearchStrings(
	values: Array<string | null | undefined>,
): string[] {
	return Array.from(
		new Set(
			values
				.map((value) => value?.trim() ?? "")
				.filter(Boolean),
		),
	);
}

/**
 * Menormalisasi nama resource dari Research.json agar
 * sesuai dengan key yang digunakan result calculator.
 */
export function normalizeResearchResourceKey(
	resourceKey: string,
): string {
	const normalizedKey = resourceKey
		.trim()
		.toLowerCase()
		.replaceAll("_", " ")
		.replaceAll("-", " ")
		.replace(/\s+/g, " ");

	const resourceMap: Record<string, string> = {
		meat: "Meat",
		wood: "Wood",
		coal: "Coal",
		iron: "Iron",
		steel: "Steel",
		crystal: "Crystal",
		"fire crystal": "Crystal",
		fc: "Crystal",
		rfc: "RFC",
		refined: "RFC",
		"refined fire crystal": "RFC",
	};

	return resourceMap[normalizedKey] ?? resourceKey;
}