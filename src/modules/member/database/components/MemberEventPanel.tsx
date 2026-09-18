"use client";

import {
	CalendarDays,
	Pencil,
	Plus,
	RefreshCw,
	Trash2,
	X,
	Zap,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SLButton from "@/components/ui/sl-ui/SLButton";

import { toast } from "@/lib/toast";

import {
	getMemberEventDefinition,
	getMemberEventLabel,
} from "../config/member-event.config";

import type {
	Member,
	MemberEventData,
	MemberEventFormValues,
} from "../types/member.types";

import MemberEventForm from "./MemberEventForm";

type MemberEventPanelProps = {
	member: Member;
	onClose: () => void;
};

function formatDecimal(value: number): string {
	return value.toLocaleString("en-US", {
		maximumFractionDigits: 3,
	});
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
	 * If the value is already formatted,
	 * keep it as-is.
	 */
	if (!/^[\d,.]+$/.test(raw)) {
		return raw;
	}

	const numericValue = Number(raw.replace(/,/g, ""));

	if (!Number.isFinite(numericValue)) {
		return raw;
	}

	if (numericValue >= 1000000000000) {
		return `${formatDecimal(numericValue / 1000000000000)}T`;
	}

	if (numericValue >= 1000000000) {
		return `${formatDecimal(numericValue / 1000000000)}B`;
	}

	if (numericValue >= 1000000) {
		return `${formatDecimal(numericValue / 1000000)}M`;
	}

	if (numericValue >= 1000) {
		return `${formatDecimal(numericValue / 1000)}K`;
	}

	return numericValue.toLocaleString("en-US");
}

function formatFieldValue(value: unknown, type: string): string {
	if (value === null || value === undefined || value === "") {
		return "-";
	}

	if (type === "power") {
		return formatPower(value);
	}

	if (type === "number") {
		const numericValue = Number(value);

		if (Number.isFinite(numericValue)) {
			return numericValue.toLocaleString("en-US");
		}
	}

	return String(value);
}

export default function MemberEventPanel({
	member,
	onClose,
}: MemberEventPanelProps) {
	const [events, setEvents] = useState<MemberEventData[]>([]);

	const [loading, setLoading] = useState(true);

	const [saving, setSaving] = useState(false);

	const [deleting, setDeleting] = useState(false);

	const [formOpen, setFormOpen] = useState(false);

	const [editingEvent, setEditingEvent] = useState<MemberEventData | null>(
		null,
	);

	const [deleteEvent, setDeleteEvent] = useState<MemberEventData | null>(null);

	const loadEvents = useCallback(async () => {
		setLoading(true);

		try {
			const response = await fetch(
				`/api/members/${encodeURIComponent(member.id)}/events`,
				{
					cache: "no-store",
				},
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data?.error || "Failed to load event data.");
			}

			setEvents(Array.isArray(data?.items) ? data.items : []);
		} catch (error) {
			console.error("[MemberEventPanel] Load failed:", error);

			toast.error(
				"Failed to load event data",
				error instanceof Error ? error.message : "Please try again.",
			);
		} finally {
			setLoading(false);
		}
	}, [member.id]);

	useEffect(() => {
		void loadEvents();
	}, [loadEvents]);

	function handleAddEvent() {
		setEditingEvent(null);
		setFormOpen(true);
	}

	function handleEditEvent(event: MemberEventData) {
		setEditingEvent(event);
		setFormOpen(true);
	}

	function handleCloseForm() {
		if (saving) {
			return;
		}

		setFormOpen(false);
		setEditingEvent(null);
	}

	async function handleSubmit(values: MemberEventFormValues) {
		setSaving(true);

		try {
			const editing = Boolean(editingEvent);

			const url = editing
				? `/api/members/${encodeURIComponent(
						member.id,
					)}/events/${encodeURIComponent(editingEvent!.id)}`
				: `/api/members/${encodeURIComponent(member.id)}/events`;

			const response = await fetch(url, {
				method: editing ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					eventType: values.eventType,
					data: values.data,
				}),
			});

			const responseData = await response.json();

			if (!response.ok) {
				throw new Error(responseData?.error || "Failed to save event data.");
			}

			const savedEvent = responseData.item as MemberEventData;

			if (editing) {
				setEvents((current) =>
					current.map((item) =>
						item.id === savedEvent.id ? savedEvent : item,
					),
				);

				toast.success(
					"Event data updated",
					`${getMemberEventLabel(savedEvent.eventType)} data has been updated.`,
				);
			} else {
				setEvents((current) => [...current, savedEvent]);

				toast.success(
					"Event data added",
					`${getMemberEventLabel(savedEvent.eventType)} data has been added.`,
				);
			}

			setFormOpen(false);
			setEditingEvent(null);
		} catch (error) {
			console.error("[MemberEventPanel] Save failed:", error);

			const message =
				error instanceof Error ? error.message : "Failed to save event data.";

			toast.error("Failed to save event data", message);

			throw error;
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		if (!deleteEvent) {
			return;
		}

		setDeleting(true);

		try {
			const response = await fetch(
				`/api/members/${encodeURIComponent(
					member.id,
				)}/events/${encodeURIComponent(deleteEvent.id)}`,
				{
					method: "DELETE",
				},
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data?.error || "Failed to delete event data.");
			}

			setEvents((current) =>
				current.filter((item) => item.id !== deleteEvent.id),
			);

			toast.success(
				"Event data deleted",
				`${getMemberEventLabel(deleteEvent.eventType)} data has been removed.`,
			);

			setDeleteEvent(null);
		} catch (error) {
			console.error("[MemberEventPanel] Delete failed:", error);

			toast.error(
				"Failed to delete event data",
				error instanceof Error ? error.message : "Please try again.",
			);
		} finally {
			setDeleting(false);
		}
	}

	return (
		<div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4">
			<button
				type="button"
				aria-label="Close member events"
				className="absolute inset-0 cursor-default"
				onClick={onClose}
			/>

			<div className="relative z-10 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] shadow-2xl sm:max-w-2xl sm:rounded-3xl">
				{/* Header */}
				<div className="flex items-start justify-between gap-4 border-b border-[var(--sl-border)] p-5">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-primary)]/10 text-[var(--sl-primary)]">
							<CalendarDays className="size-5" />
						</div>

						<div className="min-w-0">
							<h2 className="truncate text-base font-bold text-[var(--sl-text)]">
								{member.name}
							</h2>

							<div className="mt-1 flex flex-wrap gap-2">
								<span className="rounded-full bg-[var(--sl-input)] px-2 py-1 text-[10px] font-bold text-[var(--sl-text-muted)]">
									Furnace {member.furnace}
								</span>

								{member.power && (
									<span className="rounded-full bg-[var(--sl-primary)]/10 px-2 py-1 text-[10px] font-bold text-[var(--sl-primary)]">
										Power {formatPower(member.power)}
									</span>
								)}
							</div>
						</div>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="flex size-9 shrink-0 items-center justify-center rounded-xl text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]"
						aria-label="Close"
					>
						<X className="size-4" />
					</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-5">
					<div className="mb-4 flex items-center justify-between gap-3">
						<div>
							<h3 className="text-sm font-bold text-[var(--sl-text)]">
								Event Data
							</h3>

							<p className="mt-1 text-[10px] text-[var(--sl-text-muted)]">
								{events.length} event
								{events.length === 1 ? "" : "s"} configured
							</p>
						</div>

						<SLButton onClick={handleAddEvent}>
							<Plus className="mr-2 size-4" />
							Add Event
						</SLButton>
					</div>

					{/* Loading */}
					{loading && (
						<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-input)] px-4 py-12 text-center">
							<RefreshCw className="mx-auto size-5 animate-spin text-[var(--sl-primary)]" />

							<p className="mt-3 text-xs font-semibold text-[var(--sl-text)]">
								Loading event data...
							</p>
						</div>
					)}

					{/* Empty */}
					{!loading && events.length === 0 && (
						<div className="rounded-2xl border border-dashed border-[var(--sl-border)] px-4 py-12 text-center">
							<CalendarDays className="mx-auto size-7 text-[var(--sl-text-muted)]" />

							<h3 className="mt-3 text-sm font-bold text-[var(--sl-text)]">
								No event data
							</h3>

							<p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--sl-text-muted)]">
								Add event-specific data when this member is ready for an event.
							</p>

							<div className="mt-5">
								<SLButton onClick={handleAddEvent}>
									<Plus className="mr-2 size-4" />
									Add Event Data
								</SLButton>
							</div>
						</div>
					)}

					{/* Events */}
					{!loading && events.length > 0 && (
						<div className="space-y-3">
							{events.map((event) => {
								const definition = getMemberEventDefinition(event.eventType);

								return (
									<div
										key={event.id}
										className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-input)] p-4"
									>
										{/* Event header */}
										<div className="flex items-start justify-between gap-3">
											<div className="min-w-0">
												<h4 className="text-sm font-bold text-[var(--sl-text)]">
													{getMemberEventLabel(event.eventType)}
												</h4>

												{definition && (
													<p className="mt-1 text-[10px] leading-4 text-[var(--sl-text-muted)]">
														{definition.description}
													</p>
												)}
											</div>

											<div className="flex shrink-0 items-center gap-1">
												<button
													type="button"
													onClick={() => handleEditEvent(event)}
													className="flex size-8 items-center justify-center rounded-lg text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]"
													aria-label="Edit event data"
												>
													<Pencil className="size-3.5" />
												</button>

												<button
													type="button"
													onClick={() => setDeleteEvent(event)}
													className="flex size-8 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-500/10"
													aria-label="Delete event data"
												>
													<Trash2 className="size-3.5" />
												</button>
											</div>
										</div>

										{/* Fields */}
										<div className="mt-3 space-y-2">
											{definition?.fields.map((field) => (
												<div
													key={field.key}
													className="flex items-center justify-between gap-3 rounded-xl bg-[var(--sl-surface)] px-3 py-2.5"
												>
													<div className="flex min-w-0 items-center gap-2">
														<Zap className="size-3.5 shrink-0 text-[var(--sl-primary)]" />

														<span className="truncate text-xs text-[var(--sl-text-muted)]">
															{field.label}
														</span>
													</div>

													<span className="shrink-0 text-xs font-bold text-[var(--sl-text)]">
														{formatFieldValue(
															event.data?.[field.key],
															field.type,
														)}
													</span>
												</div>
											))}

											{!definition && (
												<div className="rounded-xl bg-[var(--sl-surface)] px-3 py-2.5 text-xs text-[var(--sl-text-muted)]">
													Unknown event configuration.
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* Event Form */}
			{formOpen && (
				<div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
					<button
						type="button"
						className="absolute inset-0 cursor-default"
						onClick={handleCloseForm}
						disabled={saving}
						aria-label="Close event form"
					/>

					<div className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl">
						<MemberEventForm
							event={editingEvent}
							loading={saving}
							onSubmit={handleSubmit}
							onCancel={handleCloseForm}
						/>
					</div>
				</div>
			)}

			{/* Delete confirmation */}
			<ConfirmDialog
				open={Boolean(deleteEvent)}
				title="Delete Event Data?"
				description={
					deleteEvent
						? `Remove ${getMemberEventLabel(
								deleteEvent.eventType,
							)} data from ${member.name}?`
						: undefined
				}
				confirmText={deleting ? "Deleting..." : "Delete"}
				cancelText="Cancel"
				variant="danger"
				onConfirm={() => {
					if (!deleting) {
						void handleDelete();
					}
				}}
				onClose={() => {
					if (!deleting) {
						setDeleteEvent(null);
					}
				}}
			/>
		</div>
	);
}
