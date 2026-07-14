"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { WidgetDatabaseItem, WidgetFormValues } from "../type";

type UseWidgetFormParams = {
	data: WidgetDatabaseItem[];
	initialValues?: Partial<WidgetFormValues>;
};

const DEFAULT_VALUES: WidgetFormValues = {
	heroId: "",
	fromLevel: "",
	toLevel: "",
};

const LEVEL_OPTIONS = Array.from({ length: 11 }, (_, index) => ({
	value: String(index),
	label: `Lv. ${index}`,
}));

export default function useWidgetForm({
	data,
	initialValues,
}: UseWidgetFormParams) {
	const [values, setValues] = useState<WidgetFormValues>({
		...DEFAULT_VALUES,
		...initialValues,
	});

	const [errors, setErrors] = useState<
		Partial<Record<keyof WidgetFormValues, string>>
	>({});

	const selectedHero = useMemo(() => {
		return data.find((hero) => hero.id === values.heroId);
	}, [data, values.heroId]);

	const fromLevelOptions = useMemo(() => {
		return LEVEL_OPTIONS.filter((option) => Number(option.value) < 10);
	}, []);

	const toLevelOptions = useMemo(() => {
		if (values.fromLevel === "") {
			return [];
		}

		const fromLevel = Number(values.fromLevel);

		return LEVEL_OPTIONS.filter((option) => Number(option.value) > fromLevel);
	}, [values.fromLevel]);

	const setField = useCallback(
		<K extends keyof WidgetFormValues>(
			field: K,
			value: WidgetFormValues[K],
		) => {
			setValues((current) => ({
				...current,
				[field]: value,
			}));

			setErrors((current) => ({
				...current,
				[field]: undefined,
			}));
		},
		[],
	);

	const selectHero = useCallback((heroId: string) => {
		setValues((current) => ({
			...current,
			heroId,
		}));

		setErrors((current) => ({
			...current,
			heroId: undefined,
		}));
	}, []);

	const selectFromLevel = useCallback((fromLevel: string) => {
		setValues((current) => ({
			...current,
			fromLevel,
			toLevel: "",
		}));

		setErrors((current) => ({
			...current,
			fromLevel: undefined,
			toLevel: undefined,
		}));
	}, []);

	const validate = useCallback(() => {
		const nextErrors: Partial<Record<keyof WidgetFormValues, string>> = {};

		if (!values.heroId) {
			nextErrors.heroId = "Please select a hero.";
		}

		if (values.fromLevel === "") {
			nextErrors.fromLevel = "Please select the starting level.";
		}

		if (values.toLevel === "") {
			nextErrors.toLevel = "Please select the target level.";
		}

		if (
			values.fromLevel !== "" &&
			values.toLevel !== "" &&
			Number(values.toLevel) <= Number(values.fromLevel)
		) {
			nextErrors.toLevel = "Target level must be higher than starting level.";
		}

		setErrors(nextErrors);

		return Object.keys(nextErrors).length === 0;
	}, [values]);

	const reset = useCallback(() => {
		setValues({
			...DEFAULT_VALUES,
			...initialValues,
		});

		setErrors({});
	}, [initialValues]);

	useEffect(() => {
		if (!initialValues) {
			return;
		}

		setValues({
			...DEFAULT_VALUES,
			...initialValues,
		});
	}, [initialValues]);

	return {
		values,
		errors,
		selectedHero,
		fromLevelOptions,
		toLevelOptions,
		setField,
		selectHero,
		selectFromLevel,
		validate,
		reset,
	};
}
