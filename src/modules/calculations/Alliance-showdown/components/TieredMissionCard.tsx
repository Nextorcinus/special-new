"use client";

import { useMemo } from "react";
import type {
	Mission,
	MissionRangeSelection,
	MissionSelection,
} from "../utils/calculatePoints";
import {
	calculateMissionPoints,
	formatPoints,
	getMissionPoints,
} from "../utils/calculatePoints";

type TieredMissionCardProps = {
	mission: Mission;
	index: number;
	selection: MissionSelection;
	onSelectionChange: (selection: MissionSelection) => void;
	onQuantityChange: (quantity: number) => void;
	rangeSelection?: MissionRangeSelection;
	onRangeSelectionChange?: (selection: MissionRangeSelection) => void;
	baldurBonusPercent?: number;
};

export default function TieredMissionCard({
	mission,
	index,
	selection,
	onSelectionChange,
	onQuantityChange,
	rangeSelection,
	onRangeSelectionChange,
	baldurBonusPercent = 0,
}: TieredMissionCardProps) {
	const levels = mission.levels ?? [];
	const bonusPercent = Math.max(0, baldurBonusPercent);
	const pointsPerScore = Math.max(0, mission.pointsPerScore ?? 0);

	const boostedPointsPerScore =
		pointsPerScore +
		Math.floor((pointsPerScore * bonusPercent) / 100);

	const defaultEndpoint: MissionSelection = {
		level: levels[0]?.level ?? 0,
		status: null,
	};

	const activeRange: MissionRangeSelection = rangeSelection ?? {
		from: { ...defaultEndpoint },
		to: { ...defaultEndpoint },
	};

	const selectedLevel = useMemo(
		() => levels.find((item) => item.level === selection.level) ?? levels[0],
		[levels, selection.level],
	);

	const statuses = selectedLevel?.statuses ?? [];
	const hasStatuses = statuses.length > 0;

	const activeSelection: MissionSelection = {
		level: selectedLevel?.level ?? 0,
		status:
			selection.status !== null &&
			statuses.some((item) => item.status === selection.status)
				? selection.status
				: null,
	};

	const isRangeMission = mission.pointsPerScore !== undefined;

	const basePointsEach = getMissionPoints(mission, activeSelection);

	const pointsEach =
		basePointsEach +
		Math.floor((basePointsEach * bonusPercent) / 100);

	const rangeFromPoints = getMissionPoints(mission, activeRange.from);
	const rangeToPoints = getMissionPoints(mission, activeRange.to);

	const rangeScoreDifference = Math.max(
		0,
		rangeToPoints - rangeFromPoints,
	);

	const finalRangePoints = rangeScoreDifference * boostedPointsPerScore;

	const basePoints = calculateMissionPoints(mission, activeSelection);

	const finalPoints =
		basePoints + Math.floor((basePoints * bonusPercent) / 100);

	const backgroundClass =
		index % 2 === 0
			? "bg-[var(--sl-surface)]"
			: "bg-[var(--sl-surface-2,var(--sl-surface))]";

	const priorityClass =
		mission.priority === "great"
			? "bg-[var(--sl-success)]/10 text-[var(--sl-success)]"
			: mission.priority === "medium"
				? "bg-[var(--sl-warning)]/10 text-[var(--sl-warning)]"
				: "bg-[var(--sl-text-muted)]/10 text-[var(--sl-text-muted)]";

	const changeLevel = (level: number) => {
		const nextLevel = levels.find((item) => item.level === level);

		if (!nextLevel) return;

		onSelectionChange({
			level: nextLevel.level,
			status: null,
		});
	};

	const changeStatus = (value: string) => {
		const status = value === "" ? null : Number(value);

		if (
			status !== null &&
			(!Number.isFinite(status) ||
				!statuses.some((item) => item.status === status))
		) {
			return;
		}

		onSelectionChange({
			level: selectedLevel?.level ?? 0,
			status,
		});
	};

	const updateRangeEndpoint = (
		endpoint: "from" | "to",
		level: number,
		status: number | null,
	) => {
		const nextLevel = levels.find((item) => item.level === level);

		if (!nextLevel) return;

		const availableStatuses = nextLevel.statuses ?? [];

		const safeStatus =
			status !== null &&
			availableStatuses.some((item) => item.status === status)
				? status
				: null;

		onRangeSelectionChange?.({
			...activeRange,
			[endpoint]: {
				level: nextLevel.level,
				status: safeStatus,
			},
		});
	};

	const changeQuantity = (value: number) => {
		const safeValue = Number.isFinite(value)
			? Math.max(0, Math.floor(value))
			: 0;

		const limitedValue =
			mission.maxQuantity === undefined
				? safeValue
				: Math.min(mission.maxQuantity, safeValue);

		onQuantityChange(limitedValue);
	};

	const renderRangeEndpoint = (
		label: string,
		endpoint: "from" | "to",
	) => {
		const value = activeRange[endpoint];

		const endpointLevel = levels.find(
			(item) => item.level === value.level,
		);

		const endpointStatuses = endpointLevel?.statuses ?? [];

		const safeStatus =
			value.status !== null &&
			endpointStatuses.some((item) => item.status === value.status)
				? value.status
				: null;

		const endpointPoints = getMissionPoints(mission, {
			level: value.level,
			status: safeStatus,
		});

		return (
			<div className="min-w-0 space-y-2">
				<label className="text-xs font-semibold text-[var(--sl-text-muted)]">
					{label}
				</label>

				<select
					aria-label={`${label} level for ${mission.name}`}
					value={value.level}
					onChange={(event) =>
						updateRangeEndpoint(
							endpoint,
							Number(event.target.value),
							null,
						)
					}
					className="h-9 w-full min-w-0 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-xs text-[var(--sl-text)] outline-none focus:border-[var(--sl-primary)]"
				>
					{levels.map((item) => (
						<option key={item.level} value={item.level}>
							Level {item.level}
						</option>
					))}
				</select>

				<select
					aria-label={`${label} status for ${mission.name}`}
					value={safeStatus === null ? "" : String(safeStatus)}
					disabled={!endpointStatuses.length}
					onChange={(event) =>
						updateRangeEndpoint(
							endpoint,
							value.level,
							event.target.value === ""
								? null
								: Number(event.target.value),
						)
					}
					className="h-9 w-full min-w-0 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-xs text-[var(--sl-text)] outline-none focus:border-[var(--sl-primary)] disabled:cursor-not-allowed disabled:opacity-40"
				>
					<option value="">Base Level</option>
					{endpointStatuses.map((item) => (
						<option key={item.status} value={item.status}>
							Status {item.status}
						</option>
					))}
				</select>

				<p className="text-xs text-[var(--sl-text-muted)]">
					{formatPoints(endpointPoints)} pts
				</p>
			</div>
		);
	};

	return (
		<article
			className={`min-w-0 rounded-xl border border-[var(--sl-border)] ${backgroundClass} p-3 transition-colors duration-200 hover:border-[var(--sl-primary)]/40`}
		>
			<div className="flex items-start justify-between gap-3">
				<h3 className="min-w-0 flex-1 text-sm font-medium leading-snug text-[var(--sl-text)]">
					{mission.name}
				</h3>

				<span
					className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${priorityClass}`}
				>
					★{" "}
					{mission.priority === "great"
						? "Great"
						: mission.priority === "medium"
							? "Medium"
							: "Low"}
				</span>
			</div>

			{isRangeMission ? (
				<div className="mt-3 space-y-3">
					<div className="grid grid-cols-2 gap-3">
						{renderRangeEndpoint("From", "from")}
						{renderRangeEndpoint("To", "to")}
					</div>

					<div className="rounded-lg border border-[var(--sl-border)] p-3">
						<div className="flex items-center justify-between gap-2">
							<span className="text-xs text-[var(--sl-text-muted)]">
								Points per score
							</span>

							<span className="text-sm font-semibold text-[var(--sl-text)]">
								{formatPoints(boostedPointsPerScore)}
							</span>
						</div>

						<div className="mt-2 flex items-center justify-between gap-2 border-t border-[var(--divider)] pt-2">
							<span className="text-xs font-medium text-[var(--sl-text-muted)]">
								Total range points
							</span>

							<span className="text-sm font-semibold tabular-nums text-[var(--sl-success)]">
								{formatPoints(finalRangePoints)}
							</span>
						</div>
					</div>
				</div>
			) : (
				<>
					<div className="mt-3 grid grid-cols-2 gap-2">
						<select
							aria-label={`Level for ${mission.name}`}
							value={selectedLevel?.level ?? ""}
							onChange={(event) =>
								changeLevel(Number(event.target.value))
							}
							className="h-9 min-w-0 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-xs text-[var(--sl-text)] outline-none focus:border-[var(--sl-primary)]"
						>
							{levels.map((item) => (
								<option key={item.level} value={item.level}>
									Level {item.level}
								</option>
							))}
						</select>

						<select
							aria-label={`Status for ${mission.name}`}
							value={
								activeSelection.status === null
									? ""
									: String(activeSelection.status)
							}
							disabled={!hasStatuses}
							onChange={(event) =>
								changeStatus(event.target.value)
							}
							className="h-9 min-w-0 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-xs text-[var(--sl-text)] outline-none focus:border-[var(--sl-primary)] disabled:cursor-not-allowed disabled:opacity-40"
						>
							<option value="">Base Level</option>
							{statuses.map((item) => (
								<option key={item.status} value={item.status}>
									Status {item.status}
								</option>
							))}
						</select>
					</div>

					<div className="mt-2 flex items-center gap-1.5">
						<button
							type="button"
							aria-label={`Decrease ${mission.name}`}
							disabled={mission.quantity <= 0}
							onClick={() =>
								changeQuantity(mission.quantity - 1)
							}
							className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-input-hover)] disabled:cursor-not-allowed disabled:opacity-40"
						>
							−
						</button>

						<input
							type="number"
							min={0}
							max={mission.maxQuantity}
							step={1}
							value={mission.quantity}
							aria-label={`Quantity for ${mission.name}`}
							onChange={(event) =>
								changeQuantity(Number(event.target.value))
							}
							className="h-8 min-w-0 flex-1 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-center text-sm font-medium text-[var(--sl-text)] outline-none focus:border-[var(--sl-primary)]"
						/>

						<button
							type="button"
							aria-label={`Increase ${mission.name}`}
							disabled={
								mission.maxQuantity !== undefined &&
								mission.quantity >= mission.maxQuantity
							}
							onClick={() =>
								changeQuantity(mission.quantity + 1)
							}
							className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-input-hover)] disabled:cursor-not-allowed disabled:opacity-40"
						>
							+
						</button>
					</div>

					<div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--divider)] pt-2.5">
						<span className="text-[11px] leading-relaxed text-[var(--sl-text-muted)]">
							{formatPoints(pointsEach)} pts each
						</span>

						<span
							className={`text-xs font-semibold tabular-nums ${
								finalPoints > 0
									? "text-[var(--sl-success)]"
									: "text-[var(--sl-text-muted)]"
							}`}
						>
							{formatPoints(finalPoints)} pts
						</span>
					</div>
				</>
			)}
		</article>
	);
}
