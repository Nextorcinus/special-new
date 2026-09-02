"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import type { Expert } from "../types";

interface ExpertSelectorProps {
	generations: {
		generation: number;
		experts: Expert[];
	}[];
}

const GENERATION_STYLES: Record<
	number,
	{
		color: string;
		border: string;
		background: string;
	}
> = {
	1: {
		color: "#60a5fa",
		border: "rgba(96, 165, 250, 0.25)",
		background: "rgba(96, 165, 250, 0.04)",
	},
	2: {
		color: "#c084fc",
		border: "rgba(192, 132, 252, 0.25)",
		background: "rgba(192, 132, 252, 0.04)",
	},
	3: {
		color: "#f59e0b",
		border: "rgba(245, 158, 11, 0.25)",
		background: "rgba(245, 158, 11, 0.04)",
	},
};

const DEFAULT_STYLE = {
	color: "#60a5fa",
	border: "rgba(96, 165, 250, 0.25)",
	background: "rgba(96, 165, 250, 0.04)",
};

const UNLOCK_DAYS: Record<number, number> = {
	1: 150,
	2: 195,
	3: 240,
};

export function ExpertSelector({ generations }: ExpertSelectorProps) {
	const router = useRouter();

	function handleSelect(expertId: string) {
		router.push(`/experts/${encodeURIComponent(expertId)}`);
	}

	return (
		<div className="space-y-5">
			<div>
				<h1 className="text-xl font-semibold text-white">Select Expert</h1>

				<p className="mt-1 text-sm text-white/50">
					Choose an Expert to open its calculator.
				</p>
			</div>

			<div className="space-y-5">
				{generations.map(({ generation, experts }) => {
					if (experts.length === 0) {
						return null;
					}

					const style = GENERATION_STYLES[generation] ?? DEFAULT_STYLE;

					const unlockDay = UNLOCK_DAYS[generation] ?? 150;

					return (
						<section
							key={generation}
							className="rounded-2xl border p-3 sm:p-4"
							style={{
								borderColor: style.border,
								background: style.background,
							}}
						>
							<div className="mb-3 flex items-center justify-between gap-3">
								<div className="min-w-0">
									<h2
										className="text-sm font-bold"
										style={{
											color: style.color,
										}}
									>
										Generation {generation}
									</h2>

									<p className="mt-0.5 text-xs text-white/40">
										Unlock Day {unlockDay}
									</p>
								</div>

								<span className="shrink-0 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-white/40">
									{experts.length} Experts
								</span>
							</div>

							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
								{experts.map((expert) => (
									<button
										key={expert.id}
										type="button"
										onClick={() => handleSelect(expert.id)}
										className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.99]"
									>
										<div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
											<img
												src={`/experts/${expert.id}.png`}
												alt={expert.name}
												className="h-full w-full object-cover"
											/>
										</div>

										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<h3 className="truncate text-sm font-semibold text-white">
													{expert.name}
												</h3>

												<span className="shrink-0 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] text-white/50">
													Gen {expert.generation}
												</span>
											</div>

											<p className="mt-1 truncate text-xs text-white/40">
												{expert.focus}
											</p>
										</div>

										<ChevronRight className="h-4 w-4 shrink-0 text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/60" />
									</button>
								))}
							</div>
						</section>
					);
				})}
			</div>
		</div>
	);
}
