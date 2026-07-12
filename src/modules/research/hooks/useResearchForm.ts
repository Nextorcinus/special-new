"use client";

import { useCallback, useMemo, useState } from "react";

import {
	getResearchFromLevelOptions,
	getResearchNameOptions,
	getResearchTierOptions,
	getResearchToLevelOptions,
} from "../calculator";
import type {
	ResearchCategory,
	ResearchDatabase,
	ResearchFormValues,
	ResearchSelectOption,
} from "../type";
import { DEFAULT_RESEARCH_FORM_VALUES } from "../type";

type UseResearchFormParams = {
	data: ResearchDatabase;
	category: ResearchCategory;
	initialValues?: Partial<ResearchFormValues>;
};

type SetResearchField = <Key extends keyof ResearchFormValues>(
	field: Key,
	value: ResearchFormValues[Key],
) => void;

type UseResearchFormReturn = {
	values: ResearchFormValues;

	researchOptions: ResearchSelectOption[];
	tierOptions: ResearchSelectOption[];
	fromLevelOptions: ResearchSelectOption[];
	toLevelOptions: ResearchSelectOption[];

	setField: SetResearchField;
	setResearch: (value: string) => void;
	setTier: (value: string) => void;
	setFromLevel: (value: string) => void;
	setToLevel: (value: string) => void;
	setResearchSpeed: (value: string) => void;
	setVpLevel: (value: string) => void;
	setAgnesLevel: (value: string) => void;
	setPresidentSkill: (value: boolean) => void;

	setValues: (
		values:
			| ResearchFormValues
			| Partial<ResearchFormValues>
			| ((
					currentValues: ResearchFormValues,
			  ) => ResearchFormValues),
	) => void;

	loadValues: (
		values: Partial<ResearchFormValues>,
	) => void;

	resetForm: () => void;

	isSelectionComplete: boolean;
};

function createInitialValues(
	category: ResearchCategory,
	initialValues?: Partial<ResearchFormValues>,
): ResearchFormValues {
	return {
		...DEFAULT_RESEARCH_FORM_VALUES,
		...initialValues,
		category,
	};
}

export default function useResearchForm({
	data,
	category,
	initialValues,
}: UseResearchFormParams): UseResearchFormReturn {
	const [values, setFormValues] =
		useState<ResearchFormValues>(() =>
			createInitialValues(
				category,
				initialValues,
			),
		);

	const researchOptions = useMemo(
		() =>
			getResearchNameOptions(
				data,
				category,
			),
		[data, category],
	);

	const tierOptions = useMemo(
		() =>
			getResearchTierOptions(
				data,
				category,
				values.research,
			),
		[data, category, values.research],
	);

	const fromLevelOptions = useMemo(
		() =>
			getResearchFromLevelOptions(
				data,
				category,
				values.research,
				values.tier,
			),
		[
			data,
			category,
			values.research,
			values.tier,
		],
	);

	const toLevelOptions = useMemo(
		() =>
			getResearchToLevelOptions(
				data,
				category,
				values.research,
				values.tier,
				values.fromLevel,
			),
		[
			data,
			category,
			values.research,
			values.tier,
			values.fromLevel,
		],
	);

	const setField = useCallback<SetResearchField>(
		(field, value) => {
			setFormValues((currentValues) => ({
				...currentValues,
				[field]: value,
				category,
			}));
		},
		[category],
	);

	const setResearch = useCallback(
		(value: string) => {
			setFormValues((currentValues) => ({
				...currentValues,
				category,
				research: value,
				tier: "",
				fromLevel: "0",
				toLevel: "",
			}));
		},
		[category],
	);

	const setTier = useCallback(
		(value: string) => {
			setFormValues((currentValues) => ({
				...currentValues,
				category,
				tier: value,
				fromLevel: "0",
				toLevel: "",
			}));
		},
		[category],
	);

	const setFromLevel = useCallback(
		(value: string) => {
			setFormValues((currentValues) => ({
				...currentValues,
				category,
				fromLevel: value,
				toLevel: "",
			}));
		},
		[category],
	);

	const setToLevel = useCallback(
		(value: string) => {
			setField("toLevel", value);
		},
		[setField],
	);

	const setResearchSpeed = useCallback(
		(value: string) => {
			setField("researchSpeed", value);
		},
		[setField],
	);

	const setVpLevel = useCallback(
		(value: string) => {
			setField("vpLevel", value);
		},
		[setField],
	);

	const setAgnesLevel = useCallback(
		(value: string) => {
			setField("agnesLevel", value);
		},
		[setField],
	);

	const setPresidentSkill = useCallback(
		(value: boolean) => {
			setField("presidentSkill", value);
		},
		[setField],
	);

	const setValues = useCallback<
		UseResearchFormReturn["setValues"]
	>(
		(nextValues) => {
			if (typeof nextValues === "function") {
				setFormValues((currentValues) => ({
					...nextValues(currentValues),
					category,
				}));

				return;
			}

			setFormValues((currentValues) => ({
				...currentValues,
				...nextValues,
				category,
			}));
		},
		[category],
	);

	const loadValues = useCallback(
		(
			nextValues: Partial<ResearchFormValues>,
		) => {
			setFormValues({
				...DEFAULT_RESEARCH_FORM_VALUES,
				...nextValues,
				category,
			});
		},
		[category],
	);

	const resetForm = useCallback(() => {
		setFormValues(
			createInitialValues(
				category,
				initialValues,
			),
		);
	}, [category, initialValues]);

	const isSelectionComplete = useMemo(() => {
		if (
			!category ||
			!values.research ||
			!values.tier ||
			values.fromLevel === "" ||
			values.toLevel === ""
		) {
			return false;
		}

		const fromLevel = Number(values.fromLevel);
		const toLevel = Number(values.toLevel);

		return (
			Number.isFinite(fromLevel) &&
			Number.isFinite(toLevel) &&
			toLevel > fromLevel
		);
	}, [
		category,
		values.research,
		values.tier,
		values.fromLevel,
		values.toLevel,
	]);

	return {
		values,

		researchOptions,
		tierOptions,
		fromLevelOptions,
		toLevelOptions,

		setField,
		setResearch,
		setTier,
		setFromLevel,
		setToLevel,
		setResearchSpeed,
		setVpLevel,
		setAgnesLevel,
		setPresidentSkill,

		setValues,
		loadValues,
		resetForm,

		isSelectionComplete,
	};
}