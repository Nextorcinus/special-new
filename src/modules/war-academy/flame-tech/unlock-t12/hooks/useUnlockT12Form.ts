"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
	getUnlockT12Levels,
	getUnlockT12ResearchList,
} from "../calculator/helpers";

import type {
	UnlockT12Category,
	UnlockT12Database,
	UnlockT12FormValues,
} from "../type";

type UseUnlockT12FormParams = {
	category: UnlockT12Category;
	data: UnlockT12Database;
	initialValues?: Partial<UnlockT12FormValues>;
};

function createDefaultValues(
	category: UnlockT12Category,
	research = "",
	fromLevel = "0",
	toLevel = "",
): UnlockT12FormValues {
	return {
		category,
		research,
		fromLevel,
		toLevel,
	};
}

export default function useUnlockT12Form({
	category,
	data,
	initialValues,
}: UseUnlockT12FormParams) {
	/*
	 * Ubah initialValues menjadi primitive values.
	 *
	 * Dengan begitu useEffect tidak menangkap seluruh object
	 * initialValues dan dependency Biome menjadi tepat.
	 */
	const initialResearch = initialValues?.research ?? "";
	const initialFromLevel = initialValues?.fromLevel ?? "0";
	const initialToLevel = initialValues?.toLevel ?? "";

	const [values, setValues] = useState<UnlockT12FormValues>(() =>
		createDefaultValues(
			category,
			initialResearch,
			initialFromLevel,
			initialToLevel,
		),
	);

	useEffect(() => {
		setValues(
			createDefaultValues(
				category,
				initialResearch,
				initialFromLevel,
				initialToLevel,
			),
		);
	}, [category, initialResearch, initialFromLevel, initialToLevel]);

	const researchList = useMemo(
		() => getUnlockT12ResearchList(data, category),
		[data, category],
	);

	const selectedLevels = useMemo(
		() => getUnlockT12Levels(data, category, values.research),
		[data, category, values.research],
	);

	const researchOptions = useMemo(
		() =>
			researchList.map((research) => ({
				value: research,
				label: research,
			})),
		[researchList],
	);

	const fromLevelOptions = useMemo(() => {
		const levels = selectedLevels.map((item) => Number(item.level));

		return [
			{
				value: "0",
				label: "Lv.0",
			},
			...levels.slice(0, -1).map((level) => ({
				value: String(level),
				label: `Lv.${level}`,
			})),
		];
	}, [selectedLevels]);

	const toLevelOptions = useMemo(() => {
		const fromLevel = Number(values.fromLevel);

		return selectedLevels
			.filter((item) => Number(item.level) > fromLevel)
			.map((item) => ({
				value: String(item.level),
				label: `Lv.${item.level}`,
			}));
	}, [selectedLevels, values.fromLevel]);

	const setField = useCallback(
		<K extends keyof UnlockT12FormValues>(
			field: K,
			value: UnlockT12FormValues[K],
		) => {
			setValues((current) => ({
				...current,
				[field]: value,
			}));
		},
		[],
	);

	const setResearch = useCallback((research: string) => {
		setValues((current) => ({
			...current,
			research,
			fromLevel: "0",
			toLevel: "",
		}));
	}, []);

	const setFromLevel = useCallback((fromLevel: string) => {
		setValues((current) => {
			const currentToLevel = Number(current.toLevel);

			const nextFromLevel = Number(fromLevel);

			return {
				...current,
				fromLevel,
				toLevel: currentToLevel > nextFromLevel ? current.toLevel : "",
			};
		});
	}, []);

	const setToLevel = useCallback(
		(toLevel: string) => {
			setField("toLevel", toLevel);
		},
		[setField],
	);

	const reset = useCallback(() => {
		setValues(createDefaultValues(category));
	}, [category]);

	const isComplete =
		Boolean(values.research) &&
		values.fromLevel !== "" &&
		values.toLevel !== "" &&
		Number(values.toLevel) > Number(values.fromLevel);

	return {
		values,
		setValues,
		setField,

		setResearch,
		setFromLevel,
		setToLevel,

		researchOptions,
		fromLevelOptions,
		toLevelOptions,

		isComplete,
		reset,
	};
}
