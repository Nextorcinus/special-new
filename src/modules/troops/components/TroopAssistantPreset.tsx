"use client";

type TroopRatio = [number, number, number];

type TroopAssistantPresetProps = {
	current: TroopRatio;
	onSelect: (ratio: TroopRatio) => void;
};

type Preset = {
	name: string;
	value: TroopRatio;
};

const PRESETS: Preset[] = [
	{
		name: "Inf Focus",
		value: [5, 3, 2],
	},
	{
		name: "Balanced",
		value: [3, 3, 4],
	},
	{
		name: "Marksman Meta",
		value: [1, 2, 7],
	},
];

export default function TroopAssistantPreset({
	current,
	onSelect,
}: TroopAssistantPresetProps) {
	return (
		<div>
			<div className="mb-2 text-sm text-white/70">Preset ratio</div>

			<div className="flex flex-wrap gap-2">
				{PRESETS.map((preset) => {
					const isActive = preset.value.join() === current.join();

					return (
						<button
							key={preset.name}
							type="button"
							onClick={() => onSelect(preset.value)}
							className={`
								rounded-md
								border
								px-3
								py-1
								text-sm
								transition
								${
									isActive
										? "border-cyan-300 bg-cyan-400/30 text-cyan-200"
										: "border-cyan-300/80 bg-white/5 text-cyan-100/90 hover:bg-white/10"
								}
							`}
						>
							{preset.name}
						</button>
					);
				})}
			</div>
		</div>
	);
}
