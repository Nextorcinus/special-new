"use client";

import Image from "next/image";
import { useEffect } from "react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLLabel from "@/components/ui/sl-ui/SLLabel";
import SLSelect from "@/components/ui/sl-ui/SLSelect";

import usePetForm from "../hooks/usePetForm";
import type { PetData, PetFormValues } from "../type";

type PetFormProps = {
	pet: PetData;
	initialValues?: Partial<PetFormValues>;
	mode?: "create" | "update";
	onSubmit: (values: PetFormValues) => void;
	onReset?: () => void;
};

export default function PetForm({
	pet,
	initialValues,
	mode = "create",
	onSubmit,
	onReset,
}: PetFormProps) {
	const {
		values,
		errors,

		fromLevelOptions,
		toLevelOptions,
		valeriaOptions,

		isSelectionComplete,

		setFromLevel,
		setToLevel,
		setValeriaLevel,

		validate,
		loadValues,
		resetForm,
	} = usePetForm({
		pet,
		initialValues,
	});

	useEffect(() => {
		if (!initialValues) {
			return;
		}

		loadValues(initialValues);
	}, [initialValues, loadValues]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!validate()) {
			return;
		}

		onSubmit({
			...values,
			petId: pet.id,
		});
	}

	function handleReset() {
		resetForm();
		onReset?.();
	}

	function getRarityClass(rarity: PetData["rarity"]) {
		switch (rarity) {
			case "Common":
				return "bg-amber-500/30 text-amber-200";

			case "Uncommon":
				return "bg-emerald-500/20 text-emerald-300";

			case "Rare":
				return "bg-blue-500/20 text-blue-300";

			case "Epic":
				return "bg-purple-500/20 text-purple-300";

			case "Legendary":
				return "bg-orange-500/20 text-orange-300";

			default:
				return "bg-[var(--sl-input)] text-[var(--sl-text-muted)]";
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
				<div className="flex items-center gap-4">
					<div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-[var(--sl-input)]">
						<Image
							src={pet.image}
							alt={pet.name}
							fill
							className="object-contain"
							sizes="64px"
						/>
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h2 className="truncate text-lg font-bold text-[var(--sl-text)]">
								{pet.name}
							</h2>

							<span
								className={`rounded-full border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 py-0.5 text-[10px] font-bold text-[var(--sl-text-muted)] ${getRarityClass(
									pet.rarity,
								)}`}
							>
								{pet.rarity}
							</span>

							<span className="rounded-full border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 py-0.5 text-[10px] font-bold text-[var(--sl-text-muted)] ">
								GEN {pet.generation}
							</span>
						</div>

						<p className="mt-1 text-[11px] leading-5 text-[var(--sl-text-muted)]">
							Max Lv.{pet.maxLevel}
							{" · "}
							{pet.skill.name}
						</p>

						{pet.unlock.days !== null && (
							<p className="mt-1 text-[11px] leading-5 text-[var(--sl-text-muted)]">
								Unlock Day {pet.unlock.days}
								{pet.unlock.furnace !== null
									? ` · Furnace ${pet.unlock.furnace}`
									: ""}
							</p>
						)}
					</div>
				</div>

				<div className="mt-4 rounded-xl bg-[var(--sl-surface-2)] p-3">
					<p className="text-xs font-bold text-[var(--sl-text)]">
						{pet.skill.name}
					</p>

					<p className="mt-1 text-[11px] leading-5 text-[var(--sl-text-muted)]">
						{pet.skill.description}
					</p>
				</div>
			</div>

			<div className=" bg-[var(--sl-surface)] p-4 rounded-xl">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<SLLabel>Current Level</SLLabel>

						<SLSelect
							value={String(values.fromLevel)}
							onChange={setFromLevel}
							placeholder="Select current level"
							options={fromLevelOptions}
						/>

						{errors.fromLevel && (
							<p className="text-xs text-rose-500">{errors.fromLevel}</p>
						)}
					</div>

					<div className="space-y-2">
						<SLLabel>Target Level</SLLabel>

						<SLSelect
							value={String(values.toLevel)}
							onChange={setToLevel}
							placeholder="Select target level"
							options={toLevelOptions}
						/>

						{errors.toLevel && (
							<p className="text-xs text-rose-500">{errors.toLevel}</p>
						)}
					</div>
				</div>

				<div className="border-t border-[var(--sl-border)] pt-4">
					<p className="mb-4 text-xs font-bold text-[var(--sl-text)]">
						Configuration
					</p>

					<div className="space-y-2">
						<SLLabel>Valeria Level</SLLabel>

						<SLSelect
							value={String(values.valeriaLevel)}
							onChange={setValeriaLevel}
							placeholder="Select Valeria level"
							options={valeriaOptions}
						/>

						<p className="text-[11px] leading-5 text-[var(--sl-text-muted)]">
							Each Valeria level increases SvS points by 2%.
						</p>

						{errors.valeriaLevel && (
							<p className="text-xs text-rose-500">{errors.valeriaLevel}</p>
						)}
					</div>
				</div>

				<div className="flex items-center gap-3 pt-1">
					<SLButton
						type="submit"
						className="flex-1"
						disabled={!isSelectionComplete}
					>
						{mode === "update" ? "Update Calculation" : "Calculate"}
					</SLButton>

					<SLButton type="button" variant="secondary" onClick={handleReset}>
						Reset
					</SLButton>
				</div>
			</div>
		</form>
	);
}
