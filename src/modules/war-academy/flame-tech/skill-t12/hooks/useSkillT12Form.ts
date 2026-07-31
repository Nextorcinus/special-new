"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
	getSkillT12ResearchOption,
	getSkillT12ResearchOptions,
} from "../calculator/helpers";

import type {
	SkillT12Category,
	SkillT12Database,
	SkillT12FormValues,
} from "../type";

type UseSkillT12FormProps = {
	category: SkillT12Category;
	data: SkillT12Database;
	initialValues?: Partial<SkillT12FormValues>;
};

const DEFAULT_VALUES: Omit<SkillT12FormValues, "category"> = {
	research: "",
	fromLevel: "0",
	toLevel: "",
};

export default function useSkillT12Form({
	category,
	data,
	initialValues,
}: UseSkillT12FormProps) {
	const [values, setValues] = useState<SkillT12FormValues>(() => ({
		category,
		research: initialValues?.research ?? DEFAULT_VALUES.research,
		fromLevel: initialValues?.fromLevel ?? DEFAULT_VALUES.fromLevel,
		toLevel: initialValues?.toLevel ?? DEFAULT_VALUES.toLevel,
	}));

	useEffect(() => {
		setValues((previous) => {
			if (previous.category === category) {
				return previous;
			}

			return {
				category,
				research: "",
				fromLevel: "0",
				toLevel: "",
			};
		});
	}, [category]);

	useEffect(() => {
		if (!initialValues) {
			return;
		}

		setValues({
			category: initialValues.category ?? category,
			research: initialValues.research ?? "",
			fromLevel: initialValues.fromLevel ?? "0",
			toLevel: initialValues.toLevel ?? "",
		});
	}, [category, initialValues]);

	const rawResearchOptions = useMemo(() => {
		return getSkillT12ResearchOptions(data, category);
	}, [category, data]);

	const researchOptions = useMemo(() => {
		return rawResearchOptions.map((option) => ({
			value: option.name,
			label: option.name,
		}));
	}, [rawResearchOptions]);

	const selectedResearch = useMemo(() => {
		return getSkillT12ResearchOption(data, values.category, values.research);
	}, [data, values.category, values.research]);

	const maxLevel = selectedResearch?.maxLevel ?? 0;

	const levelOptions = useMemo(() => {
		if (maxLevel <= 0) {
			return [];
		}

		return Array.from(
			{
				length: maxLevel + 1,
			},
			(_, index) => ({
				value: String(index),
				label: `Lv.${index}`,
			}),
		);
	}, [maxLevel]);

	const fromOptions = useMemo(() => {
		return levelOptions.filter((option) => Number(option.value) < maxLevel);
	}, [levelOptions, maxLevel]);

	const toOptions = useMemo(() => {
		const fromLevel = Number(values.fromLevel || 0);

		return levelOptions.filter((option) => Number(option.value) > fromLevel);
	}, [levelOptions, values.fromLevel]);

	const setField = useCallback(
		<K extends keyof SkillT12FormValues>(
			field: K,
			value: SkillT12FormValues[K],
		) => {
			setValues((previous) => ({
				...previous,
				[field]: value,
			}));
		},
		[],
	);

	const setResearch = useCallback((research: string) => {
		setValues((previous) => ({
			...previous,
			research,
			fromLevel: "0",
			toLevel: "",
		}));
	}, []);

	const setFromLevel = useCallback((fromLevel: string) => {
		setValues((previous) => {
			const currentToLevel = Number(previous.toLevel || 0);
			const nextFromLevel = Number(fromLevel || 0);

			return {
				...previous,
				fromLevel,
				toLevel: currentToLevel > nextFromLevel ? previous.toLevel : "",
			};
		});
	}, []);

	const setToLevel = useCallback((toLevel: string) => {
		setValues((previous) => ({
			...previous,
			toLevel,
		}));
	}, []);

	const reset = useCallback(() => {
		setValues({
			category,
			research: "",
			fromLevel: "0",
			toLevel: "",
		});
	}, [category]);

	const isValid = useMemo(() => {
		if (!values.research || !values.toLevel) {
			return false;
		}

		const fromLevel = Number(values.fromLevel);
		const toLevel = Number(values.toLevel);

		if (!Number.isFinite(fromLevel) || !Number.isFinite(toLevel)) {
			return false;
		}

		if (fromLevel < 0 || toLevel <= fromLevel) {
			return false;
		}

		if (!selectedResearch) {
			return false;
		}

		return toLevel <= selectedResearch.maxLevel;
	}, [selectedResearch, values.fromLevel, values.research, values.toLevel]);

	return {
		values,

		setValues,
		setField,
		setResearch,
		setFromLevel,
		setToLevel,
		reset,

		researchOptions,
		fromOptions,
		toOptions,

		selectedResearch,
		maxLevel,
		isValid,
	};
}
