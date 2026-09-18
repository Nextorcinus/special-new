"use client";

import {
	CalendarDays,
	MoreVertical,
	Pencil,
	Shield,
	Trash2,
	Zap,
} from "lucide-react";
import { useState } from "react";

import type { Member } from "../types/member.types";

type MemberCardProps = {
	member: Member;
	onEdit: (member: Member) => void;
	onDelete: (member: Member) => void;
	onEvents: (member: Member) => void;
};

function formatPower(power: string | null): string {
	if (!power) {
		return "-";
	}

	const value = Number(power);

	if (!Number.isFinite(value)) {
		return power;
	}

	if (value >= 1_000_000_000_000) {
		return `${formatDecimal(
			value / 1_000_000_000_000,
		)}T`;
	}

	if (value >= 1_000_000_000) {
		return `${formatDecimal(
			value / 1_000_000_000,
		)}B`;
	}

	if (value >= 1_000_000) {
		return `${formatDecimal(
			value / 1_000_000,
		)}M`;
	}

	if (value >= 1_000) {
		return `${formatDecimal(
			value / 1_000,
		)}K`;
	}

	return value.toLocaleString("en-US");
}

function formatDecimal(value: number): string {
	return value.toLocaleString("en-US", {
		maximumFractionDigits: 3,
	});
}

export default function MemberCard({
	member,
	onEdit,
	onDelete,
	onEvents,
}: MemberCardProps) {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<article className="group relative overflow-visible rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4 transition-all duration-200 hover:border-[var(--sl-primary)]/30 hover:bg-[var(--sl-surface-2)]/40">
			<div className="flex items-start gap-3">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-primary)]/10 text-sm font-black text-[var(--sl-primary)]">
					{member.name
						.charAt(0)
						.toUpperCase()}
				</div>

				<div className="min-w-0 flex-1">
					<h3 className="truncate text-sm font-bold text-[var(--sl-text)]">
						{member.name}
					</h3>

					<div className="mt-1 flex flex-wrap items-center gap-2">
						<span className="inline-flex items-center gap-1 rounded-full bg-[var(--sl-active)] px-2 py-1 text-[10px] font-bold text-[var(--sl-text-secondary)]">
							<Shield className="size-3" />

							Furnace {member.furnace}
						</span>

						{member.power && (
							<span className="inline-flex items-center gap-1 rounded-full bg-[var(--sl-primary)]/10 px-2 py-1 text-[10px] font-bold text-[var(--sl-primary)]">
								<Zap className="size-3" />

								{formatPower(
									member.power,
								)}
							</span>
						)}
					</div>
				</div>

				<div className="relative">
					<button
						type="button"
						aria-label={`Actions for ${member.name}`}
						onClick={() =>
							setMenuOpen((value) => !value)
						}
						className="flex size-8 items-center justify-center rounded-lg text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]"
					>
						<MoreVertical className="size-4" />
					</button>

					{menuOpen && (
						<>
							<button
								type="button"
								aria-label="Close menu"
								className="fixed inset-0 z-10 cursor-default"
								onClick={() =>
									setMenuOpen(false)
								}
							/>

							<div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-1.5 shadow-2xl">
								<button
									type="button"
									onClick={() => {
										setMenuOpen(
											false,
										);
										onEvents(member);
									}}
									className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-hover)]"
								>
									<CalendarDays className="size-3.5" />

									Event Data
								</button>

								<button
									type="button"
									onClick={() => {
										setMenuOpen(
											false,
										);
										onEdit(member);
									}}
									className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-hover)]"
								>
									<Pencil className="size-3.5" />

									Edit
								</button>

								<button
									type="button"
									onClick={() => {
										setMenuOpen(
											false,
										);
										onDelete(member);
									}}
									className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
								>
									<Trash2 className="size-3.5" />

									Delete
								</button>
							</div>
						</>
					)}
				</div>
			</div>

			<div className="mt-4 flex items-center justify-between border-t border-[var(--sl-border)] pt-3">
				<span className="text-[10px] text-[var(--sl-text-muted)]">
					Global Member
				</span>

				<button
					type="button"
					onClick={() => onEvents(member)}
					className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-[var(--sl-primary)] transition-colors hover:bg-[var(--sl-primary)]/10"
				>
					<CalendarDays className="size-3" />

					Event Data
				</button>
			</div>
		</article>
	);
}