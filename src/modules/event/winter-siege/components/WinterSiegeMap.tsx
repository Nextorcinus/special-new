"use client";

import {
	ArrowDown,
	GripVertical,
	MapPin,
	Shield,
	Swords,
	X,
	Zap,
} from "lucide-react";
import type { CSSProperties, DragEvent } from "react";
import { useMemo, useState } from "react";

import type {
	WinterSiegeAssignment,
	WinterSiegeSquad,
} from "../types/winter-siege.types";

/*
|--------------------------------------------------------------------------
| Map Types
|--------------------------------------------------------------------------
*/

type WinterSiegeLocationType = "base" | "gate" | "stronghold";

type WinterSiegeMapLocation = {
	id: string;
	name: string;
	type: WinterSiegeLocationType;

	desktopX: number;
	desktopY: number;

	mobileX: number;
	mobileY: number;

	maxSquads: number;
};

/*
|--------------------------------------------------------------------------
| Winter Siege Map Layout
|--------------------------------------------------------------------------
|
| Desktop:
|
|              Gate 1   Gate 2   Gate 3
|
|                 SH 1       SH 2
|
|                     Base
|
|
| Mobile:
|
|            Gate 1 Gate 2 Gate 3
|
|              SH 1      SH 2
|
|                   Base
|
|--------------------------------------------------------------------------
*/

const WINTER_SIEGE_MAP_LOCATIONS: WinterSiegeMapLocation[] = [
	{
		id: "gate-1",
		name: "Gate 1",
		type: "gate",

		desktopX: 22,
		desktopY: 22,

		mobileX: 18,
		mobileY: 21,

		maxSquads: 2,
	},
	{
		id: "gate-2",
		name: "Gate 2",
		type: "gate",

		desktopX: 50,
		desktopY: 22,

		mobileX: 50,
		mobileY: 21,

		maxSquads: 2,
	},
	{
		id: "gate-3",
		name: "Gate 3",
		type: "gate",

		desktopX: 78,
		desktopY: 22,

		mobileX: 82,
		mobileY: 21,

		maxSquads: 2,
	},
	{
		id: "stronghold-1",
		name: "Stronghold 1",
		type: "stronghold",

		desktopX: 34,
		desktopY: 52,

		mobileX: 30,
		mobileY: 51,

		maxSquads: 3,
	},
	{
		id: "stronghold-2",
		name: "Stronghold 2",
		type: "stronghold",

		desktopX: 66,
		desktopY: 52,

		mobileX: 70,
		mobileY: 51,

		maxSquads: 3,
	},
	{
		id: "base",
		name: "Base",
		type: "base",

		desktopX: 50,
		desktopY: 82,

		mobileX: 50,
		mobileY: 81,

		maxSquads: 4,
	},
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function createSquadKey(memberId: string, squadId: string) {
	return `${memberId}:${squadId}`;
}

function getSquadKey(squad: WinterSiegeSquad) {
	return createSquadKey(squad.memberId, squad.squadId);
}

function formatPower(value: unknown): string {
	if (value === null || value === undefined) {
		return "-";
	}

	const raw = String(value).trim();

	if (!raw) {
		return "-";
	}

	/*
	 * Already formatted values such as:
	 *
	 * 912M
	 * 2.256B
	 * 8.731B
	 */
	if (/[KMBT]$/i.test(raw)) {
		return raw;
	}

	if (!/^[\d,.]+$/.test(raw)) {
		return raw;
	}

	const number = Number(raw.replace(/,/g, ""));

	if (!Number.isFinite(number)) {
		return raw;
	}

	if (number >= 1_000_000_000_000) {
		return `${(number / 1_000_000_000_000).toLocaleString("en-US", {
			maximumFractionDigits: 3,
		})}T`;
	}

	if (number >= 1_000_000_000) {
		return `${(number / 1_000_000_000).toLocaleString("en-US", {
			maximumFractionDigits: 3,
		})}B`;
	}

	if (number >= 1_000_000) {
		return `${(number / 1_000_000).toLocaleString("en-US", {
			maximumFractionDigits: 3,
		})}M`;
	}

	if (number >= 1_000) {
		return `${(number / 1_000).toLocaleString("en-US", {
			maximumFractionDigits: 3,
		})}K`;
	}

	return number.toLocaleString("en-US");
}

function getLocationIcon(type: WinterSiegeLocationType) {
	switch (type) {
		case "base":
			return <Shield className="size-4" />;

		case "gate":
			return <ArrowDown className="size-4" />;

		case "stronghold":
			return <Swords className="size-4" />;

		default:
			return <MapPin className="size-4" />;
	}
}

function getLocationTheme(type: WinterSiegeLocationType) {
	switch (type) {
		case "base":
			return {
				container: "border-white/25 bg-white/[0.035]",
				icon: "bg-white/10 text-white/80",
				title: "text-white",
			};

		case "gate":
			return {
				container: "border-sky-500/35 bg-sky-500/[0.045]",
				icon: "bg-sky-500/10 text-sky-400",
				title: "text-sky-400",
			};

		case "stronghold":
			return {
				container: "border-red-500/35 bg-red-500/[0.045]",
				icon: "bg-red-500/10 text-red-400",
				title: "text-red-400",
			};

		default:
			return {
				container: "border-white/10 bg-white/5",
				icon: "bg-white/10 text-white/60",
				title: "text-white",
			};
	}
}

/*
|--------------------------------------------------------------------------
| Component Props
|--------------------------------------------------------------------------
*/

type WinterSiegeMapProps = {
	squads: WinterSiegeSquad[];

	assignments: WinterSiegeAssignment[];

	onAssign: (
		memberId: string,
		squadId: WinterSiegeAssignment["squadId"],
		locationId: string,
	) => void;

	onRemoveAssignment: (
		memberId: string,
		squadId: WinterSiegeAssignment["squadId"],
	) => void;
};

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

export default function WinterSiegeMap({
	squads,
	assignments,
	onAssign,
	onRemoveAssignment,
}: WinterSiegeMapProps) {
	const [draggingSquadId, setDraggingSquadId] = useState<string | null>(null);

	const [activeLocationId, setActiveLocationId] = useState<string | null>(null);

	/*
	|--------------------------------------------------------------------------
	| Assignment Map
	|--------------------------------------------------------------------------
	*/

	const assignmentMap = useMemo(() => {
		const result = new Map<string, WinterSiegeAssignment>();

		for (const assignment of assignments) {
			result.set(
				createSquadKey(assignment.memberId, assignment.squadId),
				assignment,
			);
		}

		return result;
	}, [assignments]);

	/*
	|--------------------------------------------------------------------------
	| Squads By Location
	|--------------------------------------------------------------------------
	*/

	const squadsByLocation = useMemo(() => {
		const result = new Map<string, WinterSiegeSquad[]>();

		for (const location of WINTER_SIEGE_MAP_LOCATIONS) {
			result.set(location.id, []);
		}

		for (const squad of squads) {
			const assignment = assignmentMap.get(getSquadKey(squad));

			if (!assignment?.locationId) {
				continue;
			}

			const locationSquads = result.get(assignment.locationId);

			if (locationSquads) {
				locationSquads.push(squad);
			}
		}

		return result;
	}, [squads, assignmentMap]);

	/*
	|--------------------------------------------------------------------------
	| Unassigned Squads
	|--------------------------------------------------------------------------
	*/

	const unassignedSquads = useMemo(() => {
		return squads.filter((squad) => {
			const assignment = assignmentMap.get(getSquadKey(squad));

			return !assignment?.locationId;
		});
	}, [squads, assignmentMap]);

	/*
	|--------------------------------------------------------------------------
	| Stats
	|--------------------------------------------------------------------------
	*/

	const placedCount = useMemo(() => {
		return assignments.filter((assignment) => Boolean(assignment.locationId))
			.length;
	}, [assignments]);

	/*
	|--------------------------------------------------------------------------
	| Drag Handlers
	|--------------------------------------------------------------------------
	*/

	function handleDragStart(
		squad: WinterSiegeSquad,
		event: DragEvent<HTMLButtonElement>,
	) {
		const squadKey = getSquadKey(squad);

		event.dataTransfer.effectAllowed = "move";

		event.dataTransfer.setData("winter-siege-squad", squadKey);

		setDraggingSquadId(squadKey);
	}

	function handleDragEnd() {
		setDraggingSquadId(null);
		setActiveLocationId(null);
	}

	function handleDragOver(
		event: DragEvent<HTMLButtonElement>,
		location: WinterSiegeMapLocation,
	) {
		event.preventDefault();

		event.dataTransfer.dropEffect = "move";

		setActiveLocationId(location.id);
	}

	function handleDrop(
		event: DragEvent<HTMLButtonElement>,
		location: WinterSiegeMapLocation,
	) {
		event.preventDefault();

		const squadKey = event.dataTransfer.getData("winter-siege-squad");

		if (!squadKey) {
			handleDragEnd();
			return;
		}

		const squad = squads.find((item) => getSquadKey(item) === squadKey);

		if (!squad) {
			handleDragEnd();
			return;
		}

		const locationSquads = squadsByLocation.get(location.id) ?? [];

		const currentAssignment = assignmentMap.get(getSquadKey(squad));

		const alreadyHere = currentAssignment?.locationId === location.id;

		if (locationSquads.length >= location.maxSquads && !alreadyHere) {
			handleDragEnd();
			return;
		}

		onAssign(squad.memberId, squad.squadId, location.id);

		handleDragEnd();
	}

	/*
	|--------------------------------------------------------------------------
	| Quick Place
	|--------------------------------------------------------------------------
	*/

	function handleQuickPlace(
		squad: WinterSiegeSquad,
		location: WinterSiegeMapLocation,
	) {
		const locationSquads = squadsByLocation.get(location.id) ?? [];

		const currentAssignment = assignmentMap.get(getSquadKey(squad));

		const alreadyHere = currentAssignment?.locationId === location.id;

		if (locationSquads.length >= location.maxSquads && !alreadyHere) {
			return;
		}

		onAssign(squad.memberId, squad.squadId, location.id);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
			{/* Header */}
			<div className="border-b border-[var(--sl-border)] p-4 sm:p-5">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-primary)]/10 text-[var(--sl-primary)]">
							<MapPin className="size-5" />
						</div>

						<div className="min-w-0">
							<h2 className="text-sm font-bold text-[var(--sl-text)]">
								Map Placement
							</h2>

							<p className="mt-1 text-[10px] leading-4 text-[var(--sl-text-muted)]">
								Place each individual squad on the Winter Siege map.
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<div className="rounded-full bg-[var(--sl-input)] px-3 py-1.5 text-[9px] font-bold text-[var(--sl-text-muted)]">
							{placedCount} placed
						</div>

						<div className="rounded-full bg-[var(--sl-primary)]/10 px-3 py-1.5 text-[9px] font-bold text-[var(--sl-primary)]">
							{unassignedSquads.length} ready
						</div>
					</div>
				</div>
			</div>

			{/* Content */}
			<div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)]">
				{/* Squad Pool */}
				<div className="border-b border-[var(--sl-border)] p-4 xl:border-b-0 xl:border-r">
					<div className="mb-3">
						<p className="text-[9px] font-bold uppercase tracking-wider text-[var(--sl-text-muted)]">
							Ready for Placement
						</p>

						<p className="mt-1 text-[10px] leading-4 text-[var(--sl-text-muted)]">
							Drag a squad to the map or use Quick Place.
						</p>
					</div>

					<div className="space-y-2">
						{unassignedSquads.length === 0 ? (
							<div className="flex min-h-[130px] items-center justify-center rounded-xl border border-dashed border-[var(--sl-border)] px-4 text-center">
								<div>
									<Shield className="mx-auto size-5 text-[var(--sl-primary)]" />

									<p className="mt-2 text-[10px] font-bold text-[var(--sl-text)]">
										All squads placed
									</p>

									<p className="mt-1 text-[9px] leading-4 text-[var(--sl-text-muted)]">
										You can still move them to another location.
									</p>
								</div>
							</div>
						) : (
							unassignedSquads.map((squad) => (
								<DraggableSquad
									key={getSquadKey(squad)}
									squad={squad}
									isDragging={draggingSquadId === getSquadKey(squad)}
									onDragStart={handleDragStart}
									onDragEnd={handleDragEnd}
									onQuickPlace={handleQuickPlace}
								/>
							))
						)}
					</div>
				</div>

				{/* Map Area */}
				<div className="p-3 sm:p-4">
					<div className="relative h-[540px] overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-black sm:h-[600px]">
						{/* Grid */}
						<div className="pointer-events-none absolute inset-0 opacity-20">
							<div
								className="absolute inset-0"
								style={{
									backgroundImage:
										"linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
									backgroundSize: "32px 32px",
								}}
							/>
						</div>

						{/* Glow */}
						<div className="pointer-events-none absolute left-1/2 top-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--sl-primary)]/[0.025] blur-3xl sm:size-[400px]" />

						{/* Map Title */}
						<div className="absolute left-3 top-3 z-30 sm:left-4 sm:top-4">
							<div className="rounded-xl border border-white/10 bg-black/75 px-3 py-2 backdrop-blur-md">
								<p className="text-[7px] font-black uppercase tracking-[0.18em] text-white/35 sm:text-[8px]">
									Winter Siege
								</p>

								<p className="mt-0.5 text-[10px] font-black text-white sm:text-xs">
									Deployment Map
								</p>
							</div>
						</div>

						{/* Map Connections */}
						<MapConnections />

						{/* Locations */}
						{WINTER_SIEGE_MAP_LOCATIONS.map((location) => {
							const locationSquads = squadsByLocation.get(location.id) ?? [];

							const theme = getLocationTheme(location.type);

							const isActive = activeLocationId === location.id;

							const isFull = locationSquads.length >= location.maxSquads;

							const locationStyle = {
								"--desktop-x": `${location.desktopX}%`,
								"--desktop-y": `${location.desktopY}%`,
								"--mobile-x": `${location.mobileX}%`,
								"--mobile-y": `${location.mobileY}%`,
							} as CSSProperties;

							return (
								<div
									key={location.id}
									className="absolute z-20 left-[var(--mobile-x)] top-[var(--mobile-y)] sm:left-[var(--desktop-x)] sm:top-[var(--desktop-y)]"
									style={locationStyle}
								>
									<div
										className={[
											"relative -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-2 transition-all",
											"w-[112px] sm:w-[165px]",
											theme.container,
											isActive
												? "scale-105 ring-2 ring-[var(--sl-primary)] ring-offset-2 ring-offset-black"
												: "",
											isFull ? "opacity-95" : "",
										].join(" ")}
									>
										{/* Drop Target */}
										<button
											type="button"
											aria-label={`Place squad at ${location.name}`}
											onDragOver={(event) => handleDragOver(event, location)}
											onDragLeave={() => setActiveLocationId(null)}
											onDrop={(event) => handleDrop(event, location)}
											className="absolute inset-0 z-0 rounded-2xl focus:outline-none"
										/>

										{/* Location Header */}
										<div className="pointer-events-none relative z-10 flex items-center gap-1.5 sm:gap-2">
											<div
												className={[
													"flex size-7 shrink-0 items-center justify-center rounded-lg sm:size-8 sm:rounded-xl",
													theme.icon,
												].join(" ")}
											>
												{getLocationIcon(location.type)}
											</div>

											<div className="min-w-0">
												<p
													className={[
														"truncate text-[8px] font-black sm:text-[10px]",
														theme.title,
													].join(" ")}
												>
													{location.name}
												</p>

												<p className="mt-0.5 whitespace-nowrap text-[6px] text-white/35 sm:text-[8px]">
													{locationSquads.length} / {location.maxSquads} squads
												</p>
											</div>
										</div>

										{/* Squads */}
										<div className="pointer-events-none relative z-10 mt-1.5 space-y-1 sm:mt-2">
											{locationSquads.map((squad) => (
												<MapSquad
													key={getSquadKey(squad)}
													squad={squad}
													onRemove={() =>
														onRemoveAssignment(squad.memberId, squad.squadId)
													}
												/>
											))}

											{locationSquads.length === 0 && (
												<div className="rounded-lg border border-dashed border-white/10 px-1.5 py-2 text-center sm:px-2">
													<p className="text-[6px] text-white/25 sm:text-[8px]">
														Drop squad here
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

/*
|--------------------------------------------------------------------------
| Map Connections
|--------------------------------------------------------------------------
*/

function MapConnections() {
	return (
		<>
			{/* Desktop connections */}
			<div className="pointer-events-none absolute inset-0 hidden sm:block">
				{/* Gate row */}
				<div className="absolute left-[22%] top-[22%] h-px w-[56%] bg-white/10" />

				{/* Stronghold row */}
				<div className="absolute left-[34%] top-[52%] h-px w-[32%] bg-white/10" />

				{/* Base to Strongholds */}
				<div className="absolute left-[50%] top-[52%] h-[30%] w-px bg-white/10" />

				{/* Gate 1 to Stronghold 1 */}
				<div className="absolute left-[22%] top-[22%] h-[34%] w-px origin-top rotate-[24deg] bg-white/5" />

				{/* Gate 2 to Stronghold 1 */}
				<div className="absolute left-[50%] top-[22%] h-[30%] w-px origin-top rotate-[28deg] bg-white/5" />

				{/* Gate 2 to Stronghold 2 */}
				<div className="absolute left-[50%] top-[22%] h-[30%] w-px origin-top rotate-[-28deg] bg-white/5" />

				{/* Gate 3 to Stronghold 2 */}
				<div className="absolute left-[78%] top-[22%] h-[34%] w-px origin-top rotate-[-24deg] bg-white/5" />
			</div>

			{/* Mobile connections */}
			<div className="pointer-events-none absolute inset-0 sm:hidden">
				{/* Gate row */}
				<div className="absolute left-[18%] top-[21%] h-px w-[64%] bg-white/10" />

				{/* Stronghold row */}
				<div className="absolute left-[30%] top-[51%] h-px w-[40%] bg-white/10" />

				{/* Base vertical route */}
				<div className="absolute left-[50%] top-[51%] h-[30%] w-px bg-white/10" />

				{/* Gate 1 to SH1 */}
				<div className="absolute left-[18%] top-[21%] h-[35%] w-px origin-top rotate-[18deg] bg-white/5" />

				{/* Gate 2 to SH1 */}
				<div className="absolute left-[50%] top-[21%] h-[31%] w-px origin-top rotate-[20deg] bg-white/5" />

				{/* Gate 2 to SH2 */}
				<div className="absolute left-[50%] top-[21%] h-[31%] w-px origin-top rotate-[-20deg] bg-white/5" />

				{/* Gate 3 to SH2 */}
				<div className="absolute left-[82%] top-[21%] h-[35%] w-px origin-top rotate-[-18deg] bg-white/5" />
			</div>
		</>
	);
}

/*
|--------------------------------------------------------------------------
| Draggable Squad
|--------------------------------------------------------------------------
*/

type DraggableSquadProps = {
	squad: WinterSiegeSquad;
	isDragging: boolean;

	onDragStart: (
		squad: WinterSiegeSquad,
		event: DragEvent<HTMLButtonElement>,
	) => void;

	onDragEnd: () => void;

	onQuickPlace: (
		squad: WinterSiegeSquad,
		location: WinterSiegeMapLocation,
	) => void;
};

function DraggableSquad({
	squad,
	isDragging,
	onDragStart,
	onDragEnd,
	onQuickPlace,
}: DraggableSquadProps) {
	const [showLocations, setShowLocations] = useState(false);

	return (
		<div
			className={[
				"rounded-xl border border-[var(--sl-border)] bg-[var(--sl-input)] p-3 transition-all",
				isDragging
					? "scale-95 opacity-40"
					: "hover:border-[var(--sl-primary)]/40",
			].join(" ")}
		>
			<div className="flex items-center gap-2">
				{/* Drag Handle */}
				<button
					type="button"
					draggable
					aria-label={`Drag ${squad.memberName} ${squad.squadName}`}
					onDragStart={(event) => onDragStart(squad, event)}
					onDragEnd={onDragEnd}
					className="flex shrink-0 cursor-grab touch-none items-center justify-center rounded-lg p-1 text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)] active:cursor-grabbing"
				>
					<GripVertical className="size-3.5" />
				</button>

				{/* Avatar */}
				<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-surface)] text-[9px] font-black text-[var(--sl-text)]">
					{squad.memberName.charAt(0).toUpperCase()}
				</div>

				{/* Member */}
				<div className="min-w-0 flex-1">
					<p className="truncate text-[10px] font-bold text-[var(--sl-text)]">
						{squad.memberName}
					</p>

					<div className="mt-1 flex items-center gap-1.5">
						<span className="rounded-full bg-[var(--sl-primary)]/10 px-1.5 py-0.5 text-[7px] font-bold text-[var(--sl-primary)]">
							{squad.squadName}
						</span>

						<span className="flex min-w-0 items-center gap-0.5 truncate text-[8px] font-semibold text-[var(--sl-text-muted)]">
							<Zap className="size-2.5 shrink-0" />

							{formatPower(squad.power)}
						</span>
					</div>
				</div>

				{/* Quick Place */}
				<button
					type="button"
					aria-label={`Quick place ${squad.memberName} ${squad.squadName}`}
					onClick={() => setShowLocations((current) => !current)}
					className="shrink-0 rounded-lg p-1.5 text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]"
				>
					<MapPin className="size-3.5" />
				</button>
			</div>

			{/* Quick Locations */}
			{showLocations && (
				<div className="mt-3 border-t border-[var(--sl-border)] pt-3">
					<div className="mb-2 flex items-center justify-between">
						<p className="text-[8px] font-bold uppercase tracking-wider text-[var(--sl-text-muted)]">
							Quick Place
						</p>

						<button
							type="button"
							aria-label="Close quick place"
							onClick={() => setShowLocations(false)}
							className="rounded-md p-1 text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]"
						>
							<X className="size-3" />
						</button>
					</div>

					<div className="grid grid-cols-2 gap-1.5">
						{WINTER_SIEGE_MAP_LOCATIONS.map((location) => (
							<button
								key={location.id}
								type="button"
								onClick={() => {
									onQuickPlace(squad, location);

									setShowLocations(false);
								}}
								className="rounded-lg bg-[var(--sl-surface)] px-2 py-2 text-left transition-colors hover:bg-[var(--sl-hover)]"
							>
								<p className="truncate text-[8px] font-bold text-[var(--sl-text)]">
									{location.name}
								</p>

								<p className="mt-0.5 text-[7px] text-[var(--sl-text-muted)]">
									{location.maxSquads} max
								</p>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

/*
|--------------------------------------------------------------------------
| Squad On Map
|--------------------------------------------------------------------------
*/

function MapSquad({
	squad,
	onRemove,
}: {
	squad: WinterSiegeSquad;
	onRemove: () => void;
}) {
	return (
		<div className="pointer-events-auto flex min-w-0 items-center gap-1.5 rounded-lg bg-black/35 px-1.5 py-1.5 sm:gap-2 sm:px-2">
			<div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white/5 text-[6px] font-black text-white sm:size-5.5 sm:text-[7px]">
				{squad.memberName.charAt(0).toUpperCase()}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate text-[6px] font-bold text-white sm:text-[8px]">
					{squad.memberName}
				</p>

				<div className="flex min-w-0 items-center gap-1">
					<span className="shrink-0 text-[5px] font-semibold text-white/45 sm:text-[7px]">
						{squad.squadName}
					</span>

					<span className="text-[5px] text-white/20 sm:text-[7px]">•</span>

					<span className="flex min-w-0 items-center gap-0.5 truncate text-[5px] font-bold text-[var(--sl-primary)] sm:text-[7px]">
						<Zap className="size-2 shrink-0 sm:size-2.5" />

						{formatPower(squad.power)}
					</span>
				</div>
			</div>

			<button
				type="button"
				aria-label={`Remove ${squad.memberName} ${squad.squadName} from location`}
				onClick={onRemove}
				className="shrink-0 rounded-md p-1 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
			>
				<X className="size-2.5 sm:size-3" />
			</button>
		</div>
	);
}
