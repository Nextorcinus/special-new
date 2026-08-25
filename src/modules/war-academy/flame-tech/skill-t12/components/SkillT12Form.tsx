"use client";

import { useEffect, useMemo, useState } from "react";

import SLAccordion from "@/components/ui/sl-ui/SLAccordion";
import SLButton from "@/components/ui/sl-ui/SLButton";
import SLInput from "@/components/ui/sl-ui/SLInput";
import SLLabel from "@/components/ui/sl-ui/SLLabel";
import SLSelect from "@/components/ui/sl-ui/SLSelect";
import SLSwitch from "@/components/ui/sl-ui/SLSwitch";

import { toast } from "@/lib/toast";

import {
	getSkillT12ResearchOption,
	getSkillT12ResearchOptions,
	isValidSkillT12Selection,
} from "../calculator/helpers";

import type {
	SkillT12Category,
	SkillT12Database,
	SkillT12FormValues,
	SkillT12SelectOption,
} from "../type";

type SkillT12FormProps = {
	category: SkillT12Category;
	data: SkillT12Database;
	initialValues?: Partial<SkillT12FormValues>;
	mode?: "create" | "update";
	lockMainFields?: boolean;
	onSubmit: (values: SkillT12FormValues) => void;
	onReset?: () => void;
};

const VP_OPTIONS: SkillT12SelectOption[] = [
	{
		value: "Off",
		label: "Off",
	},
	{
		value: "10%",
		label: "+10%",
	},
	{
		value: "15%",
		label: "+15%",
	},
];

const AGNES_OPTIONS: SkillT12SelectOption[] = [
	{
		value: "0",
		label: "Off",
	},
	{
		value: "1",
		label: "Level 1 (-2h)",
	},
	{
		value: "2",
		label: "Level 2 (-4h)",
	},
	{
		value: "3",
		label: "Level 3 (-6h)",
	},
	{
		value: "4",
		label: "Level 4 (-8h)",
	},
	{
		value: "5",
		label: "Level 5 (-10h)",
	},
];

function createInitialValues(
	category: SkillT12Category,
	initialValues?: Partial<SkillT12FormValues>,
): SkillT12FormValues {
	return {
		category,
		research: initialValues?.research ?? "",
		fromLevel: initialValues?.fromLevel ?? "0",
		toLevel: initialValues?.toLevel ?? "",
		researchSpeed: initialValues?.researchSpeed ?? "",
		vpLevel: initialValues?.vpLevel ?? "Off",
		agnesLevel: initialValues?.agnesLevel ?? "0",
		presidentSkill:
			initialValues?.presidentSkill ?? false,
	};
}

function createLevelOptions(
	maxLevel: number,
	includeZero: boolean,
): SkillT12SelectOption[] {
	const start = includeZero ? 0 : 1;

	if (maxLevel < start) {
		return [];
	}

	return Array.from(
		{
			length: maxLevel - start + 1,
		},
		(_, index) => {
			const level = start + index;

			return {
				value: String(level),
				label: `Level ${level}`,
			};
		},
	);
}

export default function SkillT12Form({
	category,
	data,
	initialValues,
	mode = "create",
	lockMainFields = false,
	onSubmit,
	onReset,
}: SkillT12FormProps) {
	const [values, setValues] =
		useState<SkillT12FormValues>(() =>
			createInitialValues(
				category,
				initialValues,
			),
		);

	useEffect(() => {
		setValues(
			createInitialValues(
				category,
				initialValues,
			),
		);
	}, [category, initialValues]);

	const researchOptions = useMemo(() => {
		return getSkillT12ResearchOptions(
			data,
			category,
		).map((option) => ({
			value: option.name,
			label: option.name,
		}));
	}, [data, category]);

	const selectedResearch = useMemo(() => {
		return getSkillT12ResearchOption(
			data,
			category,
			values.research,
		);
	}, [
		data,
		category,
		values.research,
	]);

	const fromLevelOptions = useMemo(() => {
		return createLevelOptions(
			selectedResearch?.maxLevel ?? 0,
			true,
		);
	}, [selectedResearch]);

	const toLevelOptions = useMemo(() => {
		const fromLevel = Number(
			values.fromLevel || 0,
		);

		return createLevelOptions(
			selectedResearch?.maxLevel ?? 0,
			false,
		).filter((option) => {
			return (
				Number(option.value) >
				fromLevel
			);
		});
	}, [
		selectedResearch,
		values.fromLevel,
	]);

	const isValid =
		isValidSkillT12Selection(
			data,
			values,
		);

	function setField<
		Key extends keyof SkillT12FormValues,
	>(
		key: Key,
		value: SkillT12FormValues[Key],
	) {
		setValues((current) => ({
			...current,
			[key]: value,
		}));
	}

	function setResearch(
		research: string,
	) {
		setValues((current) => ({
			...current,
			research,
			fromLevel: "0",
			toLevel: "",
		}));
	}

	function setFromLevel(
		fromLevel: string,
	) {
		setValues((current) => {
			const currentToLevel =
				Number(
					current.toLevel || 0,
				);

			const nextFromLevel =
				Number(
					fromLevel || 0,
				);

			return {
				...current,
				fromLevel,
				toLevel:
					currentToLevel >
					nextFromLevel
						? current.toLevel
						: "",
			};
		});
	}

	function handleReset() {
		setValues(
			createInitialValues(category),
		);

		onReset?.();

		toast.success(
			"Form reset",
			`${category} T12 Skills calculation form has been reset.`,
		);
	}

	function handleSubmit(
		event: React.FormEvent<HTMLFormElement>,
	) {
		event.preventDefault();

		if (!isValid) {
			toast.error(
				"Invalid calculation",
				"Please select the skill, current level, and target level.",
			);

			return;
		}

		const result: SkillT12FormValues = {
			...values,
			category,
		};

		try {
			onSubmit(result);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to calculate T12 Skill upgrade.";

			toast.error(
				"Calculation failed",
				message,
			);

			return;
		}

		toast.success(
			mode === "update"
				? "Calculation updated"
				: "Calculation completed",
			`${category} ${values.research} Lv.${values.fromLevel} → Lv.${values.toLevel}`,
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
						{category} T12 Skills
					</h2>

					<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
						Select the T12 skill and upgrade range.
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2 sm:col-span-2">
						<SLLabel>
							Skill
						</SLLabel>

						<SLSelect
							value={
								values.research
							}
							onChange={
								setResearch
							}
							placeholder="Select skill"
							options={
								researchOptions
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
								lockMainFields ||
								!values.research
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
							onChange={(
								value,
							) =>
								setField(
									"toLevel",
									value,
								)
							}
							placeholder="Select level"
							options={
								toLevelOptions
							}
							disabled={
								lockMainFields ||
								!values.research ||
								!values.fromLevel
							}
						/>
					</div>
				</div>

				<SLAccordion title="Configuration">
					<div className="space-y-4">
						<div className="space-y-2">
							<SLLabel>
								Research Speed (%)
							</SLLabel>

							<SLInput
								value={
									values.researchSpeed
								}
								onChange={(
									event,
								) =>
									setField(
										"researchSpeed",
										event
											.target
											.value,
									)
								}
								inputMode="decimal"
								placeholder="e.g. 68"
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<SLLabel>
									Vice President
								</SLLabel>

								<SLSelect
									value={
										values.vpLevel
									}
									onChange={(
										value,
									) =>
										setField(
											"vpLevel",
											value,
										)
									}
									options={
										VP_OPTIONS
									}
								/>
							</div>

							<div className="space-y-2">
								<SLLabel>
									Agnes Skill
								</SLLabel>

								<SLSelect
									value={
										values.agnesLevel
									}
									onChange={(
										value,
									) =>
										setField(
											"agnesLevel",
											value,
										)
									}
									options={
										AGNES_OPTIONS
									}
								/>
							</div>
						</div>

						<div className="border-t border-[var(--sl-border)] pt-3">
							<p className="text-xs font-bold text-[var(--sl-text)]">
								Additional Bonus
							</p>

							<div className="mt-3 flex items-start justify-between gap-4">
								<div className="min-w-0 flex-1">
									<p className="text-sm font-bold text-[var(--sl-text)]">
										President Skill
									</p>

									<p className="mt-1 text-[11px] leading-5 text-[var(--sl-text-muted)]">
										+10% Research Speed while the President skill is active.
									</p>
								</div>

								<div className="shrink-0 pt-0.5">
									<SLSwitch
										label="President Skill"
										checked={
											values.presidentSkill
										}
										onCheckedChange={(
											checked,
										) =>
											setField(
												"presidentSkill",
												checked,
											)
										}
									/>
								</div>
							</div>
						</div>
					</div>
				</SLAccordion>

				<div className="grid grid-cols-2 gap-4 pt-1">
					<SLButton type="submit">
						{mode === "update"
							? "Update"
							: "Calculate"}
					</SLButton>

					<SLButton
						type="button"
						onClick={
							handleReset
						}
						className="bg-[var(--sl-input)] text-[var(--sl-text)] hover:bg-[var(--sl-input-hover)]"
					>
						Reset
					</SLButton>
				</div>
			</div>
		</form>
	);
}