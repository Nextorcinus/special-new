"use client";

type ValeriaSkillSelectorProps = {
	level: number;
	onLevelChange: (level: number) => void;
};

export default function ValeriaSkillSelector({
	level,
	onLevelChange,
}: ValeriaSkillSelectorProps) {
	const bonusPercent = level * 2;
	const multiplier = 1 + bonusPercent / 100;

	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<div className="space-y-1">
				<h3 className="text-sm font-semibold text-foreground">
					Valeria Skill Bonus
				</h3>

				<p className="text-xs text-muted-foreground">Applies to every stage</p>
			</div>

			<div className="flex items-center gap-3">
				<span className="text-xs font-medium text-violet-400">
					×{multiplier.toFixed(2)}
				</span>

				<select
					value={level}
					onChange={(event) => onLevelChange(Number(event.target.value))}
					aria-label="Valeria skill level"
					className="h-9 min-w-36 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-blue-500"
				>
					<option value={0}>Off · 0%</option>

					{Array.from({ length: 10 }, (_, index) => {
						const currentLevel = index + 1;
						const bonus = currentLevel * 2;

						return (
							<option key={currentLevel} value={currentLevel}>
								Level {currentLevel} · +{bonus}%
							</option>
						);
					})}
				</select>
			</div>
		</div>
	);
}
