"use client";

import {
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "@/lib/toast";

import MemberEventPanel from "./MemberEventPanel";
import MemberForm from "./MemberForm";
import MemberList from "./MemberList";

import type {
	Member,
	MemberFormValues,
} from "../types/member.types";

export default function MemberDatabase() {
	const [members, setMembers] = useState<
		Member[]
	>([]);

	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);

	const [search, setSearch] = useState("");

	const [formOpen, setFormOpen] = useState(false);

	const [editingMember, setEditingMember] =
		useState<Member | null>(null);

	const [selectedMember, setSelectedMember] =
		useState<Member | null>(null);

	const [deleteMember, setDeleteMember] =
		useState<Member | null>(null);

	const [deleting, setDeleting] = useState(false);

	const loadMembers = useCallback(
		async () => {
			setLoading(true);

			try {
				const response = await fetch(
					"/api/members",
					{
						method: "GET",
						cache: "no-store",
					},
				);

				const data =
					await response.json();

				if (!response.ok) {
					throw new Error(
						data?.error ||
							"Failed to load members.",
					);
				}

				setMembers(
					Array.isArray(
						data?.items,
					)
						? data.items
						: [],
				);
			} catch (error) {
				console.error(
					"[MemberDatabase] Load failed:",
					error,
				);

				toast.error(
					"Failed to load members",
					error instanceof Error
						? error.message
						: "Please try again.",
				);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		void loadMembers();
	}, [loadMembers]);

	const sortedMembers = useMemo(
		() => {
			return [...members].sort(
				(a, b) => {
					if (
						a.furnace !==
						b.furnace
					) {
						return (
							b.furnace -
							a.furnace
						);
					}

					return a.name.localeCompare(
						b.name,
					);
				},
			);
		},
		[members],
	);

	function handleAdd() {
		setEditingMember(null);
		setFormOpen(true);
	}

	function handleEdit(member: Member) {
		setEditingMember(member);
		setFormOpen(true);
	}

	function handleOpenEvents(
		member: Member,
	) {
		setSelectedMember(member);
	}

	function handleCloseForm() {
		if (saving) {
			return;
		}

		setFormOpen(false);
		setEditingMember(null);
	}

	async function handleSubmit(
		values: MemberFormValues,
	) {
		setSaving(true);

		try {
			const isEditing =
				Boolean(editingMember);

			const url = isEditing
				? `/api/members/${encodeURIComponent(
						editingMember!.id,
					)}`
				: "/api/members";

			const response = await fetch(
				url,
				{
					method: isEditing
						? "PUT"
						: "POST",
					headers: {
						"Content-Type":
							"application/json",
					},
					body: JSON.stringify(
						values,
					),
				},
			);

			const data =
				await response.json();

			if (!response.ok) {
				throw new Error(
					data?.error ||
						"Failed to save member.",
				);
			}

			const savedMember =
				data.item as Member;

			if (isEditing) {
				setMembers((current) =>
					current.map(
						(member) =>
							member.id ===
							savedMember.id
								? savedMember
								: member,
					),
				);

				setSelectedMember(
					(current) =>
						current?.id ===
						savedMember.id
							? savedMember
							: current,
				);

				toast.success(
					"Member updated",
					`${savedMember.name} has been updated.`,
				);
			} else {
				setMembers((current) => [
					savedMember,
					...current,
				]);

				toast.success(
					"Member added",
					`${savedMember.name} has been added to your database.`,
				);
			}

			setFormOpen(false);
			setEditingMember(null);
		} catch (error) {
			console.error(
				"[MemberDatabase] Save failed:",
				error,
			);

			toast.error(
				"Failed to save member",
				error instanceof Error
					? error.message
					: "Please try again.",
			);

			throw error;
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		if (!deleteMember) {
			return;
		}

		setDeleting(true);

		try {
			const response = await fetch(
				`/api/members/${encodeURIComponent(
					deleteMember.id,
				)}`,
				{
					method: "DELETE",
				},
			);

			const data =
				await response.json();

			if (!response.ok) {
				throw new Error(
					data?.error ||
						"Failed to delete member.",
				);
			}

			setMembers((current) =>
				current.filter(
					(member) =>
						member.id !==
						deleteMember.id,
				),
			);

			if (
				selectedMember?.id ===
				deleteMember.id
			) {
				setSelectedMember(null);
			}

			toast.success(
				"Member deleted",
				`${deleteMember.name} has been removed from your member database.`,
			);

			setDeleteMember(null);
		} catch (error) {
			console.error(
				"[MemberDatabase] Delete failed:",
				error,
			);

			toast.error(
				"Failed to delete member",
				error instanceof Error
					? error.message
					: "Please try again.",
			);
		} finally {
			setDeleting(false);
		}
	}

	return (
		<>
			<div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
				<MemberList
					members={sortedMembers}
					search={search}
					loading={loading}
					onSearchChange={
						setSearch
					}
					onRefresh={() =>
						void loadMembers()
					}
					onAdd={handleAdd}
					onEdit={handleEdit}
					onDelete={
						setDeleteMember
					}
					onEvents={
						handleOpenEvents
					}
				/>
			</div>

			{selectedMember && (
				<MemberEventPanel
					member={
						selectedMember
					}
					onClose={() =>
						setSelectedMember(
							null,
						)
					}
				/>
			)}

			{formOpen && (
				<div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
					<button
						type="button"
						aria-label="Close member form"
						className="absolute inset-0 cursor-default"
						onClick={
							handleCloseForm
						}
						disabled={saving}
					/>

					<div className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5 shadow-2xl sm:max-w-xl sm:rounded-3xl">
						<MemberForm
							member={
								editingMember
							}
							loading={
								saving
							}
							onSubmit={
								handleSubmit
							}
							onCancel={
								handleCloseForm
							}
						/>
					</div>
				</div>
			)}

			<ConfirmDialog
				open={Boolean(
					deleteMember,
				)}
				title="Delete Member?"
				description={
					deleteMember
						? `Are you sure you want to delete ${deleteMember.name}? All event-specific data belonging to this member will also be removed.`
						: undefined
				}
				confirmText={
					deleting
						? "Deleting..."
						: "Delete"
				}
				cancelText="Cancel"
				variant="danger"
				onConfirm={() => {
					if (!deleting) {
						void handleDelete();
					}
				}}
				onClose={() => {
					if (!deleting) {
						setDeleteMember(
							null,
						);
					}
				}}
			/>
		</>
	);
}