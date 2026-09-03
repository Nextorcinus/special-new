"use client";

import {
	useEffect,
	useMemo,
	useState,
} from "react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLLabel from "@/components/ui/sl-ui/SLLabel";
import SLSelect from "@/components/ui/sl-ui/SLSelect";

import { toast } from "@/lib/toast";

import {
	CHIEF_GEAR_LABELS,
	CHIEF_GEAR_TYPES,
	calculateGear,
} from "@/modules/gear/calculator";

import { useTutorial } from "@/features/tutorial";

import useGearForm from "@/modules/gear/hooks/useGearForm";

import type {
	ChiefGearType,
	GearCalculationResult,
	GearData,
	GearFormValues,
} from "@/modules/gear/type";

type GearFormMode =
	| "create"
	| "update";

type GearFormProps = {
	data: GearData;
	initialValues?: GearFormValues | null;
	mode?: GearFormMode;
	lockMainFields?: boolean;
	onCalculate: (
		result: GearCalculationResult,
	) => void;
};

export default function GearForm({
	data,
	initialValues,
	mode = "create",
	lockMainFields = false,
	onCalculate,
}: GearFormProps) {
	const tutorial = useTutorial();

	const [error, setError] =
		useState<string | null>(null);

	const [
		isMainFieldsLocked,
		setIsMainFieldsLocked,
	] = useState(
		Boolean(lockMainFields),
	);

	const {
		values,
		gear,
		fromLevel,
		toLevel,
		fromLevelOptions,
		toLevelOptions,
		isValid,
		setGear,
		setFromLevel,
		setToLevel,
		loadFormValues,
		resetForm,
	} = useGearForm({
		data,
		initialValues:
			initialValues ?? undefined,
	});

	const gearOptions = useMemo(
		() =>
			CHIEF_GEAR_TYPES.map(
				(gearType) => ({
					value: gearType,
					label:
						CHIEF_GEAR_LABELS[
							gearType
						],
				}),
			),
		[],
	);

	useEffect(() => {
		loadFormValues(initialValues);

		setError(null);

		setIsMainFieldsLocked(
			Boolean(lockMainFields),
		);
	}, [
		initialValues,
		lockMainFields,
		loadFormValues,
	]);

	function handleGearChange(
		value: string,
	) {
		setGear(
			value as ChiefGearType,
		);

		setError(null);

		if (
			tutorial.active &&
			tutorial.step ===
				"chief-gear-type"
		) {
			tutorial.goTo(
				"chief-gear-from",
			);
		}
	}

	function handleFromLevelChange(
		value: string,
	) {
		setFromLevel(value);

		setError(null);

		if (
			tutorial.active &&
			tutorial.step ===
				"chief-gear-from"
		) {
			tutorial.goTo(
				"chief-gear-target",
			);
		}
	}

	function handleToLevelChange(
		value: string,
	) {
		setToLevel(value);

		setError(null);

		if (
			tutorial.active &&
			tutorial.step ===
				"chief-gear-target"
		) {
			tutorial.goTo(
				"calculate",
			);
		}
	}

	function handleSubmit(
		event: React.FormEvent<HTMLFormElement>,
	) {
		event.preventDefault();

		if (!isValid) {
			const message =
				"Select the gear type, current level, and target level.";

			setError(message);

			toast.error(
				"Invalid calculation",
				message,
			);

			return;
		}

		try {
			const result = calculateGear(
				values,
				data,
			);

			onCalculate(result);

			setError(null);

			toast.success(
				mode === "update"
					? "Calculation updated"
					: "Calculation completed",
				`Chief Gear Lv.${fromLevel} → Lv.${toLevel}`,
			);
		} catch (submitError) {
			const message =
				submitError instanceof Error
					? submitError.message
					: "Failed to calculate Chief Gear.";

			setError(message);

			toast.error(
				"Calculation failed",
				message,
			);
		}
	}

	function handleReset() {
		resetForm();

		setError(null);

		setIsMainFieldsLocked(false);

		toast.success(
			"Form reset",
			"Chief Gear calculation form has been reset.",
		);
	}

	const submitLabel =
		mode === "update"
			? "Update Calculation"
			: "Calculate";

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-5"
			data-tutorial="chief-gear-form"
		>
			<div className="rounded-2xl bg-[var(--sl-surface)] p-4 sm:p-5">
				<div>
					<p className="text-sm font-bold text-[var(--sl-text)]">
						Chief Gear
					</p>

					<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
						Select the Chief Gear
						type and upgrade level
						range.
					</p>
				</div>

				<div className="mt-5 space-y-4">
					<div
						className="space-y-2"
						data-tutorial="chief-gear-type"
					>
						<SLLabel>
							Gear Type
						</SLLabel>

						<SLSelect
							value={gear}
							onChange={
								handleGearChange
							}
							placeholder="Select Chief Gear"
							options={
								gearOptions
							}
							disabled={
								isMainFieldsLocked
							}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div
							className="space-y-2"
							data-tutorial="chief-gear-from"
						>
							<SLLabel>
								From
							</SLLabel>

							<SLSelect
								value={
									fromLevel
								}
								onChange={
									handleFromLevelChange
								}
								placeholder={
									gear
										? "Select current level"
										: "Select gear first"
								}
								options={
									fromLevelOptions
								}
								disabled={
									isMainFieldsLocked ||
									!gear ||
									fromLevelOptions.length ===
										0
								}
							/>
						</div>

						<div
							className="space-y-2"
							data-tutorial="chief-gear-target"
						>
							<SLLabel>
								To
							</SLLabel>

							<SLSelect
								value={
									toLevel
								}
								onChange={
									handleToLevelChange
								}
								placeholder={
									fromLevel
										? "Select target level"
										: "Select From first"
								}
								options={
									toLevelOptions
								}
								disabled={
									!fromLevel ||
									toLevelOptions.length ===
										0
								}
							/>
						</div>
					</div>

					{error && (
						<p className="text-xs font-medium text-[var(--sl-danger)]">
							{error}
						</p>
					)}

					<div className="grid grid-cols-2 gap-4 pt-1">
						<SLButton
							type="submit"
							disabled={
								!isValid
							}
							data-tutorial="chief-gear-calculate"
							className="h-10 rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--sl-text-muted)]"
						>
							{submitLabel}
						</SLButton>

						<SLButton
							type="button"
							variant="secondary"
							onClick={
								handleReset
							}
							className="h-10 rounded-full bg-[var(--sl-input)] text-xs font-bold text-[var(--sl-text)] hover:bg-[var(--sl-active)] hover:text-[var(--muted-foreground)] hover:border-[var(--sl-border)]"
						>
							Reset
						</SLButton>
					</div>
				</div>
			</div>
		</form>
	);
}