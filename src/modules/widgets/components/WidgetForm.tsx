"use client";

import { useEffect } from "react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLLabel from "@/components/ui/sl-ui/SLLabel";
import SLSelect from "@/components/ui/sl-ui/SLSelect";

import { toast } from "@/lib/toast";

import useWidgetForm from "../hooks/useWidgetForm";

import type {
	WidgetDatabaseItem,
	WidgetFormValues,
} from "../type";

type WidgetFormProps = {
	data: WidgetDatabaseItem[];
	initialValues?: Partial<WidgetFormValues>;
	mode?: "create" | "update";
	lockMainFields?: boolean;
	onSubmit: (values: WidgetFormValues) => void;
	onReset?: () => void;
};

export default function WidgetForm({
	data,
	initialValues,
	mode = "create",
	lockMainFields = false,
	onSubmit,
	onReset,
}: WidgetFormProps) {
	const {
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
	} = useWidgetForm({
		data,
		initialValues,
	});

	useEffect(() => {
		if (initialValues) {
			loadValues(initialValues);
			return;
		}

		resetForm();
	}, [
		initialValues,
		loadValues,
		resetForm,
	]);

	function handleSubmit(
		event: React.FormEvent<HTMLFormElement>,
	) {
		event.preventDefault();

		/**
		 * Validation
		 */
		if (!isSelectionComplete) {
			toast.error(
				"Invalid calculation",
				"Please select the hero, current level, and target level.",
			);

			return;
		}

		try {
			/**
			 * Parent hanya menangani:
			 * - calculation
			 * - result
			 * - history
			 *
			 * Parent TIDAK perlu membuat toast.
			 */
			onSubmit({
				...values,
			});

			/**
			 * Satu-satunya success toast
			 * untuk aksi Calculate / Update.
			 */
			toast.success(
				mode === "update"
					? "Calculation updated"
					: "Calculation completed",
				`${selectedHero?.name ?? "Hero Widget"} Lv.${values.fromLevel} → Lv.${values.toLevel}`,
			);
		} catch (submitError) {
			const message =
				submitError instanceof Error
					? submitError.message
					: "Failed to calculate Hero Widget.";

			toast.error(
				"Calculation failed",
				message,
			);
		}
	}

	function handleReset() {
		resetForm();
		onReset?.();

		toast.success(
			"Form reset",
			"Hero Widget calculation form has been reset.",
		);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4"
		>
			<div className="relative space-y-4 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4 text-[var(--sl-text)]">
				<div>
					<h2 className="text-sm font-bold text-[var(--sl-text)]">
						Hero Widget
					</h2>

					<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
						Select the hero and widget upgrade range.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2 sm:col-span-2">
						<SLLabel>
							Hero
						</SLLabel>

						<SLSelect
							value={
								values.heroId
							}
							onChange={
								setHero
							}
							placeholder="Select hero"
							options={
								heroOptions
							}
							disabled={
								lockMainFields
							}
						/>
					</div>

					<div className="space-y-2">
						<SLLabel>
							From
						</SLLabel>

						<SLSelect
							value={
								values.fromLevel
							}
							onChange={
								setFromLevel
							}
							placeholder="Select level"
							options={
								fromLevelOptions
							}
							disabled={
								lockMainFields
							}
						/>
					</div>

					<div className="space-y-2">
						<SLLabel>
							To
						</SLLabel>

						<SLSelect
							value={
								values.toLevel
							}
							onChange={
								setToLevel
							}
							placeholder="Select level"
							options={
								toLevelOptions
							}
							disabled={
								lockMainFields ||
								values.fromLevel ===
									""
							}
						/>
					</div>
				</div>

				{selectedHero && (
					<div className="rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface-3)] p-4">
						<div className="flex items-start justify-between gap-4">
							<div className="min-w-0">
								<p className="text-sm font-bold text-[var(--sl-text)]">
									{
										selectedHero.name
									}
								</p>

								<p className="mt-1 text-[11px] text-[var(--sl-text-muted)]">
									Generation{" "}
									{
										selectedHero.generation
									}
								</p>
							</div>

							{selectedHero.status && (
								<span className="shrink-0 rounded-full border border-[var(--sl-border)] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[var(--sl-text-muted)]">
									{selectedHero.status ===
									"next-update"
										? "Next Update"
										: "New"}
								</span>
							)}
						</div>

						<div className="mt-4 space-y-3">
							<div>
								<p className="text-[10px] font-bold uppercase tracking-wide text-[var(--sl-text-muted)]">
									Exploration
								</p>

								<p className="mt-1 text-xs leading-5 text-[var(--sl-text)]">
									{
										selectedHero.exploration
									}
								</p>
							</div>

							<div>
								<p className="text-[10px] font-bold uppercase tracking-wide text-[var(--sl-text-muted)]">
									Expedition
								</p>

								<p className="mt-1 text-xs leading-5 text-[var(--sl-text)]">
									{
										selectedHero.expedition
									}
								</p>
							</div>
						</div>
					</div>
				)}

				<div className="grid grid-cols-2 gap-4 pt-1">
					<SLButton
						type="submit"
						disabled={
							!isSelectionComplete
						}
					>
						{mode === "update"
							? "Update"
							: "Calculate"}
					</SLButton>

					<SLButton
						type="button"
						onClick={
							handleReset
						}
						className="bg-[var(--sl-input)] text-[var(--sl-text)] text-[var(--sl-text)] hover:bg-[var(--sl-input-hover)]"
					>
						Reset
					</SLButton>
				</div>
			</div>
		</form>
	);
}