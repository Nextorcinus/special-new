"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState } from "react";

import {
	calculateUpgrade,
	type BuildingType,
} from "@/modules/buildings/calculator/calculateUpgrade";

type BuildingFormProps = {
	type: BuildingType;
	data: any[];
	onCalculate: (result: any) => void;
};

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

	const [isConfigOpen, setIsConfigOpen] = useState(true);

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
		setIsConfigOpen(true);
	}

	const labelClass = "mb-1 block text-[11px] text-[#a6a6a6]";
	const selectLightClass =
		"h-11 w-full rounded-lg border-0 bg-white px-4 text-xs text-black outline-none disabled:opacity-50";
	const inputDarkClass =
		"h-10 w-full rounded-lg border-0 bg-[#2b2b2b] px-4 text-xs text-white outline-none placeholder:text-[#8e8e8e]";
	const selectDarkClass =
		"h-10 w-full rounded-lg border-0 bg-[#2b2b2b] px-4 text-xs text-white outline-none";

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 rounded-[14px] bg-[#1f1f1f] p-4 text-white"
		>
			<div>
				<h2 className="text-sm font-bold">Calculation</h2>
				<p className="mt-1 text-[11px] text-[#9a9a9a]">Building Name</p>
			</div>

			<div>
				<label className={labelClass}>Building</label>
				<select
					value={building}
					onChange={(e) => {
						setBuilding(e.target.value);
						setFromLevel("");
						setToLevel("");
					}}
					className={selectLightClass}
				>
					<option value="">From here</option>
					{buildingOptions.map((item) => (
						<option key={item} value={item}>
							{item}
						</option>
					))}
				</select>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div>
					<label className={labelClass}>Current</label>
					<select
						value={fromLevel}
						onChange={(e) => {
							setFromLevel(e.target.value);
							setToLevel("");
						}}
						className={selectLightClass}
						disabled={!building}
					>
						<option value="">Select current</option>
						{levelOptions.map((lvl) => (
							<option key={lvl} value={lvl}>
								{lvl}
							</option>
						))}
					</select>
				</div>

				<div>
					<label className={labelClass}>To</label>
					<select
						value={toLevel}
						onChange={(e) => setToLevel(e.target.value)}
						className={selectLightClass}
						disabled={!fromLevel || filteredToLevels.length === 0}
					>
						<option value="">Select target</option>
						{filteredToLevels.map((lvl) => (
							<option key={lvl} value={lvl}>
								{lvl}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="rounded-[14px] bg-[#353535] p-3">
				<button
					type="button"
					onClick={() => setIsConfigOpen((prev) => !prev)}
					className="flex w-full items-center justify-between text-left"
				>
					<span className="text-xs font-bold">Configuration</span>

					{isConfigOpen ? (
						<ChevronUp size={15} className="text-[#cfcfcf]" />
					) : (
						<ChevronDown size={15} className="text-[#cfcfcf]" />
					)}
				</button>

				{isConfigOpen && (
					<div className="mt-4 space-y-3">
						<div>
							<label className={labelClass}>Construction Speed %</label>
							<input
								type="number"
								value={constructionSpeed}
								onChange={(e) => setConstructionSpeed(e.target.value)}
								placeholder="98.9"
								className={inputDarkClass}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label className={labelClass}>Pet Skill</label>
								<select
									value={petLevel}
									onChange={(e) => setPetLevel(e.target.value)}
									className={selectDarkClass}
								>
									<option value="Off">Off</option>
									<option value="Lv.1">Level 1</option>
									<option value="Lv.2">Level 2</option>
									<option value="Lv.3">Level 3</option>
									<option value="Lv.4">Level 4</option>
									<option value="Lv.5">Level 5</option>
								</select>
							</div>

							<div>
								<label className={labelClass}>VP</label>
								<select
									value={vpLevel}
									onChange={(e) => setVpLevel(e.target.value)}
									className={selectDarkClass}
								>
									<option value="Off">Off</option>
									<option value="10%">+10%</option>
									<option value="15%">+15%</option>
									<option value="20%">+20%</option>
									<option value="25%">+25%</option>
								</select>
							</div>
						</div>

						<div>
							<label className={labelClass}>Zinman Skill</label>
							<select
								value={zinmanSkill}
								onChange={(e) => setZinmanSkill(e.target.value)}
								className={selectDarkClass}
							>
								<option value="Off">Off</option>
								<option value="Lv.1">Level 1 (-3% cost)</option>
								<option value="Lv.2">Level 2 (-6% cost)</option>
								<option value="Lv.3">Level 3 (-9% cost)</option>
								<option value="Lv.4">Level 4 (-12% cost)</option>
								<option value="Lv.5">Level 5 (-15% cost)</option>
							</select>
						</div>

						<div>
							<label className={labelClass}>Agnes Skill</label>
							<select
								value={agnesLevel}
								onChange={(e) => setAgnesLevel(e.target.value)}
								className={selectDarkClass}
							>
								<option value="0">Off</option>
								<option value="1">Level 1 (-2h)</option>
								<option value="2">Level 2 (-4h)</option>
								<option value="3">Level 3 (-6h)</option>
								<option value="4">Level 4 (-8h)</option>
								<option value="5">Level 5 (-10h)</option>
							</select>
						</div>

						<div>
							<label className={labelClass}>Valerie Skill</label>
							<select
								value={valeriaLevel}
								onChange={(e) => setValeriaLevel(e.target.value)}
								className={selectDarkClass}
							>
								<option value="0">Off</option>
								<option value="1">Level 1 (+2% SvS)</option>
								<option value="2">Level 2 (+4% SvS)</option>
								<option value="3">Level 3 (+6% SvS)</option>
								<option value="4">Level 4 (+8% SvS)</option>
								<option value="5">Level 5 (+10% SvS)</option>
								<option value="6">Level 6 (+12% SvS)</option>
								<option value="7">Level 7 (+14% SvS)</option>
								<option value="8">Level 8 (+16% SvS)</option>
								<option value="9">Level 9 (+18% SvS)</option>
								<option value="10">Level 10 (+20% SvS)</option>
							</select>
						</div>

						<div className="border-t border-white/20 pt-3">
							<p className="text-xs font-bold">Additional Bonus</p>

							<div className="mt-2 flex items-center justify-between">
								<p className="text-[11px] text-[#9a9a9a]">
									Double Time +20%
								</p>

								<button
									type="button"
									onClick={() => setDoubleTime((prev) => !prev)}
									className={`relative h-[18px] w-[34px] rounded-full transition ${
										doubleTime ? "bg-[#f6bd32]" : "bg-[#777]"
									}`}
								>
									<span
										className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition ${
											doubleTime ? "left-[17px]" : "left-0.5"
										}`}
									/>
								</button>
							</div>
						</div>
					</div>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4 pt-1">
				<button
					type="submit"
					className="h-10 rounded-full bg-[#f7b72c] text-xs font-bold text-black"
				>
					Submit
				</button>

				<button
					type="button"
					onClick={handleReset}
					className="h-10 rounded-full bg-[#777] text-xs font-bold text-white"
				>
					Reset
				</button>
			</div>
		</form>
	);
}