"use client";

import { useMemo } from "react";
import type {
	Mission,
	MissionRangeSelection,
	MissionSelection,
} from "../utils/calculatePoints";
import {
	calculateMissionPoints,
	calculateMissionRangePoints,
	formatPoints,
	getMissionPoints,
} from "../utils/calculatePoints";

type MissionTierValue = number | string;

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

function sameValue(
	a: MissionTierValue | null | undefined,
	b: MissionTierValue | null | undefined,
): boolean {
	return a === b || (a != null && b != null && String(a) === String(b));
}

function formatLevel(level: MissionTierValue): string {
	if (typeof level === "number") {
		return `Level ${level}`;
	}

	return level
		.replace(/[-_]/g, " ")
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatStatus(status: MissionTierValue): string {
	if (typeof status === "number") {
		return `Status ${status}`;
	}

	return status
		.replace(/[-_]/g, " ")
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

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
	const isRangeMission = mission.pointsPerScore !== undefined;
	const isPetAdvancementMission = mission.id === "petAdvancementScore";

	const boostedPointsPerScore =
		pointsPerScore + Math.floor((pointsPerScore * bonusPercent) / 100);

	const defaultEndpoint: MissionSelection = {
		level: levels[0]?.level ?? 0,
		status: null,
	};

	const activeRange: MissionRangeSelection = rangeSelection ?? {
		from: { ...defaultEndpoint },
		to: { ...defaultEndpoint },
	};

	const getLevelIndex = (levelValue: MissionTierValue) =>
		levels.findIndex((item) => sameValue(item.level, levelValue));

	const fromLevelIndex = getLevelIndex(activeRange.from.level);
	const toLevelIndex = getLevelIndex(activeRange.to.level);

	const selectedLevel = useMemo(
		() =>
			levels.find((item) => sameValue(item.level, selection.level)) ??
			levels[0],
		[levels, selection.level],
	);

	const statuses = selectedLevel?.statuses ?? [];
	const hasStatuses = statuses.length > 0;

	const activeSelection: MissionSelection = {
		level: selectedLevel?.level ?? 0,
		status:
			!isPetAdvancementMission &&
			selection.status !== null &&
			statuses.some((item) => sameValue(item.status, selection.status))
				? selection.status
				: null,
	};

	const basePointsEach = getMissionPoints(mission, activeSelection);

	const pointsEach =
		basePointsEach + Math.floor((basePointsEach * bonusPercent) / 100);

	const basePoints = calculateMissionPoints(mission, activeSelection);

	const finalPoints =
		basePoints + Math.floor((basePoints * bonusPercent) / 100);

	// Calculate range using progression steps instead of subtracting
	// the displayed endpoint point values.
	const baseRangePoints = calculateMissionRangePoints(mission, activeRange);

	// The helper returns score increase multiplied by the original
	// pointsPerScore. Convert it back to score increase, then apply
	// the Baldur-adjusted points per score.
	const rangeScoreIncrease =
		pointsPerScore > 0 ? baseRangePoints / pointsPerScore : 0;

	const finalRangePoints = rangeScoreIncrease * boostedPointsPerScore;

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

	const changeLevel = (value: string) => {
		const nextLevel = levels.find((item) => sameValue(item.level, value));

		if (!nextLevel) return;

		onSelectionChange({
			level: nextLevel.level,
			status: null,
		});
	};

	const changeStatus = (value: string) => {
		const status =
			value === ""
				? null
				: (statuses.find((item) => sameValue(item.status, value))?.status ??
					null);

		if (value !== "" && status === null) return;

		onSelectionChange({
			level: selectedLevel?.level ?? 0,
			status,
		});
	};

	const updateRangeEndpoint = (
		endpoint: "from" | "to",
		levelValue: string,
		statusValue: string | null,
	) => {
		const nextLevelIndex = getLevelIndex(levelValue);
		const nextLevel = levels[nextLevelIndex];

		if (!nextLevel) return;

		const availableStatuses = nextLevel.statuses ?? [];

		const nextStatus =
			statusValue === null || statusValue === ""
				? null
				: (availableStatuses.find((item) => sameValue(item.status, statusValue))
						?.status ?? null);

		if (statusValue && nextStatus === null) return;

		if (endpoint === "from") {
			if (nextLevelIndex > toLevelIndex) {
				onRangeSelectionChange?.({
					from: {
						level: nextLevel.level,
						status: nextStatus,
					},
					to: {
						level: nextLevel.level,
						status: null,
					},
				});

				return;
			}

			onRangeSelectionChange?.({
				...activeRange,
				from: {
					level: nextLevel.level,
					status: nextStatus,
				},
			});

			return;
		}

		// Prevent To from selecting a level earlier than From.
		if (nextLevelIndex < fromLevelIndex) return;

		onRangeSelectionChange?.({
			...activeRange,
			to: {
				level: nextLevel.level,
				status: nextStatus,
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

	const renderRangeEndpoint = (label: string, endpoint: "from" | "to") => {
		const value = activeRange[endpoint];

		const endpointLevel = levels.find((item) =>
			sameValue(item.level, value.level),
		);

		const endpointStatuses = endpointLevel?.statuses ?? [];

		const safeStatus =
			value.status !== null &&
			endpointStatuses.some((item) => sameValue(item.status, value.status))
				? value.status
				: null;

		const endpointPoints = getMissionPoints(mission, {
			level: endpointLevel?.level ?? value.level,
			status: safeStatus,
		});

		return (
			<div className="min-w-0 space-y-2">
				<label className="text-xs font-semibold text-[var(--sl-text-muted)]">
					{label}
				</label>

				<select
					aria-label={`${label} level for ${mission.name}`}
					value={String(value.level)}
					onChange={(event) =>
						updateRangeEndpoint(endpoint, event.target.value, null)
					}
					className="h-9 w-full min-w-0 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-xs text-[var(--sl-text)] outline-none focus:border-[var(--sl-primary)]"
				>
					{levels.map((item, levelIndex) => (
						<option
							key={String(item.level)}
							value={String(item.level)}
							disabled={endpoint === "to" && levelIndex < fromLevelIndex}
						>
							{formatLevel(item.level)}
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
							String(value.level),
							event.target.value,
						)
					}
					className="h-9 w-full min-w-0 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-xs text-[var(--sl-text)] outline-none focus:border-[var(--sl-primary)] disabled:cursor-not-allowed disabled:opacity-40"
				>
					<option value="">
						{endpointStatuses.length ? "Base Level" : "No Status"}
					</option>

					{endpointStatuses.map((item) => (
						<option key={String(item.status)} value={String(item.status)}>
							{formatStatus(item.status)}
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
					<div
						className={`mt-3 grid gap-2 ${
							isPetAdvancementMission ? "grid-cols-1" : "grid-cols-2"
						}`}
					>
						<select
							aria-label={`Level for ${mission.name}`}
							value={String(selectedLevel?.level ?? "")}
							onChange={(event) => changeLevel(event.target.value)}
							className="h-9 min-w-0 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-xs text-[var(--sl-text)] outline-none focus:border-[var(--sl-primary)]"
						>
							{levels.map((item) => (
								<option key={String(item.level)} value={String(item.level)}>
									{formatLevel(item.level)}
								</option>
							))}
						</select>

						{!isPetAdvancementMission && (
							<select
								aria-label={`Status for ${mission.name}`}
								value={
									activeSelection.status === null
										? ""
										: String(activeSelection.status)
								}
								disabled={!hasStatuses}
								onChange={(event) => changeStatus(event.target.value)}
								className="h-9 min-w-0 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-xs text-[var(--sl-text)] outline-none focus:border-[var(--sl-primary)] disabled:cursor-not-allowed disabled:opacity-40"
							>
								<option value="">Base Level</option>

								{statuses.map((item) => (
									<option key={String(item.status)} value={String(item.status)}>
										{formatStatus(item.status)}
									</option>
								))}
							</select>
						)}
					</div>

					<div className="mt-2 flex items-center gap-1.5">
						<button
							type="button"
							aria-label={`Decrease ${mission.name}`}
							disabled={mission.quantity <= 0}
							onClick={() => changeQuantity(mission.quantity - 1)}
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
							onChange={(event) => changeQuantity(Number(event.target.value))}
							className="h-8 min-w-0 flex-1 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-center text-sm font-medium text-[var(--sl-text)] outline-none focus:border-[var(--sl-primary)]"
						/>

						<button
							type="button"
							aria-label={`Increase ${mission.name}`}
							disabled={
								mission.maxQuantity !== undefined &&
								mission.quantity >= mission.maxQuantity
							}
							onClick={() => changeQuantity(mission.quantity + 1)}
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
