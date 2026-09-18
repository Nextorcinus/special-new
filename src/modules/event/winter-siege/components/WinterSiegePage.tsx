"use client";

import { ArrowLeft, RefreshCw, Swords, Users, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import SLButton from "@/components/ui/sl-ui/SLButton";

import type {
	WinterSiegeAssignment,
	WinterSiegeEventData,
	WinterSiegeMember,
	WinterSiegeSquad,
	WinterSiegeSquadId,
} from "../types/winter-siege.types";

import WinterSiegeMap from "./WinterSiegeMap";
import WinterSiegeMemberSelector from "./WinterSiegeMemberSelector";

type ApiMemberEventData = {
	id?: string;
	eventType: string;
	data?: Record<string, unknown>;
	createdAt?: string;
	updatedAt?: string;
};

type ApiMember = {
	id: string;
	name: string;
	furnace: number;
	power: string | number | null;
	eventData?: ApiMemberEventData[];
};

function createSquadKey(memberId: string, squadId: WinterSiegeSquadId) {
	return `${memberId}:${squadId}`;
}

function formatPower(value: unknown): string {
	if (value === null || value === undefined) {
		return "-";
	}

	const raw = String(value).trim();

	if (!raw) {
		return "-";
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

function normalizeEventData(
	eventData?: ApiMemberEventData[],
): WinterSiegeEventData {
	const winterSiegeData = eventData?.find(
		(item) => item.eventType === "winter-siege",
	);

	if (!winterSiegeData?.data || typeof winterSiegeData.data !== "object") {
		return {};
	}

	return {
		squad1Power: winterSiegeData.data.squad1Power,
		squad2Power: winterSiegeData.data.squad2Power,
	};
}

function normalizeMember(member: ApiMember): WinterSiegeMember {
	return {
		id: member.id,
		name: member.name,
		furnace: member.furnace,
		power:
			member.power === null || member.power === undefined
				? null
				: String(member.power),
		eventData: normalizeEventData(member.eventData),
	};
}

function getSquadPower(
	member: WinterSiegeMember,
	squadId: WinterSiegeSquadId,
): unknown {
	if (squadId === "squad-1") {
		return member.eventData?.squad1Power;
	}

	return member.eventData?.squad2Power;
}

function buildSquadPool(members: WinterSiegeMember[]): WinterSiegeSquad[] {
	return members.flatMap((member) => {
		const squad1: WinterSiegeSquad = {
			id: createSquadKey(member.id, "squad-1"),
			memberId: member.id,
			memberName: member.name,
			squadId: "squad-1",
			squadName: "Squad 1",
			power: getSquadPower(member, "squad-1"),
		};

		const squad2: WinterSiegeSquad = {
			id: createSquadKey(member.id, "squad-2"),
			memberId: member.id,
			memberName: member.name,
			squadId: "squad-2",
			squadName: "Squad 2",
			power: getSquadPower(member, "squad-2"),
		};

		return [squad1, squad2];
	});
}

export default function WinterSiegePage() {
	const [members, setMembers] = useState<WinterSiegeMember[]>([]);

	const [assignments, setAssignments] = useState<WinterSiegeAssignment[]>([]);

	const [loading, setLoading] = useState(true);

	const loadMembers = useCallback(async () => {
		setLoading(true);

		try {
			const response = await fetch("/api/members", {
				method: "GET",
				cache: "no-store",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data?.error || "Failed to load members.");
			}

			const rawMembers = Array.isArray(data?.items)
				? data.items
				: Array.isArray(data?.members)
					? data.members
					: Array.isArray(data)
						? data
						: [];

			const normalizedMembers = rawMembers.map((member: ApiMember) =>
				normalizeMember(member),
			);

			setMembers(normalizedMembers);
		} catch (error) {
			console.error("[WinterSiege] Failed to load members:", error);

			toast.error("Failed to load members", {
				description:
					error instanceof Error ? error.message : "Please try again.",
			});
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadMembers();
	}, [loadMembers]);

	const squadPool = useMemo(() => buildSquadPool(members), [members]);

	const selectedSquadIds = useMemo(
		() =>
			new Set(
				assignments.map((assignment) =>
					createSquadKey(assignment.memberId, assignment.squadId),
				),
			),
		[assignments],
	);

	const plannedSquads = useMemo(
		() => squadPool.filter((squad) => selectedSquadIds.has(squad.id)),
		[squadPool, selectedSquadIds],
	);

	const unselectedSquads = useMemo(
		() => squadPool.filter((squad) => !selectedSquadIds.has(squad.id)),
		[squadPool, selectedSquadIds],
	);

	const squad1Plan = useMemo(
		() => plannedSquads.filter((squad) => squad.squadId === "squad-1"),
		[plannedSquads],
	);

	const squad2Plan = useMemo(
		() => plannedSquads.filter((squad) => squad.squadId === "squad-2"),
		[plannedSquads],
	);

	const assignedCount = assignments.length;

	const unassignedPlannedCount = plannedSquads.length - assignedCount;

	function handleAddSquad(memberId: string, squadId: WinterSiegeSquadId) {
		setAssignments((current) => {
			const key = createSquadKey(memberId, squadId);

			const alreadyInPlan = current.some(
				(assignment) =>
					createSquadKey(assignment.memberId, assignment.squadId) === key,
			);

			if (alreadyInPlan) {
				return current;
			}

			return [
				...current,
				{
					memberId,
					squadId,
					locationId: null,
				},
			];
		});

		toast.success("Squad added to plan");
	}

	function handleRemoveSquad(memberId: string, squadId: WinterSiegeSquadId) {
		setAssignments((current) =>
			current.filter(
				(assignment) =>
					!(assignment.memberId === memberId && assignment.squadId === squadId),
			),
		);

		toast.success("Squad removed from plan");
	}

	function handleAssignSquad(
		memberId: string,
		squadId: WinterSiegeSquadId,
		locationId: string,
	) {
		setAssignments((current) => {
			const existingIndex = current.findIndex(
				(assignment) =>
					assignment.memberId === memberId && assignment.squadId === squadId,
			);

			if (existingIndex === -1) {
				return [
					...current,
					{
						memberId,
						squadId,
						locationId,
					},
				];
			}

			const next = [...current];

			next[existingIndex] = {
				...next[existingIndex],
				locationId,
			};

			return next;
		});
	}

	function handleRemoveAssignment(
		memberId: string,
		squadId: WinterSiegeSquadId,
	) {
		setAssignments((current) =>
			current.map((assignment) => {
				if (
					assignment.memberId !== memberId ||
					assignment.squadId !== squadId
				) {
					return assignment;
				}

				return {
					...assignment,
					locationId: null,
				};
			}),
		);
	}

	function handleReset() {
		if (assignments.length === 0) {
			return;
		}

		setAssignments([]);

		toast.success("Winter Siege reset", {
			description: "All squad selections and map placements were cleared.",
		});
	}

	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<Link
						href="/events"
						className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[var(--sl-text-muted)] transition-colors hover:text-[var(--sl-text)]"
					>
						<ArrowLeft className="size-3.5" />
						Back to Events
					</Link>

					<div className="flex items-center gap-3">
						<div className="flex size-11 items-center justify-center rounded-xl bg-[var(--sl-primary)]/10 text-[var(--sl-primary)]">
							<Swords className="size-5" />
						</div>

						<div>
							<h1 className="text-xl font-black tracking-tight text-[var(--sl-text)] sm:text-2xl">
								Winter Siege
							</h1>

							<p className="mt-1 text-xs text-[var(--sl-text-muted)] sm:text-sm">
								Strategy Planner
							</p>
						</div>
					</div>
				</div>

				<SLButton
					variantType="secondary"
					onClick={handleReset}
					disabled={assignments.length === 0}
				>
					<RefreshCw className="mr-2 size-3.5" />
					Reset
				</SLButton>
			</div>

			{/* Overview */}
			<div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
				<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
					<p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--sl-text-muted)]">
						Members
					</p>

					<p className="mt-1 text-lg font-black text-[var(--sl-text)]">
						{members.length}
					</p>

					<p className="mt-1 text-[9px] text-[var(--sl-text-muted)]">
						Global database
					</p>
				</div>

				<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
					<p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--sl-text-muted)]">
						Squads in Plan
					</p>

					<p className="mt-1 text-lg font-black text-[var(--sl-primary)]">
						{plannedSquads.length}
					</p>

					<p className="mt-1 text-[9px] text-[var(--sl-text-muted)]">
						Individual deployment units
					</p>
				</div>

				<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
					<p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--sl-text-muted)]">
						Map Assigned
					</p>

					<p className="mt-1 text-lg font-black text-[var(--sl-text)]">
						{assignedCount}
					</p>

					<p className="mt-1 text-[9px] text-[var(--sl-text-muted)]">
						Locations selected
					</p>
				</div>

				<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
					<p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--sl-text-muted)]">
						Unassigned
					</p>

					<p className="mt-1 text-lg font-black text-[var(--sl-text)]">
						{unassignedPlannedCount}
					</p>

					<p className="mt-1 text-[9px] text-[var(--sl-text-muted)]">
						Ready for placement
					</p>
				</div>
			</div>

			{loading ? (
				<div className="mt-6 flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
					<RefreshCw className="size-6 animate-spin text-[var(--sl-primary)]" />

					<p className="mt-3 text-sm font-bold text-[var(--sl-text)]">
						Loading members...
					</p>

					<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
						Getting members from your global database.
					</p>
				</div>
			) : (
				<>
					{/* Squad Selection */}
					<section className="mt-6">
						<div className="mb-4">
							<h2 className="text-sm font-bold text-[var(--sl-text)]">
								Squad Pool
							</h2>

							<p className="mt-1 max-w-2xl text-xs leading-5 text-[var(--sl-text-muted)]">
								Select individual squads from your global member database. Squad
								1 and Squad 2 can be placed independently on the Winter Siege
								map.
							</p>
						</div>

						<WinterSiegeMemberSelector
							members={members}
							selectedSquads={selectedSquadIds}
							onAddSquad={handleAddSquad}
							onRemoveSquad={handleRemoveSquad}
						/>
					</section>

					{/* Selected Squads */}
					<section className="mt-6">
						<div className="mb-4 flex items-end justify-between gap-3">
							<div>
								<h2 className="text-sm font-bold text-[var(--sl-text)]">
									Squads in Plan
								</h2>

								<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
									Selected squads will be available for map placement.
								</p>
							</div>

							<div className="flex items-center gap-1.5 rounded-full bg-[var(--sl-input)] px-2.5 py-1.5">
								<Users className="size-3 text-[var(--sl-text-muted)]" />

								<span className="text-[9px] font-bold text-[var(--sl-text-muted)]">
									{plannedSquads.length} squads
								</span>
							</div>
						</div>

						{plannedSquads.length === 0 ? (
							<div className="flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--sl-border)] bg-[var(--sl-surface)] px-5 text-center">
								<div className="flex size-11 items-center justify-center rounded-xl bg-[var(--sl-input)] text-[var(--sl-text-muted)]">
									<Users className="size-5" />
								</div>

								<h3 className="mt-3 text-sm font-bold text-[var(--sl-text)]">
									No squads selected
								</h3>

								<p className="mt-1 max-w-md text-xs leading-5 text-[var(--sl-text-muted)]">
									Add Squad 1 or Squad 2 from the squad pool above.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
								<SquadPlanGroup
									title="Squad 1"
									description="Independent Squad 1 deployment pool."
									squads={squad1Plan}
									onRemove={handleRemoveSquad}
								/>

								<SquadPlanGroup
									title="Squad 2"
									description="Independent Squad 2 deployment pool."
									squads={squad2Plan}
									onRemove={handleRemoveSquad}
								/>
							</div>
						)}
					</section>

					{/* Map Placement */}
					<section className="mt-6">
						<WinterSiegeMap
							squads={plannedSquads}
							assignments={assignments}
							onAssign={handleAssignSquad}
							onRemoveAssignment={handleRemoveAssignment}
						/>
					</section>

					{/* Remaining Squad Info */}
					{unselectedSquads.length > 0 && (
						<section className="mt-4">
							<div className="rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface)] px-4 py-3">
								<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<p className="text-[10px] font-semibold text-[var(--sl-text-muted)]">
											Squads not selected
										</p>

										<p className="mt-0.5 text-[9px] text-[var(--sl-text-muted)]">
											These squads remain available in the pool.
										</p>
									</div>

									<div className="rounded-full bg-[var(--sl-input)] px-3 py-1.5 text-xs font-black text-[var(--sl-text)]">
										{unselectedSquads.length}
									</div>
								</div>
							</div>
						</section>
					)}
				</>
			)}
		</div>
	);
}

function SquadPlanGroup({
	title,
	description,
	squads,
	onRemove,
}: {
	title: string;
	description: string;
	squads: WinterSiegeSquad[];
	onRemove: (memberId: string, squadId: WinterSiegeSquadId) => void;
}) {
	return (
		<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
			<div className="flex items-center justify-between gap-3 border-b border-[var(--sl-border)] p-4">
				<div>
					<h3 className="text-sm font-bold text-[var(--sl-text)]">{title}</h3>

					<p className="mt-1 text-[10px] text-[var(--sl-text-muted)]">
						{description}
					</p>
				</div>

				<div className="flex items-center gap-1.5 rounded-full bg-[var(--sl-primary)]/10 px-2.5 py-1.5">
					<Zap className="size-3 text-[var(--sl-primary)]" />

					<span className="text-[9px] font-bold text-[var(--sl-primary)]">
						{squads.length}
					</span>
				</div>
			</div>

			<div className="space-y-2 p-3">
				{squads.length === 0 ? (
					<div className="flex min-h-[90px] items-center justify-center rounded-xl border border-dashed border-[var(--sl-border)]">
						<p className="text-[10px] text-[var(--sl-text-muted)]">
							No squads selected
						</p>
					</div>
				) : (
					squads.map((squad) => (
						<SelectedSquadRow
							key={squad.id}
							squad={squad}
							onRemove={() => onRemove(squad.memberId, squad.squadId)}
						/>
					))
				)}
			</div>
		</div>
	);
}

function SelectedSquadRow({
	squad,
	onRemove,
}: {
	squad: WinterSiegeSquad;
	onRemove: () => void;
}) {
	return (
		<div className="flex items-center gap-3 rounded-xl bg-[var(--sl-input)] px-3 py-3">
			<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-surface)] text-[10px] font-black text-[var(--sl-text)]">
				{squad.memberName.charAt(0).toUpperCase()}
			</div>

			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-center gap-2">
					<p className="truncate text-xs font-bold text-[var(--sl-text)]">
						{squad.memberName}
					</p>

					<span className="shrink-0 rounded-full bg-[var(--sl-primary)]/10 px-2 py-0.5 text-[8px] font-bold text-[var(--sl-primary)]">
						{squad.squadName}
					</span>
				</div>

				<div className="mt-1 flex items-center gap-1">
					<Zap className="size-3 text-[var(--sl-primary)]" />

					<p className="text-[9px] font-semibold text-[var(--sl-text-muted)]">
						{formatPower(squad.power)}
					</p>
				</div>
			</div>

			<button
				type="button"
				onClick={onRemove}
				className="shrink-0 rounded-lg px-2.5 py-1.5 text-[9px] font-bold text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]"
			>
				Remove
			</button>
		</div>
	);
}
