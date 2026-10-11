"use client";

import { Check, Shield, UserPlus, Zap } from "lucide-react";

import type {
	WinterSiegeMember,
	WinterSiegeSquadId,
} from "../types/winter-siege.types";

type WinterSiegeMemberCardProps = {
	member: WinterSiegeMember;
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

	const number = Number(
		raw.replace(/,/g, ""),
	);

	if (!Number.isFinite(number)) {
		return raw;
	}

	if (number >= 1_000_000_000_000) {
		return `${(
			number / 1_000_000_000_000
		).toLocaleString("en-US", {
			maximumFractionDigits: 3,
		})}T`;
	}

	if (number >= 1_000_000_000) {
		return `${(
			number / 1_000_000_000
		).toLocaleString("en-US", {
			maximumFractionDigits: 3,
		})}B`;
	}

	if (number >= 1_000_000) {
		return `${(
			number / 1_000_000
		).toLocaleString("en-US", {
			maximumFractionDigits: 3,
		})}M`;
	}

	if (number >= 1_000) {
		return `${(
			number / 1_000
		).toLocaleString("en-US", {
			maximumFractionDigits: 3,
		})}K`;
	}

	return number.toLocaleString("en-US");
}

function SquadOption({
	name,
	power,
	selected,
	onAdd,
	onRemove,
}: {
	name: string;
	power: unknown;
	selected: boolean;
	onAdd: () => void;
	onRemove: () => void;
}) {
	return (
		<div
			className={[
				"flex min-w-0 items-center gap-3 rounded-xl border px-4 py-3 transition-all",
				selected
					? "border-[var(--sl-primary)]/40 bg-[var(--sl-primary)]/5"
					: "border-[var(--sl-border)] bg-[var(--sl-input)]",
			].join(" ")}
		>
			<div className="min-w-0 flex-1">
				<div className="flex min-w-0 items-center gap-2">
					<Shield
						className={[
							"size-4 shrink-0",
							selected
								? "text-[var(--sl-primary)]"
								: "text-[var(--sl-text-muted)]",
						].join(" ")}
					/>

					<p className="truncate text-sm font-bold text-[var(--sl-text)]">
						{name}
					</p>

					<span className="shrink-0 text-sm font-black text-[var(--sl-text)]">
						{formatPower(power)}
					</span>
				</div>

				<p className="mt-1 pl-6 text-xs text-[var(--sl-text-muted)]">
					{selected
						? "Ready for map placement"
						: "Available for this plan"}
				</p>
			</div>

			{selected ? (
				<button
					type="button"
					onClick={onRemove}
					className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[var(--sl-primary)] px-3.5 text-xs font-bold text-[var(--sl-primary-foreground)] transition-all hover:opacity-90 active:scale-[0.98]"
				>
					<Check className="size-3.5" />
					In Plan
				</button>
			) : (
				<button
					type="button"
					onClick={onAdd}
					className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[var(--sl-surface)] px-3.5 text-xs font-bold text-[var(--sl-text)] transition-all hover:bg-[var(--sl-hover)] active:scale-[0.98]"
				>
					<UserPlus className="size-3.5" />
					Add
				</button>
			)}
		</div>
	);
}

export default function WinterSiegeMemberCard({
	member,
	selectedSquads,
	onAddSquad,
	onRemoveSquad,
}: WinterSiegeMemberCardProps) {
	const squad1Key = `${member.id}:squad-1`;
	const squad2Key = `${member.id}:squad-2`;

	const squad1Selected =
		selectedSquads.has(squad1Key);

	const squad2Selected =
		selectedSquads.has(squad2Key);

	return (
		<div className="rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface)] px-4 py-4 transition-colors hover:border-[var(--sl-primary)]/25 lg:px-5 lg:py-4">
			<div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center lg:gap-8">
				{/* Member information */}
				<div className="flex min-w-0 items-center gap-3">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-input)] text-sm font-black text-[var(--sl-text)]">
						{member.name
							.charAt(0)
							.toUpperCase()}
					</div>

					<div className="min-w-0 flex-1">
						<h3 className="truncate text-sm font-bold text-[var(--sl-text)]">
							{member.name}
						</h3>

						<div className="mt-1.5 flex flex-wrap items-center gap-2">
							<span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--sl-text-muted)]">
								<Shield className="size-3.5" />
								Furnace {member.furnace}
							</span>

							{member.power && (
								<span className="inline-flex items-center gap-1 rounded-full bg-[var(--sl-primary)]/10 px-2 py-0.5 text-xs font-bold text-[var(--sl-primary)]">
									<Zap className="size-3" />
									{formatPower(
										member.power,
									)}
								</span>
							)}
						</div>
					</div>
				</div>

				{/* Squads */}
				<div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
					<SquadOption
						name="Squad 1"
						power={
							member.eventData
								?.squad1Power
						}
						selected={squad1Selected}
						onAdd={() =>
							onAddSquad(
								member.id,
								"squad-1",
							)
						}
						onRemove={() =>
							onRemoveSquad(
								member.id,
								"squad-1",
							)
						}
					/>

					<SquadOption
						name="Squad 2"
						power={
							member.eventData
								?.squad2Power
						}
						selected={squad2Selected}
						onAdd={() =>
							onAddSquad(
								member.id,
								"squad-2",
							)
						}
						onRemove={() =>
							onRemoveSquad(
								member.id,
								"squad-2",
							)
						}
					/>
				</div>
			</div>
		</div>
	);
}