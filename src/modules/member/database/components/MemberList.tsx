"use client";

import {
	Search,
	Users,
	UserPlus,
	RefreshCw,
} from "lucide-react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLInput from "@/components/ui/sl-ui/SLInput";

import MemberCard from "./MemberCard";
import type { Member } from "../types/member.types";

type MemberListProps = {
	members: Member[];
	search: string;
	loading: boolean;
	onSearchChange: (value: string) => void;
	onRefresh: () => void;
	onAdd: () => void;
	onEdit: (member: Member) => void;
	onDelete: (member: Member) => void;
	onEvents: (member: Member) => void;
};

export default function MemberList({
	members,
	search,
	loading,
	onSearchChange,
	onRefresh,
	onAdd,
	onEdit,
	onDelete,
	onEvents,
}: MemberListProps) {
	const normalizedSearch =
		search.trim().toLowerCase();

	const filteredMembers = members.filter(
		(member) =>
			member.name
				.toLowerCase()
				.includes(normalizedSearch),
	);

	return (
		<div className="space-y-5">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<div className="flex items-center gap-2">
						<Users className="size-5 text-[var(--sl-primary)]" />

						<h1 className="text-xl font-black text-[var(--sl-text)]">
							Member Database
						</h1>
					</div>

					<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
						Manage your reusable event members.
					</p>
				</div>

				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={onRefresh}
						disabled={loading}
						aria-label="Refresh members"
						className="flex size-10 items-center justify-center rounded-full border border-[var(--sl-border)] bg-[var(--sl-surface)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)] disabled:opacity-50"
					>
						<RefreshCw
							className={`size-4 ${
								loading
									? "animate-spin"
									: ""
							}`}
						/>
					</button>

					<SLButton onClick={onAdd}>
						<UserPlus className="mr-2 size-4" />

						Add Member
					</SLButton>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
					<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-text-muted)]">
						Total Members
					</p>

					<p className="mt-1 text-2xl font-black text-[var(--sl-text)]">
						{members.length}
					</p>
				</div>

				<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
					<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-text-muted)]">
						Visible
					</p>

					<p className="mt-1 text-2xl font-black text-[var(--sl-text)]">
						{filteredMembers.length}
					</p>
				</div>

				<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
					<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-text-muted)]">
						Event Data
					</p>

					<p className="mt-1 text-2xl font-black text-[var(--sl-primary)]">
						Manage
					</p>
				</div>
			</div>

			<div className="relative">
				<Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--sl-text-muted)]" />

				<SLInput
					value={search}
					onChange={(event) =>
						onSearchChange(
							event.target.value,
						)
					}
					placeholder="Search members..."
					className="pl-11"
				/>
			</div>

			{loading &&
			members.length === 0 ? (
				<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] px-4 py-12 text-center">
					<RefreshCw className="mx-auto size-6 animate-spin text-[var(--sl-primary)]" />

					<p className="mt-3 text-sm font-semibold text-[var(--sl-text)]">
						Loading members...
					</p>
				</div>
			) : filteredMembers.length ===
			  0 ? (
				<div className="rounded-2xl border border-dashed border-[var(--sl-border)] bg-[var(--sl-surface)] px-4 py-14 text-center">
					<div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[var(--sl-primary)]/10 text-[var(--sl-primary)]">
						<Users className="size-6" />
					</div>

					<h2 className="mt-4 text-sm font-bold text-[var(--sl-text)]">
						{search.trim()
							? "No members found"
							: "Your member database is empty"}
					</h2>

					<p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-[var(--sl-text-muted)]">
						{search.trim()
							? "Try another search term."
							: "Add your alliance members here. They can later be reused across events."}
					</p>

					{!search.trim() && (
						<div className="mt-5">
							<SLButton
								onClick={
									onAdd
								}
							>
								<UserPlus className="mr-2 size-4" />

								Add First Member
							</SLButton>
						</div>
					)}
				</div>
			) : (
				<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
					{filteredMembers.map(
						(member) => (
							<MemberCard
								key={
									member.id
								}
								member={
									member
								}
								onEdit={
									onEdit
								}
								onDelete={
									onDelete
								}
								onEvents={
									onEvents
								}
							/>
						),
					)}
				</div>
			)}
		</div>
	);
}