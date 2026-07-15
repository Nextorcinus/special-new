"use client";

import { useCallback, useMemo, useState } from "react";

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

function createFormValues(
	initialValues?: Partial<WidgetFormValues>,
): WidgetFormValues {
	return {
		...DEFAULT_VALUES,
		...initialValues,
	};
}

export default function useWidgetForm({
	data,
	initialValues,
}: UseWidgetFormParams) {
	const [values, setValues] = useState<WidgetFormValues>(() =>
		createFormValues(initialValues),
	);

	const selectedHero = useMemo(() => {
		return data.find((hero) => hero.id === values.heroId);
	}, [data, values.heroId]);

	const heroOptions = useMemo(() => {
		return [...data]
			.sort((a, b) => {
				if (a.generation !== b.generation) {
					return b.generation - a.generation;
				}

				return a.name.localeCompare(b.name);
			})
			.map((hero) => ({
				value: hero.id,
				label: `GEN ${hero.generation} · ${hero.name}`,
			}));
	}, [data]);

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

	const setHero = useCallback((heroId: string) => {
		setValues((current) => ({
			...current,
			heroId,
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

	const setToLevel = useCallback((toLevel: string) => {
		setValues((current) => ({
			...current,
			toLevel,
		}));
	}, []);

	const loadValues = useCallback((nextValues?: Partial<WidgetFormValues>) => {
		setValues(createFormValues(nextValues));
	}, []);

	const resetForm = useCallback(() => {
		setValues({
			...DEFAULT_VALUES,
		});
	}, []);

	const isSelectionComplete = useMemo(() => {
		if (!values.heroId) {
			return false;
		}

		if (values.fromLevel === "") {
			return false;
		}

		if (values.toLevel === "") {
			return false;
		}

		const fromLevel = Number(values.fromLevel);

		const toLevel = Number(values.toLevel);

		return (
			Number.isFinite(fromLevel) &&
			Number.isFinite(toLevel) &&
			fromLevel >= 0 &&
			toLevel <= 10 &&
			toLevel > fromLevel
		);
	}, [values]);

	return {
		values,
		selectedHero,

		heroOptions,
		fromLevelOptions,
		toLevelOptions,

		setHero,
		setFromLevel,
		setToLevel,

		loadValues,
		resetForm,

		isSelectionComplete,
	};
}
