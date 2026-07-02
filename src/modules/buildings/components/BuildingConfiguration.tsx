"use client";

import { ChevronUp } from "lucide-react";
import { useState } from "react";
import BuildingSelect from "./BuildingSelect";

type BuildingConfigurationProps = {
	constructionSpeed: string;
	setConstructionSpeed: (value: string) => void;
	petLevel: string;
	setPetLevel: (value: string) => void;
	vpLevel: string;
	setVpLevel: (value: string) => void;
	zinmanSkill: string;
	setZinmanSkill: (value: string) => void;
	valeriaBonus: string;
	setValeriaBonus: (value: string) => void;
	doubleTime: boolean;
	setDoubleTime: (value: boolean) => void;
};

export default function BuildingConfiguration({
	constructionSpeed,
	setConstructionSpeed,
	petLevel,
	setPetLevel,
	vpLevel,
	setVpLevel,
	zinmanSkill,
	setZinmanSkill,
	valeriaBonus,
	setValeriaBonus,
	doubleTime,
	setDoubleTime,
}: BuildingConfigurationProps) {
	const [open, setOpen] = useState(false);

	return (
		<div className="mt-6 rounded-2xl border-2 border-[#009DFF] bg-[#353535] p-4">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				className="flex w-full items-center justify-between"
			>
				<h3 className="text-base font-semibold text-white">Configuration</h3>

				<ChevronUp
					size={20}
					className={`transition-transform ${open ? "" : "rotate-180"}`}
				/>
			</button>

			{open && (
				<div className="mt-6">
					<label className="mb-2 block text-sm text-zinc-300">
						Construction Speed %
					</label>

					<input
						type="text"
						inputMode="decimal"
						value={constructionSpeed}
						onChange={(event) => setConstructionSpeed(event.target.value)}
						placeholder="0"
						className="h-12 w-full rounded-xl bg-[#292929] px-4 text-sm text-white outline-none"
					/>

					<div className="mt-5 grid grid-cols-2 gap-3">
						<div>
							<label className="mb-2 block text-sm text-zinc-300">
								Pet Skill
							</label>

							<BuildingSelect
								value={petLevel}
								onChange={setPetLevel}
								options={["Off", "Lv.1", "Lv.2", "Lv.3", "Lv.4", "Lv.5"]}
								dark
							/>
						</div>

						<div>
							<label className="mb-2 block text-sm text-zinc-300">VP</label>

							<BuildingSelect
								value={vpLevel}
								onChange={setVpLevel}
								options={["Off", "15%", "25%"]}
								dark
							/>
						</div>
					</div>

					<label className="mt-5 mb-2 block text-sm text-zinc-300">
						Zinman Skill
					</label>

					<BuildingSelect
						value={zinmanSkill}
						onChange={setZinmanSkill}
						options={["Off", "Lv.1", "Lv.2", "Lv.3", "Lv.4", "Lv.5"]}
						dark
					/>

					<label className="mt-5 mb-2 block text-sm text-zinc-300">
						Valeria Bonus %
					</label>

					<input
						type="text"
						inputMode="decimal"
						value={valeriaBonus}
						onChange={(event) => setValeriaBonus(event.target.value)}
						placeholder="0"
						className="h-12 w-full rounded-xl bg-[#292929] px-4 text-sm text-white outline-none"
					/>

					<div className="my-6 h-px bg-zinc-500" />

					<h4 className="text-base font-semibold text-white">
						Additional Bonus
					</h4>

					<div className="mt-5 flex items-center justify-between">
						<span className="text-sm text-zinc-400">Double Time + 20%</span>

						<label className="relative inline-flex cursor-pointer items-center">
							<input
								type="checkbox"
								checked={doubleTime}
								onChange={(event) => setDoubleTime(event.target.checked)}
								className="peer sr-only"
							/>

							<span className="h-6 w-11 rounded-full bg-[#292929] transition peer-checked:bg-[#FFC632]" />

							<span className="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
						</label>
					</div>
				</div>
			)}
		</div>
	);
}