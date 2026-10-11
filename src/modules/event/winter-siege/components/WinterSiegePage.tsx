"use client";

import {
	ArrowLeft,
	Check,
	RefreshCw,
	Swords,
	Users,
} from "lucide-react";
import Link from "next/link";
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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

function normalizeEventData(
	eventData?: ApiMemberEventData[],
): WinterSiegeEventData {
	const winterSiegeData = eventData?.find(
		(item) =>
			item.eventType === "winter-siege",
	);

	if (
		!winterSiegeData?.data ||
		typeof winterSiegeData.data !== "object"
	) {
		return {};
	}

	return {
		squad1Power:
			winterSiegeData.data.squad1Power,
		squad2Power:
			winterSiegeData.data.squad2Power,
	};
}

function normalizeMember(
	member: ApiMember,
): WinterSiegeMember {
	return {
		id: member.id,
		name: member.name,
		furnace: member.furnace,
		power:
			member.power === null ||
			member.power === undefined
				? null
				: String(member.power),
		eventData: normalizeEventData(
			member.eventData,
		),
	};
}

async function readJsonResponse(
	response: Response,
	fallbackMessage: string,
): Promise<unknown> {
	const contentType = response.headers.get("content-type") ?? "";
	const body = await response.text();

	if (!body.trim()) {
		throw new Error(
			response.ok
				? fallbackMessage
				: `${fallbackMessage} (${response.status})`,
		);
	}

	if (!contentType.toLowerCase().includes("application/json")) {
		const preview = body.replace(/\s+/g, " ").trim().slice(0, 160);
		throw new Error(
			`${fallbackMessage} The server returned non-JSON content (${response.status}). ${preview}`,
		);
	}

	try {
		return JSON.parse(body) as unknown;
	} catch {
		throw new Error(
			`${fallbackMessage} The server returned invalid JSON.`,
		);
	}
}

function createSquadKey(
	memberId: string,
	squadId: WinterSiegeSquadId,
) {
	return `${memberId}:${squadId}`;
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

function buildSquadPool(
	members: WinterSiegeMember[],
): WinterSiegeSquad[] {
	return members.flatMap((member) => {
		const squad1: WinterSiegeSquad = {
			id: createSquadKey(
				member.id,
				"squad-1",
			),
			memberId: member.id,
			memberName: member.name,
			squadId: "squad-1",
			squadName: "Squad 1",
			power: getSquadPower(
				member,
				"squad-1",
			),
		};

		const squad2: WinterSiegeSquad = {
			id: createSquadKey(
				member.id,
				"squad-2",
			),
			memberId: member.id,
			memberName: member.name,
			squadId: "squad-2",
			squadName: "Squad 2",
			power: getSquadPower(
				member,
				"squad-2",
			),
		};

		return [squad1, squad2];
	});
}

export default function WinterSiegePage() {
	const [members, setMembers] = useState<
		WinterSiegeMember[]
	>([]);

	const [assignments, setAssignments] =
		useState<WinterSiegeAssignment[]>([]);

	const [loading, setLoading] =
		useState(true);

	const [saving, setSaving] =
		useState(false);

	const [loadedPlan, setLoadedPlan] =
		useState(false);

	const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

	const savePlan = useCallback(
		(nextAssignments: WinterSiegeAssignment[]) => {
			const request = async () => {
				setSaving(true);

				try {
					const response = await fetch(
						"/api/events/winter-siege",
						{
							method: "PUT",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								assignments: nextAssignments,
							}),
						},
						);

					const data = await readJsonResponse(
						response,
						"Failed to save Winter Siege plan.",
					);

					if (!response.ok) {
						const errorData =
							data &&
							typeof data === "object"
								? (data as Record<string, unknown>)
								: null;

						throw new Error(
								typeof errorData?.error === "string"
									? errorData.error
									: "Failed to save Winter Siege plan.",
							);
					}
				} catch (error) {
					console.error(
						"[WinterSiege] Save failed:",
						error,
					);

					toast.error(
						"Failed to save Winter Siege plan",
						{
							description:
								error instanceof Error
									? error.message
									: "Please try again.",
						},
					);
				} finally {
					setSaving(false);
				}
			};

			const queuedRequest =
				saveQueueRef.current.then(request, request);

			saveQueueRef.current =
				queuedRequest.catch(() => undefined);

			return queuedRequest;
		},
		[],
	);


	const loadData = useCallback(
		async () => {
			setLoading(true);

			try {
				const [
					membersResponse,
					planResponse,
				] = await Promise.all([
					fetch("/api/members", {
						method: "GET",
						cache: "no-store",
					}),
					fetch(
						"/api/events/winter-siege",
						{
							method: "GET",
							cache: "no-store",
						},
					),
				]);

				const membersData =
					await readJsonResponse(
						membersResponse,
						"Failed to load members.",
					);

				const planData =
					await readJsonResponse(
						planResponse,
						"Failed to load Winter Siege plan.",
					);

				if (!membersResponse.ok) {
					throw new Error(
						membersData &&
						typeof membersData === "object" &&
						typeof (membersData as Record<string, unknown>).error === "string"
							? String(
									(membersData as Record<string, unknown>).error,
								)
							: "Failed to load members.",
					);
				}

				if (!planResponse.ok) {
					throw new Error(
						planData &&
						typeof planData === "object" &&
						typeof (planData as Record<string, unknown>).error === "string"
							? String(
									(planData as Record<string, unknown>).error,
								)
							: "Failed to load Winter Siege plan.",
					);
				}

				const membersObject =
					membersData &&
					typeof membersData === "object" &&
					!Array.isArray(membersData)
						? (membersData as Record<string, unknown>)
						: null;

				const rawMembers = Array.isArray(
					membersObject?.items,
				)
					? membersObject.items
					: Array.isArray(
							membersObject?.members,
						  )
						? membersObject.members
						: Array.isArray(membersData)
							? membersData
							: [];

				const normalizedMembers =
					rawMembers
						.filter(
							(item): item is ApiMember =>
								Boolean(
									item &&
									typeof item === "object",
								),
						)
						.map((member) =>
							normalizeMember(member),
						);

				const planObject =
					planData &&
					typeof planData === "object" &&
					!Array.isArray(planData)
						? (planData as Record<string, unknown>)
						: null;

				const loadedAssignments =
					Array.isArray(
						planObject?.assignments,
					)
						? planObject.assignments
								.filter(
									(
										item: unknown,
									): item is WinterSiegeAssignment => {
										if (
											!item ||
											typeof item !==
												"object"
										) {
											return false;
										}

										const value =
											item as Record<
												string,
												unknown
											>;

										return (
											typeof value.memberId ===
												"string" &&
											(value.squadId ===
												"squad-1" ||
												value.squadId ===
													"squad-2") &&
											(value.locationId ===
												null ||
												typeof value.locationId ===
													"string")
										);
									},
								)
						: [];

				setMembers(
					normalizedMembers,
				);

				setAssignments(
					loadedAssignments,
				);

				setLoadedPlan(true);
			} catch (error) {
				console.error(
					"[WinterSiege] Failed to load:",
					error,
				);

				toast.error(
					"Failed to load Winter Siege",
					{
						description:
							error instanceof Error
								? error.message
								: "Please try again.",
					},
				);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const squadPool = useMemo(
		() => buildSquadPool(members),
		[members],
	);

	const selectedSquadIds = useMemo(
		() =>
			new Set(
				assignments.map(
					(assignment) =>
						createSquadKey(
							assignment.memberId,
							assignment.squadId,
						),
				),
			),
		[assignments],
	);

	const plannedSquads = useMemo(
		() =>
			squadPool.filter((squad) =>
				selectedSquadIds.has(
					squad.id,
				),
			),
		[squadPool, selectedSquadIds],
	);

	const unselectedSquads = useMemo(
		() =>
			squadPool.filter(
				(squad) =>
					!selectedSquadIds.has(
						squad.id,
					),
			),
		[squadPool, selectedSquadIds],
	);

	const assignedCount = assignments.filter(
		(assignment) =>
			Boolean(assignment.locationId),
	).length;

	const unassignedPlannedCount =
		plannedSquads.length - assignedCount;

	function applyAssignments(
		nextAssignments: WinterSiegeAssignment[],
		successMessage?: string,
	) {
		setAssignments(nextAssignments);

		void savePlan(nextAssignments);

		if (successMessage) {
			toast.success(successMessage);
		}
	}

	function handleAddSquad(
		memberId: string,
		squadId: WinterSiegeSquadId,
	) {
		const key = createSquadKey(
			memberId,
			squadId,
		);

		const alreadyInPlan =
			assignments.some(
				(assignment) =>
					createSquadKey(
						assignment.memberId,
						assignment.squadId,
					) === key,
			);

		if (alreadyInPlan) {
			return;
		}

		const nextAssignments = [
			...assignments,
			{
				memberId,
				squadId,
				locationId: null,
			},
		];

		applyAssignments(
			nextAssignments,
			"Squad added to plan",
		);
	}

	function handleRemoveSquad(
		memberId: string,
		squadId: WinterSiegeSquadId,
	) {
		const nextAssignments =
			assignments.filter(
				(assignment) =>
					!(
						assignment.memberId ===
							memberId &&
						assignment.squadId ===
							squadId
					),
			);

		applyAssignments(
			nextAssignments,
			"Squad removed from plan",
		);
	}

	function handleAssignSquad(
		memberId: string,
		squadId: WinterSiegeSquadId,
		locationId: string,
	) {
		const existingIndex =
			assignments.findIndex(
				(assignment) =>
					assignment.memberId ===
						memberId &&
					assignment.squadId ===
						squadId,
			);

		let nextAssignments: WinterSiegeAssignment[];

		if (existingIndex === -1) {
			nextAssignments = [
				...assignments,
				{
					memberId,
					squadId,
					locationId,
				},
			];
		} else {
			nextAssignments = [
				...assignments,
			];

			nextAssignments[
				existingIndex
			] = {
				...nextAssignments[
					existingIndex
				],
				locationId,
			};
		}

		applyAssignments(nextAssignments);
	}

	function handleRemoveAssignment(
		memberId: string,
		squadId: WinterSiegeSquadId,
	) {
		const nextAssignments =
			assignments.map(
				(assignment) => {
					if (
						assignment.memberId !==
							memberId ||
						assignment.squadId !==
							squadId
					) {
						return assignment;
					}

					return {
						...assignment,
						locationId: null,
					};
				},
			);

		applyAssignments(
			nextAssignments,
		);
	}

	function handleReset() {
		if (assignments.length === 0) {
			return;
		}

		applyAssignments([], "Winter Siege reset");
	}

	return (
		<div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<Link
						href="/events"
						className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--sl-text-muted)] transition-colors hover:text-[var(--sl-text)]"
					>
						<ArrowLeft className="size-4" />
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

							<p className="mt-1 text-sm text-[var(--sl-text-muted)]">
								Strategy Planner
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					{loadedPlan && (
						<div className="flex items-center gap-1.5 rounded-full bg-[var(--sl-input)] px-3 py-2 text-xs font-semibold text-[var(--sl-text-muted)]">
							{saving ? (
								<>
									<RefreshCw className="size-3.5 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Check className="size-3.5 text-[var(--sl-primary)]" />
									Saved
								</>
							)}
						</div>
					)}

					<SLButton
						variantType="secondary"
						onClick={handleReset}
						disabled={
							assignments.length === 0 ||
							saving
						}
					>
						<RefreshCw className="mr-2 size-3.5" />
						Reset
					</SLButton>
				</div>
			</div>

			<div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
				<OverviewCard
					label="Members"
					value={members.length}
					description="Global database"
				/>

				<OverviewCard
					label="Squads in Plan"
					value={plannedSquads.length}
					valueClass="text-[var(--sl-primary)]"
					description="Individual deployment units"
				/>

				<OverviewCard
					label="Map Assigned"
					value={assignedCount}
					description="Locations selected"
				/>

				<OverviewCard
					label="Unassigned"
					value={unassignedPlannedCount}
					description="Ready for placement"
				/>
			</div>

			{loading ? (
				<div className="mt-6 flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
					<RefreshCw className="size-6 animate-spin text-[var(--sl-primary)]" />

					<p className="mt-3 text-sm font-bold text-[var(--sl-text)]">
						Loading Winter Siege...
					</p>

					<p className="mt-1 text-sm text-[var(--sl-text-muted)]">
						Loading members and saved plan.
					</p>
				</div>
			) : (
				<>
					<section className="mt-6">
						<div className="mb-4">
							<h2 className="text-base font-bold text-[var(--sl-text)]">
								Squad Pool
							</h2>

							<p className="mt-1 text-sm leading-5 text-[var(--sl-text-muted)]">
								Select individual squads from your global member database. Squad 1 and Squad 2 can be placed independently.
							</p>
						</div>

						<WinterSiegeMemberSelector
							members={members}
							selectedSquads={
								selectedSquadIds
							}
							onAddSquad={
								handleAddSquad
							}
							onRemoveSquad={
								handleRemoveSquad
							}
						/>
					</section>

					<section className="mt-6">
						<WinterSiegeMap
							squads={plannedSquads}
							assignments={
								assignments
							}
							onAssign={
								handleAssignSquad
							}
							onRemoveAssignment={
								handleRemoveAssignment
							}
						/>
					</section>

					{unselectedSquads.length > 0 && (
						<section className="mt-4">
							<div className="rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface)] px-4 py-3">
								<div className="flex items-center justify-between gap-3">
									<div>
										<p className="text-sm font-semibold text-[var(--sl-text-muted)]">
											Squads not selected
										</p>

										<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
											These squads remain available in the pool.
										</p>
									</div>

									<div className="rounded-full bg-[var(--sl-input)] px-3 py-1.5 text-sm font-black text-[var(--sl-text)]">
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

function OverviewCard({
	label,
	value,
	description,
	valueClass = "text-[var(--sl-text)]",
}: {
	label: string;
	value: number;
	description: string;
	valueClass?: string;
}) {
	return (
		<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
			<p className="text-xs font-semibold uppercase tracking-wider text-[var(--sl-text-muted)]">
				{label}
			</p>

			<p
				className={`mt-1 text-xl font-black ${valueClass}`}
			>
				{value}
			</p>

			<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
				{description}
			</p>
		</div>
	);
}