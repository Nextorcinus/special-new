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
import { useEffect, useMemo, useRef, useState } from "react";

import type {
	WinterSiegeAssignment,
	WinterSiegeSquad,
} from "../types/winter-siege.types";

type WinterSiegeLocationType = "base" | "gate" | "stronghold";

type WinterSiegeMapLocation = {
	id: string;
	name: string;
	type: WinterSiegeLocationType;
	desktopX: number;
	desktopY: number;
	mobileX: number;
	mobileY: number;
};

type EnemyLocationType = "base" | "gate" | "stronghold";

type EnemyLocation = {
	id: string;
	name: string;
	type: EnemyLocationType;
	x: number;
	y: number;
	mobileX: number;
	mobileY: number;
};

type EnemyPlanState = {
	order: number | null;
	muted: boolean;
};

type EnemyPlan = Record<string, EnemyPlanState>;

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

const MAP_STORAGE_KEY = "special-lazyness-winter-siege-enemy-plan";

const WINTER_SIEGE_MAP_LOCATIONS: WinterSiegeMapLocation[] = [
	{
		id: "gate-1",
		name: "Gate 1",
		type: "gate",
		desktopX: 20,
		desktopY: 66,
		mobileX: 20,
		mobileY: 57,
	},
	{
		id: "gate-2",
		name: "Gate 2",
		type: "gate",
		desktopX: 50,
		desktopY: 66,
		mobileX: 50,
		mobileY: 57,
	},
	{
		id: "gate-3",
		name: "Gate 3",
		type: "gate",
		desktopX: 80,
		desktopY: 66,
		mobileX: 80,
		mobileY: 57,
	},
	{
		id: "stronghold-1",
		name: "Stronghold 1",
		type: "stronghold",
		desktopX: 32,
		desktopY: 83,
		mobileX: 30,
		mobileY: 73,
	},
	{
		id: "stronghold-2",
		name: "Stronghold 2",
		type: "stronghold",
		desktopX: 68,
		desktopY: 83,
		mobileX: 70,
		mobileY: 73,
	},
	{
		id: "base",
		name: "Base",
		type: "base",
		desktopX: 50,
		desktopY: 96,
		mobileX: 50,
		mobileY: 88,
	},
];

const ENEMY_LOCATIONS: EnemyLocation[] = [
	{
		id: "enemy-stronghold-2",
		name: "Stronghold 2",
		type: "stronghold",
		x: 32,
		y: 25,
		mobileX: 30,
		mobileY: 25,
	},
	{
		id: "enemy-stronghold-1",
		name: "Stronghold 1",
		type: "stronghold",
		x: 68,
		y: 25,
		mobileX: 70,
		mobileY: 25,
	},
	{
		id: "enemy-gate-3",
		name: "Gate 3",
		type: "gate",
		x: 20,
		y: 43,
		mobileX: 20,
		mobileY: 43,
	},
	{
		id: "enemy-gate-2",
		name: "Gate 2",
		type: "gate",
		x: 50,
		y: 43,
		mobileX: 50,
		mobileY: 43,
	},
	{
		id: "enemy-gate-1",
		name: "Gate 1",
		type: "gate",
		x: 80,
		y: 43,
		mobileX: 80,
		mobileY: 43,
	},
	{
		id: "enemy-base",
		name: "Base",
		type: "base",
		x: 50,
		y: 6,
		mobileX: 50,
		mobileY: 8,
	},
];

const DEFAULT_ENEMY_PLAN: EnemyPlan = {
	"enemy-stronghold-2": {
		order: null,
		muted: true,
	},
	"enemy-stronghold-1": {
		order: null,
		muted: true,
	},
	"enemy-gate-3": {
		order: null,
		muted: true,
	},
	"enemy-gate-2": {
		order: null,
		muted: true,
	},
	"enemy-gate-1": {
		order: null,
		muted: true,
	},
	"enemy-base": {
		order: null,
		muted: true,
	},
};

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
		return `${(number / 1_000_000_000_000).toLocaleString(
			"en-US",
			{ maximumFractionDigits: 3 },
		)}T`;
	}

	if (number >= 1_000_000_000) {
		return `${(number / 1_000_000_000).toLocaleString(
			"en-US",
			{ maximumFractionDigits: 3 },
		)}B`;
	}

	if (number >= 1_000_000) {
		return `${(number / 1_000_000).toLocaleString(
			"en-US",
			{ maximumFractionDigits: 3 },
		)}M`;
	}

	if (number >= 1_000) {
		return `${(number / 1_000).toLocaleString(
			"en-US",
			{ maximumFractionDigits: 3 },
		)}K`;
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
	}
}

function getLocationTheme(type: WinterSiegeLocationType) {
	switch (type) {
		case "base":
			return {
				container:
					"border-cyan-400/90 bg-cyan-950/55 shadow-[0_0_30px_rgba(0,200,255,0.16)]",
				icon:
					"border border-cyan-400/45 bg-cyan-400/10 text-cyan-300",
				title: "text-cyan-300",
				count: "text-white/50",
			};
		case "gate":
			return {
				container:
					"border-cyan-400/90 bg-cyan-950/45 shadow-[0_0_25px_rgba(0,200,255,0.13)]",
				icon:
					"border border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
				title: "text-cyan-300",
				count: "text-white/50",
			};
		case "stronghold":
			return {
				container:
					"border-cyan-400/90 bg-cyan-950/45 shadow-[0_0_25px_rgba(0,200,255,0.13)]",
				icon:
					"border border-cyan-400/40 bg-cyan-400/10 text-cyan-300",
				title: "text-cyan-300",
				count: "text-white/50",
			};
	}
}

function getEnemyTheme(type: EnemyLocationType, muted: boolean) {
	if (muted) {
		return {
			container:
				"border-white/15 bg-white/[0.035] shadow-none",
			icon:
				"border border-white/10 bg-white/5 text-white/25",
			title: "text-white/35",
			subtitle: "text-white/20",
		};
	}

	switch (type) {
		case "base":
			return {
				container:
					"border-red-500/90 bg-red-950/55 shadow-[0_0_30px_rgba(255,35,55,0.15)]",
				icon:
					"border border-red-400/50 bg-red-500/10 text-red-400",
				title: "text-red-400",
				subtitle: "text-red-400/75",
			};
		case "stronghold":
			return {
				container:
					"border-red-500/90 bg-red-950/50 shadow-[0_0_25px_rgba(255,35,55,0.12)]",
				icon:
					"border border-red-400/45 bg-red-500/10 text-red-400",
				title: "text-red-400",
				subtitle: "text-red-400/75",
			};
		case "gate":
			return {
				container:
					"border-red-500/90 bg-red-950/45 shadow-[0_0_22px_rgba(255,35,55,0.1)]",
				icon:
					"border border-red-400/45 bg-red-500/10 text-red-400",
				title: "text-red-400",
				subtitle: "text-red-400/75",
			};
	}
}

function getEnemyIcon(type: EnemyLocationType) {
	switch (type) {
		case "base":
			return <Shield className="size-5" />;
		case "stronghold":
			return <Swords className="size-5" />;
		case "gate":
			return <ArrowDown className="size-5" />;
	}
}

function normalizeEnemyPlan(value: unknown): EnemyPlan {
	const result: EnemyPlan = {};

	for (const location of ENEMY_LOCATIONS) {
		const fallback = DEFAULT_ENEMY_PLAN[location.id] ?? {
			order: null,
			muted: true,
		};

		result[location.id] = {
			order: fallback.order,
			muted: fallback.muted,
		};
	}

	if (
		!value ||
		typeof value !== "object" ||
		Array.isArray(value)
	) {
		return result;
	}

	const source = value as Record<string, unknown>;

	for (const location of ENEMY_LOCATIONS) {
		const raw = source[location.id];

		if (
			!raw ||
			typeof raw !== "object" ||
			Array.isArray(raw)
		) {
			continue;
		}

		const state = raw as Record<string, unknown>;
		const order =
			typeof state.order === "number" &&
			Number.isFinite(state.order) &&
			state.order > 0
				? Math.floor(state.order)
				: null;

		result[location.id] = {
			order,
			muted: order === null,
		};
	}

	return result;
}

function readStoredEnemyPlan(): EnemyPlan {
	if (typeof window === "undefined") {
		return DEFAULT_ENEMY_PLAN;
	}

	try {
		const raw = window.localStorage.getItem(
			MAP_STORAGE_KEY,
		);

		if (!raw) {
			return DEFAULT_ENEMY_PLAN;
		}

		return normalizeEnemyPlan(JSON.parse(raw));
	} catch {
		return DEFAULT_ENEMY_PLAN;
	}
}

export default function WinterSiegeMap({
	squads,
	assignments,
	onAssign,
	onRemoveAssignment,
}: WinterSiegeMapProps) {
	const [draggingSquadId, setDraggingSquadId] =
		useState<string | null>(null);
	const [activeLocationId, setActiveLocationId] =
		useState<string | null>(null);
	const [enemyPlan, setEnemyPlan] =
		useState<EnemyPlan>(DEFAULT_ENEMY_PLAN);
	const [showLegend, setShowLegend] = useState(true);

	useEffect(() => {
		setEnemyPlan(readStoredEnemyPlan());
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		try {
			window.localStorage.setItem(
				MAP_STORAGE_KEY,
				JSON.stringify(enemyPlan),
			);
		} catch {
			// Ignore local storage failures.
		}
	}, [enemyPlan]);

	const assignmentMap = useMemo(() => {
		const result = new Map<
			string,
			WinterSiegeAssignment
		>();

		for (const assignment of assignments) {
			result.set(
				createSquadKey(
					assignment.memberId,
					assignment.squadId,
				),
				assignment,
			);
		}

		return result;
	}, [assignments]);

	const squadsByLocation = useMemo(() => {
		const result = new Map<
			string,
			WinterSiegeSquad[]
		>();

		for (const location of WINTER_SIEGE_MAP_LOCATIONS) {
			result.set(location.id, []);
		}

		for (const squad of squads) {
			const assignment = assignmentMap.get(
				getSquadKey(squad),
			);

			if (!assignment?.locationId) {
				continue;
			}

			result.get(assignment.locationId)?.push(squad);
		}

		return result;
	}, [squads, assignmentMap]);

	const unassignedSquads = useMemo(() => {
		return squads.filter((squad) => {
			const assignment = assignmentMap.get(
				getSquadKey(squad),
			);

			return !assignment?.locationId;
		});
	}, [squads, assignmentMap]);

	const placedCount = useMemo(() => {
		return assignments.filter((assignment) =>
			Boolean(assignment.locationId),
		).length;
	}, [assignments]);

	const activeAttackLocations = useMemo(() => {
		return ENEMY_LOCATIONS.filter(
			(location) =>
				enemyPlan[location.id]?.order !== null,
		).sort(
			(a, b) =>
				(enemyPlan[a.id]?.order ?? 999) -
				(enemyPlan[b.id]?.order ?? 999),
		);
	}, [enemyPlan]);

	const mutedEnemyLocations = useMemo(() => {
		return ENEMY_LOCATIONS.filter(
			(location) =>
				enemyPlan[location.id]?.order === null,
		);
	}, [enemyPlan]);

	function toggleAttackOrder(locationId: string) {
		setEnemyPlan((current) => {
			const target = current[locationId] ?? {
				order: null,
				muted: true,
			};

			if (target.order !== null) {
				const removedOrder = target.order;
				const next: EnemyPlan = {};

				for (const location of ENEMY_LOCATIONS) {
					const state = current[location.id] ?? {
						order: null,
						muted: true,
					};

					let order = state.order;

					if (
						order !== null &&
						order > removedOrder
					) {
						order -= 1;
					}

					next[location.id] = {
						order,
						muted: order === null,
					};
				}

				return next;
			}

			const usedOrders = new Set(
				Object.values(current)
					.map((state) => state.order)
					.filter(
						(order): order is number =>
							typeof order === "number",
					),
			);

			let nextOrder = 1;

			while (usedOrders.has(nextOrder)) {
				nextOrder += 1;
			}

			return {
				...current,
				[locationId]: {
					order: nextOrder,
					muted: false,
				},
			};
		});
	}

	function clearAllAttackOrders() {
		setEnemyPlan(() => {
			const next: EnemyPlan = {};

			for (const location of ENEMY_LOCATIONS) {
				next[location.id] = {
					order: null,
					muted: true,
				};
			}

			return next;
		});
	}

	function handleDragStart(
		squad: WinterSiegeSquad,
		event: DragEvent<HTMLElement>,
	) {
		const squadKey = getSquadKey(squad);

		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData(
			"winter-siege-squad",
			squadKey,
		);

		setDraggingSquadId(squadKey);
	}

	function handleDragEnd() {
		setDraggingSquadId(null);
		setActiveLocationId(null);
	}

	function handleDragOver(
		event: DragEvent<HTMLDivElement>,
		location: WinterSiegeMapLocation,
	) {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
		setActiveLocationId(location.id);
	}

	function handleDrop(
		event: DragEvent<HTMLDivElement>,
		location: WinterSiegeMapLocation,
	) {
		event.preventDefault();

		const squadKey = event.dataTransfer.getData(
			"winter-siege-squad",
		);

		const squad = squads.find(
			(item) => getSquadKey(item) === squadKey,
		);

		if (!squad) {
			handleDragEnd();
			return;
		}

		onAssign(
			squad.memberId,
			squad.squadId,
			location.id,
		);

		handleDragEnd();
	}

	function handleQuickPlace(
		squad: WinterSiegeSquad,
		location: WinterSiegeMapLocation,
	) {
		onAssign(
			squad.memberId,
			squad.squadId,
			location.id,
		);
	}

	return (
		<div className="overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[#020609]">
			<div className="border-b border-white/10 bg-black/40 p-4 sm:p-5">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex min-w-0 items-start gap-3">
						<div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/50 bg-cyan-400/10 text-cyan-300 shadow-[0_0_24px_rgba(0,200,255,0.14)]">
							<Swords className="size-5" />
						</div>

						<div className="min-w-0">
							<p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/60">
								Winter Siege
							</p>
							<h2 className="mt-0.5 text-lg font-black text-white">
								Plan · Assign · Attack · Victory
							</h2>
							<p className="mt-1 max-w-2xl text-xs leading-5 text-white/40">
								Drag your squads onto the blue
								territory. Click enemy buildings in
								the order you want to attack them.
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<div className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-[10px] font-bold text-cyan-300">
							{placedCount} placed
						</div>

						<div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold text-white/45">
							{unassignedSquads.length} ready
						</div>

						<button
							type="button"
							onClick={() =>
								setShowLegend((current) => !current)
							}
							className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
						>
							{showLegend ? "Hide Legend" : "Legend"}
						</button>
					</div>
				</div>
			</div>

			<div className="p-2 sm:p-4">
				<div
					data-winter-siege-map="canvas"
					className="relative min-h-[1180px] overflow-hidden rounded-2xl border border-white/10 bg-[#03080b] sm:min-h-[900px] lg:aspect-[0.95] lg:min-h-0"
				>
					<div className="pointer-events-none absolute inset-0 opacity-25">
						<div
							className="absolute inset-0"
							style={{
								backgroundImage:
									"linear-gradient(rgba(0,210,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,210,255,0.045) 1px, transparent 1px)",
								backgroundSize: "36px 36px",
							}}
						/>
					</div>

					<div className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/[0.035] blur-3xl sm:size-[700px]" />

					<div className="pointer-events-none absolute inset-x-0 top-0 h-[54%] bg-[radial-gradient(circle_at_50%_8%,rgba(255,30,50,0.11),transparent_60%)]" />

					<div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] bg-[radial-gradient(circle_at_50%_75%,rgba(0,190,255,0.065),transparent_62%)]" />

					<div className="absolute left-4 top-4 z-40 sm:left-6 sm:top-5">
						<div className="flex items-center gap-2.5">
							<div className="flex size-9 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
								<Swords className="size-4" />
							</div>
							<div>
								<h3 className="text-sm font-black text-white">
									Battle Map
								</h3>
								<p className="text-[8px] text-white/35 sm:text-[9px]">
									Drag · Deploy · Reposition
								</p>
							</div>
						</div>
					</div>

					{showLegend && (
						<div className="absolute right-4 top-4 z-40 hidden w-[215px] rounded-xl border border-white/10 bg-black/65 p-3 backdrop-blur-md lg:block">
							<div className="space-y-2">
								<LegendItem
									className="bg-cyan-500"
									label="Your Territory"
									description="Squads can be deployed here"
								/>
								<LegendItem
									className="bg-red-500"
									label="Enemy Territory"
									description="Attack targets"
								/>
								<LegendItem
									className="bg-white/35"
									label="Muted"
									description="No attack order assigned"
								/>
								<div className="flex items-center gap-2.5">
									<div className="w-7 border-t border-dashed border-cyan-400" />
									<div>
										<p className="text-[8px] font-bold text-white">
											Movement Path
										</p>
										<p className="text-[7px] text-white/30">
											Connected route
										</p>
									</div>
								</div>
							</div>
						</div>
					)}

					<div className="absolute bottom-4 left-4 z-40 hidden w-[235px] rounded-xl border border-white/10 bg-black/70 p-3 backdrop-blur-md lg:block">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-[10px] font-black text-white">
									Attack Order
								</p>
								<p className="mt-0.5 text-[8px] leading-4 text-white/35">
									Click targets in any order.
									Targets without an order become
									muted automatically.
								</p>
							</div>

							<button
								type="button"
								onClick={clearAllAttackOrders}
								className="rounded-md border border-white/10 px-2 py-1 text-[8px] font-bold text-white/40 transition-colors hover:bg-white/5 hover:text-white"
							>
								Clear
							</button>
						</div>

						<div className="mt-3 max-h-[155px] space-y-1 overflow-y-auto pr-1">
							{activeAttackLocations.map(
								(location) => (
									<AttackOrderRow
										key={location.id}
										location={location}
										order={
											enemyPlan[location.id]
												?.order ?? null
										}
										onClick={() =>
											toggleAttackOrder(
												location.id,
											)
										}
									/>
								),
							)}

							{mutedEnemyLocations.map(
								(location) => (
									<AttackOrderRow
										key={location.id}
										location={location}
										order={null}
										onClick={() =>
											toggleAttackOrder(
												location.id,
											)
										}
									/>
								),
							)}
						</div>
					</div>

					<div className="absolute bottom-4 right-4 z-40 hidden w-[250px] rounded-xl border border-white/10 bg-black/70 p-3 backdrop-blur-md lg:block">
						<div className="flex items-center justify-between gap-2">
							<div>
								<p className="text-[10px] font-black text-white">
									Your Squads
								</p>
								<p className="mt-0.5 text-[8px] text-white/35">
									Drag a squad onto any blue building
								</p>
							</div>

							<span className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-[8px] font-bold text-white/45">
								{squads.length} total
							</span>
						</div>

						<div className="mt-3 max-h-[205px] space-y-1.5 overflow-y-auto pr-1">
							{unassignedSquads.length === 0 ? (
								<div className="rounded-lg border border-dashed border-cyan-400/20 bg-cyan-400/[0.025] px-3 py-4 text-center">
									<p className="text-[9px] font-semibold text-cyan-300/70">
										All squads deployed
									</p>
									<p className="mt-1 text-[7px] leading-4 text-white/25">
										Drag deployed squads again to
										reposition them.
									</p>
								</div>
							) : (
								unassignedSquads.map((squad) => (
									<DraggableSquad
										key={getSquadKey(squad)}
										squad={squad}
										isDragging={
											draggingSquadId ===
											getSquadKey(squad)
										}
										onDragStart={handleDragStart}
										onDragEnd={handleDragEnd}
										onQuickPlace={handleQuickPlace}
									/>
								))
							)}
						</div>

						<div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-white/10 pt-3">
							<StatRow
								dot="bg-cyan-400"
								label="Assigned"
								value={placedCount}
							/>
							<StatRow
								dot="bg-white/60"
								label="Available"
								value={unassignedSquads.length}
							/>
						</div>
					</div>

					<MapConnections />

					{ENEMY_LOCATIONS.map((location) => {
						const state = enemyPlan[location.id] ?? {
							order: null,
							muted: true,
						};

						return (
							<EnemyMapLocation
								key={location.id}
								location={location}
								state={state}
								onToggleOrder={() =>
									toggleAttackOrder(location.id)
								}
							/>
						);
					})}

					{WINTER_SIEGE_MAP_LOCATIONS.map(
						(location) => {
							const locationSquads =
								squadsByLocation.get(
									location.id,
								) ?? [];

							const theme = getLocationTheme(
								location.type,
							);

							const isActive =
								activeLocationId === location.id;

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
										data-winter-location={location.id}
										className={[
											"relative -translate-x-1/2 -translate-y-1/2 rounded-xl border p-2.5 transition-all sm:rounded-2xl sm:p-3",
											"w-[150px] sm:w-[190px] lg:w-[210px]",
											theme.container,
											isActive
												? "scale-[1.035] ring-2 ring-cyan-300/70 ring-offset-2 ring-offset-[#03080b]"
												: "",
										].join(" ")}
										onDragOver={(event) =>
											handleDragOver(
												event,
												location,
											)
										}
										onDrop={(event) =>
											handleDrop(
												event,
												location,
											)
										}
									>
										<div className="pointer-events-none flex items-center gap-2">
											<div
												className={[
													"flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl",
													theme.icon,
												].join(" ")}
											>
												{getLocationIcon(
													location.type,
												)}
											</div>

											<div className="min-w-0">
												<p
													className={[
														"truncate text-[10px] font-black sm:text-xs",
														theme.title,
													].join(" ")}
												>
													{location.name}
												</p>
												<p
													className={[
														"mt-0.5 text-[7px] sm:text-[8px]",
														theme.count,
													].join(" ")}
												>
													{locationSquads.length} squads
												</p>
											</div>
										</div>

										<div
											className="relative z-10 mt-2 max-h-[132px] space-y-1 overflow-y-auto pr-1 [scrollbar-color:rgba(0,207,255,0.35)_transparent] [scrollbar-width:thin]"
										>
											{locationSquads.map((squad) => (
												<MapSquad
													key={getSquadKey(squad)}
													squad={squad}
													isDragging={
														draggingSquadId ===
														getSquadKey(squad)
													}
													onDragStart={handleDragStart}
													onDragEnd={handleDragEnd}
													onRemove={() =>
														onRemoveAssignment(
															squad.memberId,
															squad.squadId,
														)
													}
												/>
											))}

											{locationSquads.length === 0 && (
												<div className="pointer-events-none rounded-lg border border-dashed border-cyan-300/20 px-2 py-2.5 text-center">
													<p className="text-[7px] text-white/30 sm:text-[8px]">
														Drop squad here
													</p>
												</div>
											)}
										</div>

										{isActive && (
											<div className="pointer-events-none absolute inset-1 rounded-lg border border-dashed border-cyan-300/45" />
										)}
									</div>
								</div>
							);
						},
					)}


				</div>
				<div className="mt-3 space-y-3 sm:hidden">
					<div className="rounded-xl border border-white/10 bg-black/80 p-3 backdrop-blur-md">
						<div className="flex items-center justify-between gap-2">
							<div className="min-w-0">
								<p className="text-[10px] font-black text-white">Deploy Squads</p>
								<p className="mt-0.5 text-[8px] leading-4 text-white/35">Use Quick Place on mobile. Drag to deploy is available on desktop.</p>
							</div>
							<span className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-[8px] font-bold text-white/45">{unassignedSquads.length} ready</span>
						</div>
						<div className="mt-3 flex gap-2 overflow-x-auto pb-1">
							{unassignedSquads.length === 0 ? (
								<p className="w-full rounded-lg border border-dashed border-cyan-400/20 px-3 py-3 text-center text-[8px] text-white/30">All squads deployed</p>
							) : (
								unassignedSquads.map((squad) => (
									<div key={getSquadKey(squad)} className="min-w-[220px]">
										<DraggableSquad squad={squad} isDragging={draggingSquadId === getSquadKey(squad)} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onQuickPlace={handleQuickPlace} />
									</div>
								))
							)}
						</div>
					</div>

					<div className="rounded-xl border border-white/10 bg-black/80 p-3 backdrop-blur-md">
						<div className="flex items-center justify-between gap-2">
							<div>
								<p className="text-[10px] font-black text-white">Attack Order</p>
								<p className="mt-0.5 text-[8px] text-white/35">Tap a target to add or remove it.</p>
							</div>
							<button type="button" onClick={clearAllAttackOrders} className="rounded-md border border-white/10 px-2 py-1 text-[8px] font-bold text-white/40 transition-colors hover:bg-white/5 hover:text-white">Clear</button>
						</div>
						<div className="mt-3 grid grid-cols-2 gap-1.5">
							{ENEMY_LOCATIONS.map((location) => {
								const order = enemyPlan[location.id]?.order ?? null;
								return (
									<button key={location.id} type="button" onClick={() => toggleAttackOrder(location.id)} className={["flex min-w-0 items-center gap-1.5 rounded-lg border px-2 py-2 text-left transition-colors", order !== null ? "border-yellow-300/30 bg-yellow-300/10" : "border-white/10 bg-white/[0.035]"].join(" ")}>
										<span className={["flex size-5 shrink-0 items-center justify-center rounded-full text-[8px] font-black", order !== null ? "bg-yellow-300 text-black" : "bg-white/10 text-white/30"].join(" ")}>{order ?? "+"}</span>
										<span className={["truncate text-[8px] font-semibold", order !== null ? "text-white/80" : "text-white/30"].join(" ")}>{location.name}</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

type ConnectionPoint = {
	x: number;
	y: number;
};

type ConnectionRect = {
	left: number;
	top: number;
	width: number;
	height: number;
};

type ConnectionDefinition = {
	from: string;
	to: string;
	kind: "enemy" | "friendly";
};

const MAP_CONNECTIONS: ConnectionDefinition[] = [
	{
		from: "enemy-base",
		to: "enemy-stronghold-2",
		kind: "enemy",
	},
	{
		from: "enemy-base",
		to: "enemy-stronghold-1",
		kind: "enemy",
	},
	{
		from: "enemy-stronghold-2",
		to: "enemy-gate-3",
		kind: "enemy",
	},
	{
		from: "enemy-stronghold-2",
		to: "enemy-gate-2",
		kind: "enemy",
	},
	{
		from: "enemy-stronghold-1",
		to: "enemy-gate-2",
		kind: "enemy",
	},
	{
		from: "enemy-stronghold-1",
		to: "enemy-gate-1",
		kind: "enemy",
	},
	{
		from: "enemy-gate-3",
		to: "gate-1",
		kind: "friendly",
	},
	{
		from: "enemy-gate-2",
		to: "gate-2",
		kind: "friendly",
	},
	{
		from: "enemy-gate-1",
		to: "gate-3",
		kind: "friendly",
	},
	{
		from: "gate-1",
		to: "gate-2",
		kind: "friendly",
	},
	{
		from: "gate-2",
		to: "gate-3",
		kind: "friendly",
	},
	{
		from: "gate-1",
		to: "stronghold-1",
		kind: "friendly",
	},
	{
		from: "gate-3",
		to: "stronghold-2",
		kind: "friendly",
	},
	{
		from: "stronghold-1",
		to: "base",
		kind: "friendly",
	},
	{
		from: "stronghold-2",
		to: "base",
		kind: "friendly",
	},
];

function getConnectionRect(
	element: HTMLElement,
	mapRect: DOMRect,
): ConnectionRect {
	const rect = element.getBoundingClientRect();

	return {
		left: rect.left - mapRect.left,
		top: rect.top - mapRect.top,
		width: rect.width,
		height: rect.height,
	};
}

function getRectCenter(
	rect: ConnectionRect,
): ConnectionPoint {
	return {
		x: rect.left + rect.width / 2,
		y: rect.top + rect.height / 2,
	};
}

/**
 * Finds where a line from the center of a rectangle toward another
 * rectangle exits the rectangle.
 *
 * This is calculated from the real DOM dimensions, so the endpoint
 * remains attached to the building edge when the map changes size.
 */
function getEdgePoint(
	rect: ConnectionRect,
	target: ConnectionPoint,
): ConnectionPoint {
	const center = getRectCenter(rect);

	const dx = target.x - center.x;
	const dy = target.y - center.y;

	if (dx === 0 && dy === 0) {
		return center;
	}

	const halfWidth = Math.max(rect.width / 2, 1);
	const halfHeight = Math.max(rect.height / 2, 1);

	const scaleX =
		dx === 0
			? Number.POSITIVE_INFINITY
			: halfWidth / Math.abs(dx);

	const scaleY =
		dy === 0
			? Number.POSITIVE_INFINITY
			: halfHeight / Math.abs(dy);

	const scale = Math.min(scaleX, scaleY);

	return {
		x: center.x + dx * scale,
		y: center.y + dy * scale,
	};
}

/**
 * Adds a tiny gap outside the card.
 *
 * This keeps the arrow head visually separated from the border
 * and prevents antialiasing from making the line look like it
 * enters the building.
 */
function offsetOutside(
	point: ConnectionPoint,
	other: ConnectionPoint,
	distance: number,
): ConnectionPoint {
	const dx = point.x - other.x;
	const dy = point.y - other.y;
	const length = Math.hypot(dx, dy);

	if (length === 0) {
		return point;
	}

	return {
		x: point.x + (dx / length) * distance,
		y: point.y + (dy / length) * distance,
	};
}

function calculateConnection(
	fromElement: HTMLElement,
	toElement: HTMLElement,
	mapRect: DOMRect,
) {
	const fromRect = getConnectionRect(
		fromElement,
		mapRect,
	);
	const toRect = getConnectionRect(
		toElement,
		mapRect,
	);

	const fromCenter = getRectCenter(fromRect);
	const toCenter = getRectCenter(toRect);

	const fromEdge = getEdgePoint(
		fromRect,
		toCenter,
	);
	const toEdge = getEdgePoint(
		toRect,
		fromCenter,
	);

	return {
		from: offsetOutside(
			fromEdge,
			toEdge,
			2,
		),
		to: offsetOutside(
			toEdge,
			fromEdge,
			2,
		),
	};
}

function MapConnections() {
	const layerRef =
		useRef<HTMLDivElement>(null);

	const [mapSize, setMapSize] =
		useState({
			width: 0,
			height: 0,
		});

	type CalculatedConnection = Omit<
		ConnectionDefinition,
		"from" | "to"
	> & {
		from: ConnectionPoint;
		to: ConnectionPoint;
	};

	const [connections, setConnections] =
		useState<CalculatedConnection[]>([]);

	useEffect(() => {
		const layer = layerRef.current;
		const map = layer?.parentElement;

		if (!map) {
			return;
		}

		let animationFrame = 0;

		const measure = () => {
			cancelAnimationFrame(animationFrame);

			animationFrame =
				requestAnimationFrame(() => {
					const mapRect =
						map.getBoundingClientRect();

					if (
						mapRect.width <= 0 ||
						mapRect.height <= 0
					) {
						return;
					}

					const nextConnections =
						MAP_CONNECTIONS.flatMap(
							(connection) => {
								const fromElement =
									map.querySelector<HTMLElement>(
										`[data-winter-location="${connection.from}"]`,
									);

								const toElement =
									map.querySelector<HTMLElement>(
										`[data-winter-location="${connection.to}"]`,
									);

								if (
									!fromElement ||
									!toElement
								) {
									return [];
								}

								const points =
									calculateConnection(
										fromElement,
										toElement,
										mapRect,
									);

								return [
									{
										...connection,
										...points,
									},
								];
							},
						);

					setMapSize({
						width: mapRect.width,
						height: mapRect.height,
					});

					setConnections(
						nextConnections,
					);
				});
		};

		measure();

		const resizeObserver =
			new ResizeObserver(() => {
				measure();
			});

		resizeObserver.observe(map);

		const locationElements =
			Array.from(
				map.querySelectorAll<HTMLElement>(
					"[data-winter-location]",
				),
			);

		for (const element of locationElements) {
			resizeObserver.observe(element);
		}

		window.addEventListener(
			"resize",
			measure,
		);

		/**
		 * Child cards can change height when squads are
		 * deployed or removed. MutationObserver ensures the
		 * connection layer is recalculated immediately.
		 */
		const mutationObserver =
			new MutationObserver(() => {
				measure();
			});

		mutationObserver.observe(map, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: [
				"class",
				"style",
			],
		});

		return () => {
			cancelAnimationFrame(
				animationFrame,
			);
			resizeObserver.disconnect();
			mutationObserver.disconnect();
			window.removeEventListener(
				"resize",
				measure,
			);
		};
	}, []);

	return (
		<div
			ref={layerRef}
			className="pointer-events-none absolute inset-0 z-10"
			aria-hidden="true"
		>
			{mapSize.width > 0 &&
				mapSize.height > 0 &&
				connections.length > 0 && (
					<svg
						className="absolute inset-0 block size-full"
						width={mapSize.width}
						height={mapSize.height}
						viewBox={`0 0 ${mapSize.width} ${mapSize.height}`}
						preserveAspectRatio="none"
					>
						<defs>
							<marker
								id="winter-enemy-arrow-responsive"
								viewBox="0 0 10 10"
								refX="8.5"
								refY="5"
								markerWidth="5"
								markerHeight="5"
								orient="auto"
								markerUnits="userSpaceOnUse"
							>
								<path
									d="M 0 0 L 10 5 L 0 10 z"
									fill="#ff3548"
								/>
							</marker>

							<marker
								id="winter-friendly-arrow-responsive"
								viewBox="0 0 10 10"
								refX="8.5"
								refY="5"
								markerWidth="4.5"
								markerHeight="4.5"
								orient="auto"
								markerUnits="userSpaceOnUse"
							>
								<path
									d="M 0 0 L 10 5 L 0 10 z"
									fill="#00cfff"
								/>
							</marker>
						</defs>

						{connections.map(
							(connection, index) => {
								const isEnemy =
									connection.kind ===
									"enemy";

								return (
									<line
										key={`${connection.from}-${connection.to}-${index}`}
										x1={
											connection
												.from
												.x
										}
										y1={
											connection
												.from
												.y
										}
										x2={
											connection.to
												.x
										}
										y2={
											connection.to
												.y
										}
										fill="none"
										stroke={
											isEnemy
												? "#ff3548"
												: "#00cfff"
										}
										strokeWidth={
											isEnemy
												? 2.5
												: 2.2
										}
										strokeDasharray={
											isEnemy
												? "11 8"
												: "9 7"
										}
										strokeLinecap="round"
										opacity={
											isEnemy
												? 0.88
												: 0.78
										}
										markerEnd={`url(#${
											isEnemy
												? "winter-enemy-arrow-responsive"
												: "winter-friendly-arrow-responsive"
										})`}
									/>
								);
							},
						)}
					</svg>
				)}
		</div>
	);
}

function EnemyMapLocation({
	location,
	state,
	onToggleOrder,
}: {
	location: EnemyLocation;
	state: EnemyPlanState;
	onToggleOrder: () => void;
}) {
	const muted = state.order === null;
	const theme = getEnemyTheme(location.type, muted);

	return (
		<div
			className="absolute left-[var(--mobile-x)] top-[var(--mobile-y)] z-30 sm:left-[var(--x)] sm:top-[var(--y)]"
			style={
				{
					"--x": `${location.x}%`,
					"--y": `${location.y}%`,
					"--mobile-x": `${location.mobileX}%`,
					"--mobile-y": `${location.mobileY}%`,
				} as CSSProperties
			}
		>
			<div
				data-winter-location={location.id}
				className={[
					"relative -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 p-2.5 transition-all sm:rounded-2xl sm:p-3",
					"w-[160px] sm:w-[205px] lg:w-[220px]",
					theme.container,
				].join(" ")}
			>
				<div className="flex items-center gap-2.5">
					<div
						className={[
							"flex size-9 shrink-0 items-center justify-center rounded-lg sm:size-10 sm:rounded-xl",
							theme.icon,
						].join(" ")}
					>
						{getEnemyIcon(location.type)}
					</div>

					<div className="min-w-0 flex-1">
						<div className="flex items-center justify-between gap-2">
							<p
								className={[
									"truncate text-[11px] font-black sm:text-xs lg:text-sm",
									theme.title,
								].join(" ")}
							>
								{location.name}
							</p>

							<button
								type="button"
								aria-label={
									state.order === null
										? `Set attack order for ${location.name}`
										: `Remove attack order for ${location.name}`
								}
								onClick={onToggleOrder}
								className={[
									"flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-black transition-all sm:size-8 sm:text-xs",
									state.order !== null
										? "border-yellow-300 bg-yellow-300 text-black shadow-[0_0_15px_rgba(253,224,71,0.3)]"
										: "border-white/15 bg-white/5 text-white/25 hover:border-yellow-300/70 hover:bg-yellow-300/10 hover:text-yellow-300",
								].join(" ")}
							>
								{state.order ?? "+"}
							</button>
						</div>

						<p
							className={[
								"mt-0.5 text-[8px] font-bold sm:text-[9px]",
								theme.subtitle,
							].join(" ")}
						>
							{muted
								? "Muted"
								: `Attack step ${state.order}`}
						</p>

						<p className="mt-1 text-[7px] text-white/35 sm:text-[8px]">
							{muted
								? "No attack order"
								: "Click number to remove"}
						</p>
					</div>
				</div>

				<div
					className={[
						"mt-2 border-t pt-1.5 text-[7px] uppercase tracking-[0.14em] sm:text-[8px]",
						muted
							? "border-white/10 text-white/20"
							: "border-red-400/15 text-red-300/45",
					].join(" ")}
				>
					{muted
						? "Not in attack plan"
						: "Attack target"}
				</div>
			</div>
		</div>
	);
}

function AttackOrderRow({
	location,
	order,
	onClick,
}: {
	location: EnemyLocation;
	order: number | null;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={[
				"flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
				order !== null
					? "border-yellow-300/15 bg-yellow-300/[0.045] hover:bg-yellow-300/[0.08]"
					: "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]",
			].join(" ")}
		>
			<span
				className={[
					"flex size-5 shrink-0 items-center justify-center rounded-full text-[8px] font-black",
					order !== null
						? "bg-yellow-300 text-black"
						: "bg-white/10 text-white/25",
				].join(" ")}
			>
				{order ?? "+"}
			</span>

			<span
				className={[
					"truncate text-[8px] font-semibold",
					order !== null
						? "text-white/80"
						: "text-white/30",
				].join(" ")}
			>
				{location.name}
			</span>

			<span className="ml-auto shrink-0 text-[7px] text-white/20">
				{order !== null ? "active" : "muted"}
			</span>
		</button>
	);
}

function LegendItem({
	className,
	label,
	description,
}: {
	className: string;
	label: string;
	description: string;
}) {
	return (
		<div className="flex items-center gap-2.5">
			<div
				className={`size-3 shrink-0 rounded-full ${className}`}
			/>
			<div className="min-w-0">
				<p className="text-[8px] font-bold text-white">
					{label}
				</p>
				<p className="text-[7px] text-white/30">
					{description}
				</p>
			</div>
		</div>
	);
}

function StatRow({
	dot,
	label,
	value,
}: {
	dot: string;
	label: string;
	value: number;
}) {
	return (
		<div className="flex items-center justify-between rounded-lg bg-white/[0.025] px-2 py-1.5">
			<div className="flex items-center gap-2">
				<div
					className={`size-2 rounded-full ${dot}`}
				/>
				<span className="text-[8px] font-medium text-white/50">
					{label}
				</span>
			</div>

			<span className="text-[9px] font-black text-white/70">
				{value}
			</span>
		</div>
	);
}

type DraggableSquadProps = {
	squad: WinterSiegeSquad;
	isDragging: boolean;
	onDragStart: (
		squad: WinterSiegeSquad,
		event: DragEvent<HTMLElement>,
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
	const [showLocations, setShowLocations] =
		useState(false);

	return (
		<div
			draggable
			onDragStart={(event) =>
				onDragStart(squad, event)
			}
			onDragEnd={onDragEnd}
			className={[
				"rounded-xl border border-white/10 bg-white/[0.025] p-2.5 transition-all",
				isDragging
					? "scale-[0.98] opacity-40"
					: "cursor-grab hover:border-cyan-400/30 hover:bg-cyan-400/[0.025] active:cursor-grabbing",
			].join(" ")}
		>
			<div className="flex items-center gap-2">
				<div className="flex shrink-0 items-center justify-center rounded-md p-0.5 text-white/30">
					<GripVertical className="size-3.5" />
				</div>

				<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[9px] font-black text-white">
					{squad.memberName
						.charAt(0)
						.toUpperCase()}
				</div>

				<div className="min-w-0 flex-1">
					<p className="truncate text-[10px] font-bold text-white">
						{squad.memberName}
					</p>

					<div className="mt-1 flex items-center gap-1.5">
						<span className="rounded-full bg-cyan-400/10 px-1.5 py-0.5 text-[7px] font-bold text-cyan-300">
							{squad.squadName}
						</span>

						<span className="flex min-w-0 items-center gap-0.5 truncate text-[8px] font-semibold text-white/40">
							<Zap className="size-2.5 shrink-0" />
							{formatPower(squad.power)}
						</span>
					</div>
				</div>

				<button
					type="button"
					aria-label={`Quick place ${squad.memberName} ${squad.squadName}`}
					onClick={(event) => {
						event.stopPropagation();
						setShowLocations(
							(current) => !current,
						);
					}}
					className="shrink-0 rounded-lg p-1.5 text-white/35 transition-colors hover:bg-white/5 hover:text-white"
				>
					<MapPin className="size-3.5" />
				</button>
			</div>

			{showLocations && (
				<div className="mt-3 border-t border-white/10 pt-3">
					<div className="mb-2 flex items-center justify-between">
						<p className="text-[8px] font-bold uppercase tracking-wider text-white/35">
							Quick Place
						</p>

						<button
							type="button"
							aria-label="Close quick place"
							onClick={() =>
								setShowLocations(false)
							}
							className="rounded-md p-1 text-white/35 transition-colors hover:bg-white/5 hover:text-white"
						>
							<X className="size-3" />
						</button>
					</div>

					<div className="grid grid-cols-2 gap-1.5">
						{WINTER_SIEGE_MAP_LOCATIONS.map(
							(location) => (
								<button
									key={location.id}
									type="button"
									onClick={(event) => {
										event.stopPropagation();
										onQuickPlace(
											squad,
											location,
										);
										setShowLocations(false);
									}}
									className="rounded-lg bg-white/[0.035] px-2 py-2 text-left transition-colors hover:bg-cyan-400/5"
								>
									<p className="truncate text-[8px] font-bold text-white">
										{location.name}
									</p>
									<p className="mt-0.5 text-[7px] text-white/35">
										Unlimited deployment
									</p>
								</button>
							),
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function MapSquad({
	squad,
	isDragging,
	onDragStart,
	onDragEnd,
	onRemove,
}: {
	squad: WinterSiegeSquad;
	isDragging: boolean;
	onDragStart: (
		squad: WinterSiegeSquad,
		event: DragEvent<HTMLElement>,
	) => void;
	onDragEnd: () => void;
	onRemove: () => void;
}) {
	return (
		<div
			draggable
			onDragStart={(event) =>
				onDragStart(squad, event)
			}
			onDragEnd={onDragEnd}
			className={[
				"pointer-events-auto flex min-w-0 items-center gap-1.5 rounded-lg border border-white/10 bg-black/55 px-2 py-1.5 transition-all",
				isDragging
					? "scale-95 opacity-40"
					: "cursor-grab hover:border-cyan-400/30 active:cursor-grabbing",
			].join(" ")}
		>
			<GripVertical className="size-3 shrink-0 text-white/20" />

			<div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-black/60 text-[6px] font-black text-white sm:text-[7px]">
				{squad.memberName
					.charAt(0)
					.toUpperCase()}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate text-[7px] font-bold text-white sm:text-[8px]">
					{squad.memberName}
				</p>

				<div className="flex min-w-0 items-center gap-1">
					<span className="shrink-0 text-[6px] font-semibold text-white/45 sm:text-[7px]">
						{squad.squadName}
					</span>

					<span className="text-[6px] text-white/20 sm:text-[7px]">
						•
					</span>

					<span className="flex min-w-0 items-center gap-0.5 truncate text-[6px] font-bold text-cyan-300 sm:text-[7px]">
						<Zap className="size-2 shrink-0 sm:size-2.5" />
						{formatPower(squad.power)}
					</span>
				</div>
			</div>

			<button
				type="button"
				aria-label={`Remove ${squad.memberName} ${squad.squadName} from location`}
				onClick={(event) => {
					event.stopPropagation();
					onRemove();
				}}
				className="shrink-0 rounded-md p-1 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
			>
				<X className="size-2.5 sm:size-3" />
			</button>
		</div>
	);
}