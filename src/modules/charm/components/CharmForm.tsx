"use client";

import {
	useEffect,
	useState,
} from "react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLLabel from "@/components/ui/sl-ui/SLLabel";
import SLSelect from "@/components/ui/sl-ui/SLSelect";

import { toast } from "@/lib/toast";

import { calculateCharm } from "@/modules/charm/calculator";
import useCharmForm from "@/modules/charm/hooks/useCharmForm";
import type {
	CharmCalculationResult,
	CharmDataItem,
	CharmFormValues,
	ChiefCharmType,
} from "@/modules/charm/type";

type CharmFormMode =
	| "create"
	| "update";

type CharmFormProps = {
	data: CharmDataItem[];
	initialValues?: CharmFormValues | null;
	mode?: CharmFormMode;
	lockMainFields?: boolean;
	onCalculate: (
		result: CharmCalculationResult,
	) => void;
};

export default function CharmForm({
	data,
	initialValues,
	mode = "create",
	lockMainFields = false,
	onCalculate,
}: CharmFormProps) {
	const [error, setError] =
		useState<string | null>(null);

	const {
		values,

		type,
		fromLevel,
		toLevel,
		valeriaLevel,

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
	} = useCharmForm({
		data,
		initialValues:
			initialValues ?? undefined,
	});

	useEffect(() => {
		loadFormValues(initialValues);
		setError(null);
	}, [
		initialValues,
		loadFormValues,
	]);

	function handleTypeChange(
		value: string,
	) {
		setType(
			value as ChiefCharmType,
		);

		setError(null);
	}

	function handleFromLevelChange(
		value: string,
	) {
		setFromLevel(value);
		setError(null);
	}

	function handleToLevelChange(
		value: string,
	) {
		setToLevel(value);
		setError(null);
	}

	function handleValeriaChange(
		value: string,
	) {
		setValeriaLevel(value);
		setError(null);
	}

	function handleSubmit(
	event: React.FormEvent<HTMLFormElement>,
) {
	event.preventDefault();

	if (!isValid) {
		const message =
			"Select the charm type, current level, and target level.";

		setError(message);
		toast.error("Invalid calculation", message);

		return;
	}

	try {
		const result = calculateCharm(
			values,
			data,
		);

		onCalculate(result);
		setError(null);

		toast.success(
			mode === "update"
				? "Calculation updated"
				: "Calculation completed",
			`Chief Charm Lv.${fromLevel} → Lv.${toLevel}`,
		);
	} catch (submitError) {
		const message =
			submitError instanceof Error
				? submitError.message
				: "Failed to calculate Chief Charm.";

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

	toast.success(
		"Form reset",
		"Chief Charm calculation form has been reset.",
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
		>
			<div className="rounded-2xl bg-[var(--sl-surface)] p-4 sm:p-5">
				<div>
					<p className="text-sm font-bold text-[var(--sl-text)]">
						Chief Charm
					</p>

					<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
						Select the Chief Charm type,
						upgrade level range, and Valeria
						level.
					</p>
				</div>

				<div className="mt-5 space-y-4">
					<div className="space-y-2">
						<SLLabel>
							Charm Type
						</SLLabel>

						<SLSelect
							value={type}
							onChange={
								handleTypeChange
							}
							placeholder="Select Charm Type"
							options={typeOptions}
							disabled={
								lockMainFields
							}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<SLLabel>
								From
							</SLLabel>

							<SLSelect
								value={fromLevel}
								onChange={
									handleFromLevelChange
								}
								placeholder="Select current level"
								options={
									fromLevelOptions
								}
								disabled={
									lockMainFields ||
									fromLevelOptions.length ===
										0
								}
							/>
						</div>

						<div className="space-y-2">
							<SLLabel>
								To
							</SLLabel>

							<SLSelect
								value={toLevel}
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

					<div className="space-y-2">
						<SLLabel>
							Valeria (SvS)
						</SLLabel>

						<SLSelect
							value={valeriaLevel}
							onChange={
								handleValeriaChange
							}
							placeholder="Select Valeria Level"
							options={valeriaOptions}
						/>

						<p className="text-[11px] leading-5 text-[var(--sl-text-muted)]">
							Current bonus: +
							{Math.min(
								Number(
									valeriaLevel,
								) * 2,
								20,
							)}
							% SvS Points
						</p>
					</div>

					{error && (
						<p className="text-xs font-medium text-[var(--sl-danger)]">
							{error}
						</p>
					)}

					<div className="grid grid-cols-2 gap-4 pt-1">
						<SLButton
							type="submit"
							disabled={!isValid}
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