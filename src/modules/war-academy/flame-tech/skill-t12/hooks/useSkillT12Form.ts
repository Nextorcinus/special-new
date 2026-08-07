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

	researchSpeed: "0",
	vpLevel: "0",
	agnesLevel: "0",
	presidentSkill: false,
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

		researchSpeed: initialValues?.researchSpeed ?? DEFAULT_VALUES.researchSpeed,

		vpLevel: initialValues?.vpLevel ?? DEFAULT_VALUES.vpLevel,

		agnesLevel: initialValues?.agnesLevel ?? DEFAULT_VALUES.agnesLevel,

		presidentSkill:
			initialValues?.presidentSkill ?? DEFAULT_VALUES.presidentSkill,
	}));

	useEffect(() => {
		setValues((previous) => ({
			...previous,
			category,
		}));
	}, [category]);

	useEffect(() => {
		if (!initialValues) {
			return;
		}

		setValues({
			category: initialValues.category ?? category,

			research: initialValues.research ?? DEFAULT_VALUES.research,

			fromLevel: initialValues.fromLevel ?? DEFAULT_VALUES.fromLevel,

			toLevel: initialValues.toLevel ?? DEFAULT_VALUES.toLevel,

			researchSpeed:
				initialValues.researchSpeed ?? DEFAULT_VALUES.researchSpeed,

			vpLevel: initialValues.vpLevel ?? DEFAULT_VALUES.vpLevel,

			agnesLevel: initialValues.agnesLevel ?? DEFAULT_VALUES.agnesLevel,

			presidentSkill:
				initialValues.presidentSkill ?? DEFAULT_VALUES.presidentSkill,
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
		const fromLevel = Number(values.fromLevel);

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

			...DEFAULT_VALUES,
		});
	}, [category]);

	const isValid = useMemo(() => {
		if (!values.research || !values.toLevel) {
			return false;
		}

		const from = Number(values.fromLevel);

		const to = Number(values.toLevel);

		if (!Number.isFinite(from) || !Number.isFinite(to)) {
			return false;
		}

		if (to <= from) {
			return false;
		}

		if (!selectedResearch) {
			return false;
		}

		return to <= selectedResearch.maxLevel;
	}, [selectedResearch, values.fromLevel, values.toLevel, values.research]);

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
