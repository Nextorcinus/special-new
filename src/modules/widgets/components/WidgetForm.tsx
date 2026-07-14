"use client";

import { useEffect, useMemo } from "react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLLabel from "@/components/ui/sl-ui/SLLabel";
import SLSelect from "@/components/ui/sl-ui/SLSelect";

import useWidgetForm from "../hooks/useWidgetForm";

import type { WidgetDatabaseItem, WidgetFormValues } from "../type";

type WidgetFormProps = {
	data: WidgetDatabaseItem[];
	initialValues?: Partial<WidgetFormValues>;
	mode?: "create" | "update";
	onSubmit: (values: WidgetFormValues) => void;
	onReset?: () => void;
};

export default function WidgetForm({
	data,
	initialValues,
	mode = "create",
	onSubmit,
	onReset,
}: WidgetFormProps) {
	const {
		values,
		errors,
		selectedHero,
		fromLevelOptions,
		toLevelOptions,
		selectHero,
		selectFromLevel,
		setField,
		validate,
		reset,
	} = useWidgetForm({
		data,
		initialValues,
	});

	const heroOptions = useMemo(() => {
		return [...data]
			.sort((a, b) => {
				if (a.generation !== b.generation) {
					return a.generation - b.generation;
				}

				return a.name.localeCompare(b.name);
			})
			.map((hero) => ({
				value: hero.id,
				label: `GEN ${hero.generation} · ${hero.name}`,
			}));
	}, [data]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!validate()) {
			return;
		}

		onSubmit(values);
	}

	function handleReset() {
		reset();
		onReset?.();
	}

	useEffect(() => {
		if (!values.heroId) {
			return;
		}

		const heroExists = data.some((hero) => hero.id === values.heroId);

		if (!heroExists) {
			selectHero("");
		}
	}, [data, values.heroId, selectHero]);

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div className="space-y-2">
				<SLLabel>Hero</SLLabel>

				<SLSelect
					value={values.heroId}
					onChange={selectHero}
					placeholder="Select Hero"
					options={heroOptions}
				/>

				{errors.heroId && (
					<p className="text-[11px] leading-5 text-[var(--sl-danger)]">
						{errors.heroId}
					</p>
				)}
			</div>

			{selectedHero && (
				<div className="rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface-2)] p-4">
					<div className="flex items-start justify-between gap-4">
						<div className="min-w-0">
							<p className="text-sm font-bold text-[var(--sl-text)]">
								{selectedHero.name}
							</p>

							<p className="mt-1 text-[11px] text-[var(--sl-text-muted)]">
								Generation {selectedHero.generation}
							</p>
						</div>

						{selectedHero.status && (
							<span className="shrink-0 rounded-full border border-[var(--sl-border)] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[var(--sl-text-muted)]">
								{selectedHero.status === "next-update" ? "Next Update" : "New"}
							</span>
						)}
					</div>

					<div className="mt-4 space-y-3">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-wide text-[var(--sl-text-muted)]">
								Exploration
							</p>

							<p className="mt-1 text-xs leading-5 text-[var(--sl-text)]">
								{selectedHero.exploration}
							</p>
						</div>

						<div>
							<p className="text-[10px] font-bold uppercase tracking-wide text-[var(--sl-text-muted)]">
								Expedition
							</p>

							<p className="mt-1 text-xs leading-5 text-[var(--sl-text)]">
								{selectedHero.expedition}
							</p>
						</div>
					</div>
				</div>
			)}

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<SLLabel>From</SLLabel>

					<SLSelect
						value={values.fromLevel}
						onChange={selectFromLevel}
						placeholder="From Level"
						options={fromLevelOptions}
					/>

					{errors.fromLevel && (
						<p className="text-[11px] leading-5 text-[var(--sl-danger)]">
							{errors.fromLevel}
						</p>
					)}
				</div>

				<div className="space-y-2">
					<SLLabel>To</SLLabel>

					<SLSelect
						value={values.toLevel}
						onChange={(value: string) => setField("toLevel", value)}
						placeholder="To Level"
						options={toLevelOptions}
						disabled={values.fromLevel === ""}
					/>

					{errors.toLevel && (
						<p className="text-[11px] leading-5 text-[var(--sl-danger)]">
							{errors.toLevel}
						</p>
					)}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-3 pt-2">
				<SLButton type="button" variant="secondary" onClick={handleReset}>
					Reset
				</SLButton>

				<SLButton type="submit">
					{mode === "update" ? "Update Calculation" : "Calculate"}
				</SLButton>
			</div>
		</form>
	);
}
