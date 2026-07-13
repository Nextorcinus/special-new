"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
	getWarAcademyFromLevelOptions,
	getWarAcademyResearchNames,
	getWarAcademyToLevelOptions,
} from "../calculator";
import type {
	WarAcademyCategory,
	WarAcademyDatabase,
	WarAcademyFormValues,
} from "../type";

type UseWarAcademyFormParams = {
	category: WarAcademyCategory;
	data: WarAcademyDatabase;
	initialValues?: Partial<WarAcademyFormValues>;
	onSubmit: (values: WarAcademyFormValues) => void;
	onReset?: () => void;
};

const DEFAULT_VALUES: WarAcademyFormValues = {
	research: "",
	fromLevel: "",
	toLevel: "",

	vpLevel: "Off",
	agnesLevel: "0",
	researchSpeed: "",
	doubleTime: false,
};

function createInitialValues(
	initialValues?: Partial<WarAcademyFormValues>,
): WarAcademyFormValues {
	return {
		...DEFAULT_VALUES,
		...initialValues,
	};
}

export default function useWarAcademyForm({
	category,
	data,
	initialValues,
	onSubmit,
	onReset,
}: UseWarAcademyFormParams) {
	const [values, setValues] = useState<WarAcademyFormValues>(() =>
		createInitialValues(initialValues),
	);

	useEffect(() => {
		setValues(createInitialValues(initialValues));
	}, [initialValues]);

	const researchOptions = useMemo(() => {
		return getWarAcademyResearchNames(data, category).map((research) => ({
			value: research,
			label: research,
		}));
	}, [category, data]);

	const fromLevelOptions = useMemo(() => {
		if (!values.research) {
			return [];
		}

		return getWarAcademyFromLevelOptions(data, category, values.research).map(
			(level) => ({
				value: String(level),
				label: `Lv.${level}`,
			}),
		);
	}, [category, data, values.research]);

	const toLevelOptions = useMemo(() => {
		if (!values.research || values.fromLevel === "") {
			return [];
		}

		return getWarAcademyToLevelOptions(
			data,
			category,
			values.research,
			values.fromLevel,
		).map((level) => ({
			value: String(level),
			label: `Lv.${level}`,
		}));
	}, [category, data, values.fromLevel, values.research]);

	const setField = useCallback(
		<K extends keyof WarAcademyFormValues>(
			field: K,
			value: WarAcademyFormValues[K],
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
			fromLevel: "",
			toLevel: "",
		}));
	}, []);

	const setFromLevel = useCallback((fromLevel: string) => {
		setValues((current) => ({
			...current,
			fromLevel,
			toLevel: "",
		}));
	}, []);

	const reset = useCallback(() => {
		setValues(DEFAULT_VALUES);
		onReset?.();
	}, [onReset]);

	const submit = useCallback(() => {
		onSubmit(values);
	}, [onSubmit, values]);

	const canSubmit =
		values.research !== "" && values.fromLevel !== "" && values.toLevel !== "";

	return {
		values,

		researchOptions,
		fromLevelOptions,
		toLevelOptions,

		canSubmit,

		setField,
		setResearch,
		setFromLevel,
		submit,
		reset,
	};
}
