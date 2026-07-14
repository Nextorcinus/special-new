import type {
	CalculateWidgetParams,
	WidgetCalculationResult,
	WidgetLevelData,
} from "../type";

const LEVEL_DATA: WidgetLevelData[] = [
	{
		level: 1,
		required: 5,
		value: 5,
		type: "exploration",
	},
	{
		level: 2,
		required: 10,
		value: 5,
		type: "expedition",
	},
	{
		level: 3,
		required: 15,
		value: 7.5,
		type: "exploration",
	},
	{
		level: 4,
		required: 20,
		value: 7.5,
		type: "expedition",
	},
	{
		level: 5,
		required: 25,
		value: 10,
		type: "exploration",
	},
	{
		level: 6,
		required: 30,
		value: 10,
		type: "expedition",
	},
	{
		level: 7,
		required: 35,
		value: 12.5,
		type: "exploration",
	},
	{
		level: 8,
		required: 40,
		value: 12.5,
		type: "expedition",
	},
	{
		level: 9,
		required: 45,
		value: 15,
		type: "exploration",
	},
	{
		level: 10,
		required: 50,
		value: 15,
		type: "exploration",
	},
];

function getTotalRequired(fromLevel: number, toLevel: number): number {
	return LEVEL_DATA.filter(
		(item) => item.level > fromLevel && item.level <= toLevel,
	).reduce((total, item) => total + item.required, 0);
}

export function calculateWidget({
	data,
	values,
}: CalculateWidgetParams): WidgetCalculationResult {
	const hero = data.find((item) => item.id === values.heroId);

	if (!hero) {
		throw new Error("Hero widget not found.");
	}

	if (values.fromLevel === "" || values.toLevel === "") {
		throw new Error("Please select the starting and target levels.");
	}

	const fromLevel = Number(values.fromLevel);
	const toLevel = Number(values.toLevel);

	if (
		!Number.isFinite(fromLevel) ||
		!Number.isFinite(toLevel) ||
		fromLevel < 0 ||
		toLevel > 10 ||
		toLevel <= fromLevel
	) {
		throw new Error("Target level must be higher than starting level.");
	}

	const targetLevel = LEVEL_DATA.find((item) => item.level === toLevel);

	if (!targetLevel) {
		throw new Error("Target widget level data not found.");
	}

	const skill =
		targetLevel.type === "exploration" ? hero.exploration : hero.expedition;

	const totalRequired = getTotalRequired(fromLevel, toLevel);

	return {
		heroId: hero.id,
		heroName: hero.name,
		generation: hero.generation,
		status: hero.status,

		fromLevel,
		toLevel,

		level: targetLevel.level,
		type: targetLevel.type,
		value: targetLevel.value,
		skill,

		totalRequired,

		resources: {
			WidgetStone: totalRequired,
		},

		powerIncrease: 0,
		svsPoints: 0,
	};
}
