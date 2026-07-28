import type {
	UnlockT12CalculationResult,
	UnlockT12Database,
	UnlockT12FormValues,
} from "../type";

import {
	calculateUnlockT12Attributes,
	getUnlockT12Levels,
	getUnlockT12LevelsInRange,
	isValidUnlockT12Selection,
	sumUnlockT12Power,
	sumUnlockT12Resources,
} from "./helpers";

type CalculateUnlockT12Params = {
	data: UnlockT12Database;
	values: UnlockT12FormValues;
};

export default function calculateUnlockT12({
	data,
	values,
}: CalculateUnlockT12Params): UnlockT12CalculationResult {
	const { category, research, fromLevel, toLevel } = values;

	if (!isValidUnlockT12Selection(values)) {
		return {
			category,
			research,
			fromLevel,
			toLevel,
			selectedLevels: [],
			resources: {
				Steel: 0,
				RFC: 0,
				Shard: 0,
			},
			power: 0,
			attributes: [],
		};
	}

	const levels = getUnlockT12Levels(data, category, research);

	const selectedLevels = getUnlockT12LevelsInRange(levels, fromLevel, toLevel);

	return {
		category,
		research,
		fromLevel,
		toLevel,
		selectedLevels,

		resources: sumUnlockT12Resources(selectedLevels),

		power: sumUnlockT12Power(selectedLevels),

		attributes: calculateUnlockT12Attributes(levels, fromLevel, toLevel),
	};
}
