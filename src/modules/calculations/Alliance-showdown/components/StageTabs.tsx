"use client";

import type { ShowdownStage } from "../utils/calculatePoints";

type StageTabsProps = {
	stages: ShowdownStage[];
	activeStageId: string;
	onChange: (stageId: string) => void;
};

export default function StageTabs({
	stages,
	activeStageId,
	onChange,
}: StageTabsProps) {
	return (
		<div
			className="flex flex-wrap gap-2"
			role="tablist"
			aria-label="Alliance Showdown stages"
		>
			{stages.map((stage) => {
				const isActive = stage.id === activeStageId;

				return (
					<button
						key={stage.id}
						type="button"
						role="tab"
						aria-selected={isActive}
						onClick={() => onChange(stage.id)}
						className={[
							"rounded-lg border px-4 py-2 text-sm font-medium",
							"transition-colors duration-200",
							isActive
								? "border-blue-500 bg-blue-500/15 text-blue-400"
								: "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
						].join(" ")}
					>
						Day {stage.day}
					</button>
				);
			})}
		</div>
	);
}
