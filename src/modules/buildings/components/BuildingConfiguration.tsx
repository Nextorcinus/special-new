"use client";

import { ChevronUp } from "lucide-react";
import { useState } from "react";

import SLInput from "@/components/ui/sl-ui/SLInput";
import SLSelect from "@/components/ui/sl-ui/SLSelect";
import SLSwitch from "@/components/ui/sl-ui/SLSwitch";

type BuildingConfigurationProps = {
	constructionSpeed: string;
	setConstructionSpeed: (value: string) => void;
	petLevel: string;
	setPetLevel: (value: string) => void;
	vpLevel: string;
	setVpLevel: (value: string) => void;
	zinmanSkill: string;
	setZinmanSkill: (value: string) => void;
	agnesLevel: string;
	setAgnesLevel: (value: string) => void;
	valeriaLevel: string;
	setValeriaLevel: (value: string) => void;
	doubleTime: boolean;
	setDoubleTime: (value: boolean) => void;
};

const labelClass = "mb-1 block text-[11px] text-[var(--sl-muted)]";

const fieldClass =
	"h-10 rounded-lg border border-white/10 bg-[#292929] px-4 text-xs text-white";

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
function FieldLabel({ children }: { children: React.ReactNode }) {
	return <p className={labelClass}>{children}</p>;
}

export default function BuildingConfiguration({
	constructionSpeed,
	setConstructionSpeed,
	petLevel,
	setPetLevel,
	vpLevel,
	setVpLevel,
	zinmanSkill,
	setZinmanSkill,
	agnesLevel,
	setAgnesLevel,
	valeriaLevel,
	setValeriaLevel,
	doubleTime,
	setDoubleTime,
}: BuildingConfigurationProps) {
	const [open, setOpen] = useState(true);

	return (
		<div className="relative z-10 overflow-visible rounded-[14px] bg-[var(--input)] p-3">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				className="flex w-full items-center justify-between text-left"
			>
				<span className="text-xs text-[var(--sl-text-muted)]">
					Configuration
				</span>

				<ChevronUp
					size={15}
					className={`text-white/70 transition-transform ${
						open ? "" : "rotate-180"
					}`}
				/>
			</button>

			{open && (
				<div className="mt-4 space-y-3 overflow-visible">
					<div className="space-y-1.5">
						<FieldLabel>Construction Speed %</FieldLabel>

						<SLInput
							type="text"
							inputMode="decimal"
							value={constructionSpeed}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
								setConstructionSpeed(event.target.value)
							}
							placeholder="e.g. 68 for 68%"
							className={fieldClass}
						/>
					</div>

					<div className="relative z-[80] grid grid-cols-2 gap-3 overflow-visible">
						<div className="relative z-[82] space-y-1.5 overflow-visible">
							<FieldLabel>Pet Skill</FieldLabel>

							<SLSelect
								value={petLevel}
								onChange={(value: string) => setPetLevel(value)}
								options={petOptions}
								className={fieldClass}
							/>
						</div>

						<div className="relative z-[81] space-y-1.5 overflow-visible">
							<FieldLabel>VP</FieldLabel>

							<SLSelect
								value={vpLevel}
								onChange={(value: string) => setVpLevel(value)}
								options={vpOptions}
								className={fieldClass}
							/>
						</div>
					</div>

					<div className="relative z-[70] space-y-1.5 overflow-visible pb-1">
						<FieldLabel>Zinman Skill</FieldLabel>

						<SLSelect
							value={zinmanSkill}
							onChange={(value: string) => setZinmanSkill(value)}
							options={zinmanOptions}
							className={fieldClass}
						/>
					</div>

					<div className="relative z-[60] space-y-1.5 overflow-visible pb-1">
						<FieldLabel>Agnes Skill</FieldLabel>

						<SLSelect
							value={agnesLevel}
							onChange={(value: string) => setAgnesLevel(value)}
							options={agnesOptions}
							className={fieldClass}
						/>
					</div>

					<div className="relative z-[50] space-y-1.5 overflow-visible">
						<FieldLabel>Valerie Skill</FieldLabel>

						<SLSelect
							value={valeriaLevel}
							onChange={(value: string) => setValeriaLevel(value)}
							options={valeriaOptions}
							className={fieldClass}
						/>
					</div>

					<div className="relative z-10 border-t border-white/20 pt-3">
						<p className="text-xs font-bold text-white">Additional Bonus</p>

						<div className="mt-3 flex items-center justify-between">
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
	);
}
