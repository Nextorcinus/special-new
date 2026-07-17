"use client";

import { useCallback, useMemo, useState } from "react";

import {
	getPetLevelOptions,
	getPetTargetLevelOptions,
	validatePetLevelRange,
} from "../calculator/helpers";
import type { PetData, PetFormValues, PetValidationErrors } from "../type";
import { DEFAULT_PET_FORM_VALUES } from "../type";

type UsePetFormParams = {
	pet: PetData;
	initialValues?: Partial<PetFormValues>;
};

function normalizeValues(
	pet: PetData,
	values?: Partial<PetFormValues>,
): PetFormValues {
	const mergedValues: PetFormValues = {
		...DEFAULT_PET_FORM_VALUES,
		...values,
		petId: pet.id,
	};

	const fromLevel = Math.min(
		Math.max(Math.trunc(Number(mergedValues.fromLevel) || 0), 0),
		Math.max(pet.maxLevel - 1, 0),
	);

	const toLevel = Math.min(
		Math.max(Math.trunc(Number(mergedValues.toLevel) || 1), fromLevel + 1),
		pet.maxLevel,
	);

	const valeriaLevel = Math.min(
		Math.max(Math.trunc(Number(mergedValues.valeriaLevel) || 0), 0),
		10,
	);

	return {
		petId: pet.id,
		fromLevel,
		toLevel,
		valeriaLevel,
	};
}

export default function usePetForm({ pet, initialValues }: UsePetFormParams) {
	const [values, setValues] = useState<PetFormValues>(() =>
		normalizeValues(pet, initialValues),
	);

	const [errors, setErrors] = useState<PetValidationErrors>({});

	const fromLevelOptions = useMemo(() => {
		return getPetLevelOptions(Math.max(pet.maxLevel - 1, 0));
	}, [pet.maxLevel]);

	const toLevelOptions = useMemo(() => {
		return getPetTargetLevelOptions(values.fromLevel, pet.maxLevel);
	}, [pet.maxLevel, values.fromLevel]);

	const valeriaOptions = useMemo(() => {
		return Array.from({ length: 11 }, (_, level) => ({
			value: String(level),
			label: level === 0 ? "Off" : `Lv.${level} · +${level * 2}%`,
		}));
	}, []);

	const setField = useCallback(
		<K extends keyof PetFormValues>(field: K, value: PetFormValues[K]) => {
			setValues((current) => ({
				...current,
				[field]: value,
			}));

			setErrors((current) => {
				if (!current[field]) {
					return current;
				}

				const nextErrors = { ...current };

				delete nextErrors[field];

				return nextErrors;
			});
		},
		[],
	);

	const setFromLevel = useCallback(
		(value: string | number) => {
			const parsedValue = Number(value);

			if (!Number.isFinite(parsedValue)) {
				return;
			}

			const safeFromLevel = Math.min(
				Math.max(Math.trunc(parsedValue), 0),
				Math.max(pet.maxLevel - 1, 0),
			);

			setValues((current) => ({
				...current,
				petId: pet.id,
				fromLevel: safeFromLevel,
				toLevel:
					current.toLevel <= safeFromLevel
						? Math.min(safeFromLevel + 1, pet.maxLevel)
						: Math.min(current.toLevel, pet.maxLevel),
			}));

			setErrors((current) => {
				const nextErrors = { ...current };

				delete nextErrors.fromLevel;
				delete nextErrors.toLevel;

				return nextErrors;
			});
		},
		[pet.id, pet.maxLevel],
	);

	const setToLevel = useCallback(
		(value: string | number) => {
			const parsedValue = Number(value);

			if (!Number.isFinite(parsedValue)) {
				return;
			}

			setValues((current) => {
				const safeToLevel = Math.min(
					Math.max(Math.trunc(parsedValue), current.fromLevel + 1),
					pet.maxLevel,
				);

				return {
					...current,
					petId: pet.id,
					toLevel: safeToLevel,
				};
			});

			setErrors((current) => {
				if (!current.toLevel) {
					return current;
				}

				const nextErrors = { ...current };

				delete nextErrors.toLevel;

				return nextErrors;
			});
		},
		[pet.id, pet.maxLevel],
	);

	const setValeriaLevel = useCallback(
		(value: string | number) => {
			const parsedValue = Number(value);

			if (!Number.isFinite(parsedValue)) {
				return;
			}

			setField(
				"valeriaLevel",
				Math.min(Math.max(Math.trunc(parsedValue), 0), 10),
			);
		},
		[setField],
	);

	const validate = useCallback((): boolean => {
		const nextErrors: PetValidationErrors = {};

		const levelError = validatePetLevelRange(
			pet,
			values.fromLevel,
			values.toLevel,
		);

		if (levelError) {
			if (values.toLevel <= values.fromLevel || values.toLevel > pet.maxLevel) {
				nextErrors.toLevel = levelError;
			} else {
				nextErrors.fromLevel = levelError;
			}
		}

		if (values.valeriaLevel < 0 || values.valeriaLevel > 10) {
			nextErrors.valeriaLevel = "Valeria level must be between 0 and 10.";
		}

		setErrors(nextErrors);

		return Object.keys(nextErrors).length === 0;
	}, [pet, values]);

	const loadValues = useCallback(
		(nextValues: Partial<PetFormValues>) => {
			setValues(normalizeValues(pet, nextValues));
			setErrors({});
		},
		[pet],
	);

	const resetForm = useCallback(() => {
		setValues(normalizeValues(pet, initialValues));
		setErrors({});
	}, [initialValues, pet]);

	const isSelectionComplete =
		values.petId === pet.id &&
		values.fromLevel >= 0 &&
		values.fromLevel < pet.maxLevel &&
		values.toLevel > values.fromLevel &&
		values.toLevel <= pet.maxLevel;

	return {
		values,
		errors,

		fromLevelOptions,
		toLevelOptions,
		valeriaOptions,

		isSelectionComplete,

		setField,
		setFromLevel,
		setToLevel,
		setValeriaLevel,

		validate,
		loadValues,
		resetForm,
	};
}
