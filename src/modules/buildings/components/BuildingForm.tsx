"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

import {
	type BuildingType,
	calculateUpgrade,
} from "@/modules/buildings/calculator/calculateUpgrade";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLInput from "@/components/ui/sl-ui/SLInput";
import SLSelect from "@/components/ui/sl-ui/SLSelect";
import SLSwitch from "@/components/ui/sl-ui/SLSwitch";

type BuildingFormProps = {
	type: BuildingType;
	data: any[];
	onCalculate: (result: any) => void;
};

const labelClass = "mb-1 block text-[11px] text-zinc-400";

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
}: BuildingFormProps) {
	const [building, setBuilding] = useState("");
	const [fromLevel, setFromLevel] = useState("");
	const [toLevel, setToLevel] = useState("");

	const [petLevel, setPetLevel] = useState("Off");
	const [vpLevel, setVpLevel] = useState("Off");
	const [doubleTime, setDoubleTime] = useState(false);
	const [zinmanSkill, setZinmanSkill] = useState("Off");
	const [agnesLevel, setAgnesLevel] = useState("0");
	const [valeriaLevel, setValeriaLevel] = useState("0");
	const [constructionSpeed, setConstructionSpeed] = useState("");
	const [isConfigOpen, setIsConfigOpen] = useState(false);

	const buildingOptions = useMemo(() => {
		return [...new Set(data.map((item) => item.Building))]
			.filter(Boolean)
			.map(String);
	}, [data]);

	const levelOptions = useMemo(() => {
		if (!building) return [];

		return data
			.filter((item) => String(item.Building) === building)
			.map((item) => String(item.Level))
			.filter(Boolean);
	}, [data, building]);

	const filteredToLevels = useMemo(() => {
		if (!fromLevel) return [];

		const fromIndex = levelOptions.findIndex((lvl) => lvl === fromLevel);

		if (fromIndex === -1) return [];

		return levelOptions.slice(fromIndex + 1);
	}, [levelOptions, fromLevel]);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		if (!building || !fromLevel || !toLevel) {
			alert("Please select building, current level, and target level.");
			return;
		}

		const calculated = calculateUpgrade({
			type,
			building,
			fromLevel,
			toLevel,
			buffs: {
				petLevel,
				vpLevel,
				doubleTime,
				zinmanSkill,
				agnesLevel,
				constructionSpeed: Number(constructionSpeed) || 0,
				valeriaBonus: Number(valeriaLevel) * 2,
			},
		});

		if (!calculated) {
			alert("Calculation failed. Please check selected levels.");
			return;
		}

		onCalculate(calculated);
	}

	function handleReset() {
		setBuilding("");
		setFromLevel("");
		setToLevel("");
		setPetLevel("Off");
		setVpLevel("Off");
		setDoubleTime(false);
		setZinmanSkill("Off");
		setAgnesLevel("0");
		setValeriaLevel("0");
		setConstructionSpeed("");
		setIsConfigOpen(false);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="relative space-y-4 rounded-[14px] bg-[#1f1f1f] p-4 text-white dark:bg-special-inside"
		>
			<div>
				<h2 className="text-sm font-bold">Calculation</h2>
				<p className="mt-1 text-[11px] text-white/50">Building Name</p>
			</div>

			<div className="relative z-50 space-y-1.5">
				<label className={labelClass}>Building</label>

				<SLSelect
	value={building}
	onChange={(value: string) => {
		setBuilding(value);
		setFromLevel("");
		setToLevel("");
	}}
	placeholder="From here"
	options={buildingOptions.map((item) => ({
		value: item,
		label: item,
	}))}
	className="!bg-white !text-black"
/>
			</div>

			<div className="relative z-40 grid grid-cols-2 gap-3">
				<div className="space-y-1.5">
					<label className={labelClass}>Current</label>

					<SLSelect
	value={fromLevel}
	onChange={(value: string) => {
		setFromLevel(value);
		setToLevel("");
	}}
	placeholder="Select current"
	options={levelOptions.map((lvl) => ({
		value: lvl,
		label: lvl,
	}))}
	disabled={!building}
	className="!bg-white !text-black"
/>
				</div>

				<div className="space-y-1.5">
					<label className={labelClass}>To</label>

					<SLSelect
	value={toLevel}
	onChange={(value: string) => setToLevel(value)}
	placeholder="Select target"
	options={filteredToLevels.map((lvl) => ({
		value: lvl,
		label: lvl,
	}))}
	disabled={!fromLevel || filteredToLevels.length === 0}
	className="!bg-white !text-black"
/>
				</div>
			</div>

			<div className="relative z-10 rounded-[14px] bg-white/10 p-3">
				<button
					type="button"
					onClick={() => setIsConfigOpen((prev) => !prev)}
					className="flex w-full items-center justify-between text-left"
				>
					<span className="text-xs font-bold">Configuration</span>

					{isConfigOpen ? (
						<ChevronUp size={15} className="text-white/70" />
					) : (
						<ChevronDown size={15} className="text-white/70" />
					)}
				</button>

				{isConfigOpen && (
					<div className="mt-4 space-y-3">
						<div className="space-y-1.5">
							<label className={labelClass}>Construction Speed %</label>

							<SLInput
								type="number"
								value={constructionSpeed}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setConstructionSpeed(e.target.value)
								}
								placeholder="e.g. 68 for 68%"
								className="bg-special-input text-white"
							/>
						</div>

						<div className="relative z-30 grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<label className={labelClass}>Pet Skill</label>

								<SLSelect
									value={petLevel}
									onChange={(value: string) => setPetLevel(value)}
									options={petOptions}
									className="bg-special-input text-white"
								/>
							</div>

							<div className="space-y-1.5">
								<label className={labelClass}>VP</label>

								<SLSelect
									value={vpLevel}
									onChange={(value: string) => setVpLevel(value)}
									options={vpOptions}
									className="bg-special-input text-white"
								/>
							</div>
						</div>

						<div className="relative z-20 space-y-1.5">
							<label className={labelClass}>Zinman Skill</label>

							<SLSelect
								value={zinmanSkill}
								onChange={(value: string) => setZinmanSkill(value)}
								options={zinmanOptions}
								className="bg-special-input text-white"
							/>
						</div>

						<div className="relative z-20 space-y-1.5">
							<label className={labelClass}>Agnes Skill</label>

							<SLSelect
								value={agnesLevel}
								onChange={(value: string) => setAgnesLevel(value)}
								options={agnesOptions}
								className="bg-special-input text-white"
							/>
						</div>

						<div className="relative z-20 space-y-1.5">
							<label className={labelClass}>Valerie Skill</label>

							<SLSelect
								value={valeriaLevel}
								onChange={(value: string) => setValeriaLevel(value)}
								options={valeriaOptions}
								className="bg-special-input text-white"
							/>
						</div>

						<div className="border-t border-white/20 pt-3">
							<p className="text-xs font-bold">Additional Bonus</p>

							<div className="mt-2 flex items-center justify-between">
								<p className="text-[11px] text-white/50">Double Time +20%</p>

							<SLSwitch
	label="Double Time"
	checked={doubleTime}
	onCheckedChange={setDoubleTime}
/>
							</div>
						</div>
					</div>
				)}
			</div>

			<div className="relative z-0 grid grid-cols-2 gap-4 pt-1">
				<SLButton type="submit" className="h-10 rounded-full">
					Submit
				</SLButton>

				<SLButton
					type="button"
					onClick={handleReset}
					className="h-10 rounded-full bg-[#777] text-white"
				>
					Reset
				</SLButton>
			</div>
		</form>
	);
}