import { useMemo, useState } from "react";
import {
	getBuildingOptions,
	getFilteredToLevels,
	getLevelOptions,
} from "../calculator/buildingHelpers";
import type { BuildingType } from "../types";

export function useBuildingForm(type: BuildingType) {
	const buildingOptions = useMemo(
		() => getBuildingOptions(type),
		[type],
	);

	const [form, setForm] = useState({
		building: buildingOptions[0] ?? "",
		fromLevel: "",
		toLevel: "",

		petLevel: "Off",
		vpLevel: "Off",
		zinmanSkill: "Off",
		agnesSkill: "Off",

		constructionSpeed: "",

		valeriaLevel: "0",

		doubleTime: false,
	});

	const levelOptions = useMemo(
		() => getLevelOptions(type, form.building),
		[type, form.building],
	);

	const filteredToLevels = useMemo(
		() =>
			getFilteredToLevels(
				levelOptions,
				form.fromLevel,
			),
		[levelOptions, form.fromLevel],
	);

	function update<K extends keyof typeof form>(
		key: K,
		value: (typeof form)[K],
	) {
		setForm((prev) => ({
			...prev,
			[key]: value,
		}));
	}

	function reset() {
		setForm({
			building: buildingOptions[0] ?? "",
			fromLevel: "",
			toLevel: "",
			petLevel: "Off",
			vpLevel: "Off",
			zinmanSkill: "Off",
			agnesSkill: "Off",
			constructionSpeed: "",
			valeriaLevel: "0",
			doubleTime: false,
		});
	}

	return {
		form,

		update,

		reset,

		buildingOptions,

		levelOptions,

		filteredToLevels,
	};
}