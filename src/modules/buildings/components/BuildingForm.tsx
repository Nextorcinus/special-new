"use client";

import { useEffect, useMemo, useState } from "react";

import SLAccordion from "@/components/ui/sl-ui/SLAccordion";
import SLButton from "@/components/ui/sl-ui/SLButton";
import SLInput from "@/components/ui/sl-ui/SLInput";
import SLLabel from "@/components/ui/sl-ui/SLLabel";
import SLSelect from "@/components/ui/sl-ui/SLSelect";
import SLSwitch from "@/components/ui/sl-ui/SLSwitch";
import {
	type BuildingType,
	calculateUpgrade,
} from "@/modules/buildings/calculator/calculateUpgrade";
import type { BuildingFormValues } from "@/modules/buildings/types";

type BuildingFormProps = {
	type: BuildingType;
	data: any[];
	onCalculate: (result: any) => void;
	initialValues?: BuildingFormValues | null;
	mode?: "create" | "update";
	lockMainFields?: boolean;
};

const defaultBuildingFormValues: BuildingFormValues = {
	building: "",
	fromLevel: "",
	toLevel: "",
	petLevel: "Off",
	vpLevel: "Off",
	doubleTime: false,
	zinmanSkill: "Off",
	agnesLevel: "0",
	valeriaLevel: "0",
	constructionSpeed: "",
};

const petOptions = [
	{ value: "Off", label: "Off" },
	{ value: "Lv.1", label: "Level 1" },
	{ value: "Lv.2", label: "Level 2" },
	{ value: "Lv.3", label: "Level 3" },
	{ value: "Lv.4", label: "Level 4" },
	{ value: "Lv.5", label: "Level 5" },
];

const vpOptions = [
	{ value: "Off", label: "Off" },
	{ value: "10%", label: "+10%" },
	{ value: "15%", label: "+15%" },
	{ value: "20%", label: "+20%" },
	{ value: "25%", label: "+25%" },
];

const zinmanOptions = [
	{ value: "Off", label: "Off" },
	{ value: "Lv.1", label: "Level 1 (-3% cost)" },
	{ value: "Lv.2", label: "Level 2 (-6% cost)" },
	{ value: "Lv.3", label: "Level 3 (-9% cost)" },
	{ value: "Lv.4", label: "Level 4 (-12% cost)" },
	{ value: "Lv.5", label: "Level 5 (-15% cost)" },
];

const agnesOptions = [
	{ value: "0", label: "Off" },
	{ value: "1", label: "Level 1 (-2h)" },
	{ value: "2", label: "Level 2 (-4h)" },
	{ value: "3", label: "Level 3 (-6h)" },
	{ value: "4", label: "Level 4 (-8h)" },
	{ value: "5", label: "Level 5 (-10h)" },
];

const valeriaOptions = [
	{ value: "0", label: "Off" },
	{ value: "1", label: "Level 1 (+2% SvS)" },
	{ value: "2", label: "Level 2 (+4% SvS)" },
	{ value: "3", label: "Level 3 (+6% SvS)" },
	{ value: "4", label: "Level 4 (+8% SvS)" },
	{ value: "5", label: "Level 5 (+10% SvS)" },
	{ value: "6", label: "Level 6 (+12% SvS)" },
	{ value: "7", label: "Level 7 (+14% SvS)" },
	{ value: "8", label: "Level 8 (+16% SvS)" },
	{ value: "9", label: "Level 9 (+18% SvS)" },
	{ value: "10", label: "Level 10 (+20% SvS)" },
];

export default function BuildingForm({
	type,
	data,
	onCalculate,
	initialValues,
	mode = "create",
	lockMainFields = false,
}: BuildingFormProps) {
	const [values, setValues] = useState<BuildingFormValues>(
		defaultBuildingFormValues,
	);

	useEffect(() => {
		if (initialValues) {
			setValues(initialValues);
			return;
		}

		setValues(defaultBuildingFormValues);
	}, [initialValues]);

	const updateValue = <K extends keyof BuildingFormValues>(
		key: K,
		value: BuildingFormValues[K],
	) => {
		setValues((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const updateValues = (patch: Partial<BuildingFormValues>) => {
		setValues((prev) => ({
			...prev,
			...patch,
		}));
	};

	const buildingOptions = useMemo(() => {
		return [...new Set(data.map((item) => item.Building))]
			.filter(Boolean)
			.map(String);
	}, [data]);

	const levelOptions = useMemo(() => {
		if (!values.building) return [];

		return data
			.filter((item) => String(item.Building) === values.building)
			.map((item) => String(item.Level))
			.filter(Boolean);
	}, [data, values.building]);

	const filteredToLevels = useMemo(() => {
		if (!values.fromLevel) return [];

		const fromIndex = levelOptions.findIndex(
			(level) => level === values.fromLevel,
		);

		if (fromIndex === -1) return [];

		return levelOptions.slice(fromIndex + 1);
	}, [levelOptions, values.fromLevel]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!values.building || !values.fromLevel || !values.toLevel) {
			alert("Please select building, current level, and target level.");
			return;
		}

		const calculated = calculateUpgrade({
			type,
			building: values.building,
			fromLevel: values.fromLevel,
			toLevel: values.toLevel,
			buffs: {
				petLevel: values.petLevel,
				vpLevel: values.vpLevel,
				doubleTime: values.doubleTime,
				zinmanSkill: values.zinmanSkill,
				agnesLevel: values.agnesLevel,
				constructionSpeed: Number(values.constructionSpeed) || 0,
				valeriaBonus: Number(values.valeriaLevel) * 2,
			},
		});

		if (!calculated) {
			alert("Calculation failed.");
			return;
		}

		onCalculate({
			...calculated,
			form: structuredClone(values),
		});
	}

	function handleReset() {
		setValues(defaultBuildingFormValues);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="relative space-y-4 p-4 text-[var(--sl-text)]"
		>
			<div className="relative z-50 space-y-1.5">
				<SLLabel>Building Name</SLLabel>

				<SLSelect
					value={values.building}
					onChange={(value: string) =>
						updateValues({
							building: value,
							fromLevel: "",
							toLevel: "",
						})
					}
					placeholder="choose building"
					options={buildingOptions.map((item) => ({
						value: item,
						label: item,
					}))}
					disabled={lockMainFields}
				/>
			</div>

			<div className="relative z-40 grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<SLLabel>Current</SLLabel>

					<SLSelect
						value={values.fromLevel}
						onChange={(value: string) =>
							updateValues({
								fromLevel: value,
								toLevel: "",
							})
						}
						placeholder="Select current"
						options={levelOptions.map((item) => ({
							value: item,
							label: item,
						}))}
						disabled={lockMainFields || !values.building}
					/>
				</div>

				<div className="space-y-1.5">
					<SLLabel>To</SLLabel>

					<SLSelect
						value={values.toLevel}
						onChange={(value: string) => updateValue("toLevel", value)}
						placeholder="Select target"
						options={filteredToLevels.map((item) => ({
							value: item,
							label: item,
						}))}
						disabled={
							lockMainFields ||
							!values.fromLevel ||
							filteredToLevels.length === 0
						}
					/>
				</div>
			</div>

			<SLAccordion title="Configuration">
				<div className="space-y-1.5">
					<SLLabel>Construction Speed %</SLLabel>

					<SLInput
						type="number"
						value={values.constructionSpeed}
						onChange={(event) =>
							updateValue("constructionSpeed", event.target.value)
						}
						placeholder="e.g. 68"
					/>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="space-y-1.5">
						<SLLabel>Pet Skill</SLLabel>

						<SLSelect
							value={values.petLevel}
							onChange={(value: string) => updateValue("petLevel", value)}
							options={petOptions}
						/>
					</div>

					<div className="space-y-1.5">
						<SLLabel>VP</SLLabel>

						<SLSelect
							value={values.vpLevel}
							onChange={(value: string) => updateValue("vpLevel", value)}
							options={vpOptions}
						/>
					</div>
				</div>

				<div className="space-y-1.5">
					<SLLabel>Zinman Skill</SLLabel>

					<SLSelect
						value={values.zinmanSkill}
						onChange={(value: string) => updateValue("zinmanSkill", value)}
						options={zinmanOptions}
					/>
				</div>

				<div className="space-y-1.5">
					<SLLabel>Agnes Skill</SLLabel>

					<SLSelect
						value={values.agnesLevel}
						onChange={(value: string) => updateValue("agnesLevel", value)}
						options={agnesOptions}
					/>
				</div>

				<div className="space-y-1.5">
					<SLLabel>Valerie Skill</SLLabel>

					<SLSelect
						value={values.valeriaLevel}
						onChange={(value: string) => updateValue("valeriaLevel", value)}
						options={valeriaOptions}
					/>
				</div>

				<div className="border-t border-[var(--sl-border)] pt-3">
					<p className="text-xs font-bold text-[var(--sl-text)]">
						Additional Bonus
					</p>

					<div className="mt-2">
						<SLSwitch
							label="Double Time"
							description="+20%"
							checked={values.doubleTime}
							onCheckedChange={(checked: boolean) =>
								updateValue("doubleTime", checked)
							}
						/>
					</div>
				</div>
			</SLAccordion>

			<div className="grid grid-cols-2 gap-4 pt-1">
				<button
					type="submit"
					className="h-10 rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--sl-hover)]"
				>
					{mode === "update" ? "Update" : "Submit"}
				</button>

				<SLButton
					type="button"
					onClick={handleReset}
					className="h-10 rounded-full bg-[var(--sl-input)] text-xs font-bold text-[var(--sl-text)] hover:bg-[var(--sl-input-hover)]"
				>
					Reset
				</SLButton>
			</div>
		</form>
	);
}
