"use client";

import { useCallback, useMemo, useState } from "react";

import {
	getFromLevelOptions,
	getToLevelOptions,
	isValidGearSelection,
	sanitizeGearFormValues,
} from "@/modules/gear/calculator";
import type {
	ChiefGearType,
	GearDataItem,
	GearFormValues,
} from "../type";
import { DEFAULT_GEAR_FORM_VALUES } from "../type";

type UseGearFormProps = {
	data: GearDataItem[];
	initialValues?: Partial<GearFormValues>;
};

type SetGearFormValue = <Key extends keyof GearFormValues>(
	key: Key,
	value: GearFormValues[Key],
) => void;

function createInitialValues(
	data: GearDataItem[],
	initialValues?: Partial<GearFormValues>,
): GearFormValues {
	const values: GearFormValues = {
		...DEFAULT_GEAR_FORM_VALUES,
		...initialValues,
	};

	return sanitizeGearFormValues(data, values);
}

export default function useGearForm({
	data,
	initialValues,
}: UseGearFormProps) {
	const [values, setValues] = useState<GearFormValues>(() =>
		createInitialValues(data, initialValues),
	);

	const fromLevelOptions = useMemo(() => {
		return getFromLevelOptions(data, values.gear);
	}, [data, values.gear]);

	const toLevelOptions = useMemo(() => {
		return getToLevelOptions(
			data,
			values.gear,
			values.fromLevel,
		);
	}, [data, values.gear, values.fromLevel]);

	const isValid = useMemo(() => {
		return isValidGearSelection(data, values);
	}, [data, values]);

	const setValue: SetGearFormValue = useCallback((key, value) => {
		setValues((currentValues) => ({
			...currentValues,
			[key]: value,
		}));
	}, []);

	const setGear = useCallback((gear: ChiefGearType | "") => {
		setValues({
			gear,
			fromLevel: "",
			toLevel: "",
		});
	}, []);

	const setFromLevel = useCallback((fromLevel: string) => {
		setValues((currentValues) => ({
			...currentValues,
			fromLevel,
			toLevel: "",
		}));
	}, []);

	const setToLevel = useCallback((toLevel: string) => {
		setValues((currentValues) => ({
			...currentValues,
			toLevel,
		}));
	}, []);

	const setFormValues = useCallback(
		(nextValues: GearFormValues) => {
			setValues(sanitizeGearFormValues(data, nextValues));
		},
		[data],
	);

	const loadFormValues = useCallback(
		(nextValues?: Partial<GearFormValues> | null) => {
			if (!nextValues) {
				setValues({ ...DEFAULT_GEAR_FORM_VALUES });
				return;
			}

			const completeValues: GearFormValues = {
				...DEFAULT_GEAR_FORM_VALUES,
				...nextValues,
			};

			setValues(sanitizeGearFormValues(data, completeValues));
		},
		[data],
	);

	const resetForm = useCallback(() => {
		setValues({ ...DEFAULT_GEAR_FORM_VALUES });
	}, []);

	return {
		values,

		gear: values.gear,
		fromLevel: values.fromLevel,
		toLevel: values.toLevel,

		fromLevelOptions,
		toLevelOptions,

		isValid,

		setValues: setFormValues,
		setValue,

		setGear,
		setFromLevel,
		setToLevel,

		loadFormValues,
		resetForm,
	};
}

export type UseGearFormReturn = ReturnType<typeof useGearForm>;