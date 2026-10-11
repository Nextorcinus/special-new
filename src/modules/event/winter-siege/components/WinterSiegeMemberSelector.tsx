"use client";

import { Search, Users } from "lucide-react";
import { useMemo, useState } from "react";

import type {
	WinterSiegeMember,
	WinterSiegeSquadId,
} from "../types/winter-siege.types";

import WinterSiegeMemberCard from "./WinterSiegeMemberCard";

type WinterSiegeMemberSelectorProps = {
	members: WinterSiegeMember[];
	selectedSquads: Set<string>;
	onAddSquad: (
		memberId: string,
		squadId: WinterSiegeSquadId,
	) => void;
	onRemoveSquad: (
		memberId: string,
		squadId: WinterSiegeSquadId,
	) => void;
};

export default function WinterSiegeMemberSelector({
	members,
	selectedSquads,
	onAddSquad,
	onRemoveSquad,
}: WinterSiegeMemberSelectorProps) {
	const [query, setQuery] = useState("");

	const filteredMembers = useMemo(() => {
		const normalizedQuery =
			query.trim().toLowerCase();

		if (!normalizedQuery) {
			return members;
		}

		return members.filter((member) =>
			member.name
				.toLowerCase()
				.includes(normalizedQuery),
		);
	}, [members, query]);

	return (
		<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
			<div className="border-b border-[var(--sl-border)] p-4 sm:p-5">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex min-w-0 items-center gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-input)] text-[var(--sl-text-muted)]">
							<Users className="size-5" />
						</div>

						<div className="min-w-0">
							<h2 className="text-base font-bold text-[var(--sl-text)]">
								Available Squads
							</h2>

							<p className="mt-0.5 text-xs leading-5 text-[var(--sl-text-muted)]">
								Select individual squads from your global member database.
							</p>
						</div>

						<div className="shrink-0 rounded-full bg-[var(--sl-input)] px-3 py-1.5 text-xs font-bold text-[var(--sl-text-muted)]">
							{members.length}
						</div>
					</div>

					<div className="flex h-10 w-full items-center gap-2 rounded-xl border border-[var(--sl-border)] bg-[var(--sl-input)] px-3 lg:max-w-xs">
						<Search className="size-4 shrink-0 text-[var(--sl-text-muted)]" />

						<input
							type="text"
							value={query}
							onChange={(event) =>
								setQuery(
									event.target.value,
								)
							}
							placeholder="Search members..."
							className="min-w-0 flex-1 bg-transparent text-sm text-[var(--sl-text)] outline-none placeholder:text-[var(--sl-text-muted)]"
						/>
					</div>
				</div>
			</div>

			<div className="max-h-[620px] overflow-y-auto p-3 sm:p-4">
				{filteredMembers.length === 0 ? (
					<div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center">
						<Users className="size-7 text-[var(--sl-text-muted)]" />

						<p className="mt-3 text-sm font-semibold text-[var(--sl-text)]">
							No members found
						</p>

						<p className="mt-1 max-w-sm text-xs leading-5 text-[var(--sl-text-muted)]">
							Try another search term or add members in the Member Database.
						</p>
					</div>
				) : (
					<div className="space-y-2">
						{filteredMembers.map((member) => (
							<WinterSiegeMemberCard
								key={member.id}
								member={member}
								selectedSquads={
									selectedSquads
								}
								onAddSquad={
									onAddSquad
								}
								onRemoveSquad={
									onRemoveSquad
								}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}