"use client";

import {
	useCallback,
	useMemo,
	useState,
} from "react";

import {
	getFromLevelOptions,
	getToLevelOptions,
	isValidCharmSelection,
	sanitizeCharmFormValues,
} from "../calculator";
import type {
	CharmDataItem,
	CharmFormValues,
	ChiefCharmType,
} from "../type";
import {
	CHARM_TYPES,
	DEFAULT_CHARM_FORM_VALUES,
} from "../type";

type UseCharmFormProps = {
	data: CharmDataItem[];
	initialValues?: CharmFormValues;
};

function createInitialValues(
	data: CharmDataItem[],
	initialValues?: CharmFormValues,
): CharmFormValues {
	if (!initialValues) {
		return {
			...DEFAULT_CHARM_FORM_VALUES,
		};
	}

	return sanitizeCharmFormValues(
		data,
		initialValues,
	);
}

export default function useCharmForm({
	data,
	initialValues,
}: UseCharmFormProps) {
	const [values, setValues] =
		useState<CharmFormValues>(() =>
			createInitialValues(
				data,
				initialValues,
			),
		);

	const typeOptions = useMemo(
		() =>
			CHARM_TYPES.map((type) => ({
				value: type,
				label: type,
			})),
		[],
	);

	const valeriaOptions = useMemo(
		() =>
			Array.from(
				{ length: 11 },
				(_, level) => ({
					value: String(level),
					label: `Level ${level} (+${Math.min(
						level * 2,
						20,
					)}%)`,
				}),
			),
		[],
	);

	const fromLevelOptions = useMemo(
		() => getFromLevelOptions(data),
		[data],
	);

	const toLevelOptions = useMemo(
		() =>
			getToLevelOptions(
				data,
				values.fromLevel,
			),
		[data, values.fromLevel],
	);

	const isValid = useMemo(
		() =>
			Boolean(values.type) &&
			isValidCharmSelection(
				data,
				values,
			),
		[data, values],
	);

	const setType = useCallback(
		(type: ChiefCharmType | "") => {
			setValues((current) => ({
				...current,
				type,
			}));
		},
		[],
	);

	const setFromLevel = useCallback(
		(fromLevel: string) => {
			setValues((current) => ({
				...current,
				fromLevel,
				toLevel: "",
			}));
		},
		[],
	);

	const setToLevel = useCallback(
		(toLevel: string) => {
			setValues((current) => ({
				...current,
				toLevel,
			}));
		},
		[],
	);

	const setValeriaLevel = useCallback(
		(valeriaLevel: string) => {
			setValues((current) => ({
				...current,
				valeriaLevel,
			}));
		},
		[],
	);

	const loadFormValues = useCallback(
		(
			form:
				| CharmFormValues
				| null
				| undefined,
		) => {
			if (!form) {
				setValues({
					...DEFAULT_CHARM_FORM_VALUES,
				});

				return;
			}

			setValues(
				sanitizeCharmFormValues(
					data,
					form,
				),
			);
		},
		[data],
	);

	const resetForm = useCallback(() => {
		setValues({
			...DEFAULT_CHARM_FORM_VALUES,
		});
	}, []);

	return {
		values,

		type: values.type,
		fromLevel: values.fromLevel,
		toLevel: values.toLevel,
		valeriaLevel: values.valeriaLevel,

		typeOptions,
		fromLevelOptions,
		toLevelOptions,
		valeriaOptions,

		isValid,

		setType,
		setFromLevel,
		setToLevel,
		setValeriaLevel,

		loadFormValues,
		resetForm,
	};
}