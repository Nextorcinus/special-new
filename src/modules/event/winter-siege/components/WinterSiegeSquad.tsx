"use client";

import { ArrowLeft, Shield, Users, Zap } from "lucide-react";

import type { WinterSiegeMember } from "../types/winter-siege.types";

type WinterSiegeSquadProps = {
	squadId: "squad-1" | "squad-2";
	name: string;
	description: string;
	members: WinterSiegeMember[];
	onRemove: (memberId: string) => void;
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

function getMemberPower(
	member: WinterSiegeMember,
	squadId: "squad-1" | "squad-2",
) {
	return squadId === "squad-1"
		? member.eventData?.squad1Power
		: member.eventData?.squad2Power;
}

function calculateTotalPower(
	members: WinterSiegeMember[],
	squadId: "squad-1" | "squad-2",
): number {
	return members.reduce((total, member) => {
		const raw = getMemberPower(member, squadId);

		const number = Number(
			String(raw ?? "")
				.replace(/,/g, "")
				.trim(),
		);

		if (!Number.isFinite(number)) {
			return total;
		}

		return total + number;
	}, 0);
}

export default function WinterSiegeSquad({
	squadId,
	name,
	description,
	members,
	onRemove,
}: WinterSiegeSquadProps) {
	const totalPower = calculateTotalPower(members, squadId);

	return (
		<div className="flex min-h-[260px] flex-col rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
			<div className="border-b border-[var(--sl-border)] p-4">
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-3">
						<div className="flex size-10 items-center justify-center rounded-xl bg-[var(--sl-primary)]/10 text-[var(--sl-primary)]">
							<Shield className="size-5" />
						</div>

						<div>
							<h3 className="text-sm font-bold text-[var(--sl-text)]">
								{name}
							</h3>

							<p className="mt-0.5 text-[10px] text-[var(--sl-text-muted)]">
								{description}
							</p>
						</div>
					</div>

					<div className="text-right">
						<p className="text-[9px] font-semibold uppercase tracking-wider text-[var(--sl-text-muted)]">
							Members
						</p>

						<p className="mt-0.5 text-sm font-black text-[var(--sl-text)]">
							{members.length}
						</p>
					</div>
				</div>

				<div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--sl-input)] px-3 py-2.5">
					<div className="flex items-center gap-2">
						<Zap className="size-3.5 text-[var(--sl-primary)]" />

						<span className="text-[10px] font-semibold text-[var(--sl-text-muted)]">
							Total Squad Power
						</span>
					</div>

					<span className="text-xs font-black text-[var(--sl-text)]">
						{formatPower(totalPower)}
					</span>
				</div>
			</div>

			<div className="flex-1 p-3">
				{members.length === 0 ? (
					<div className="flex min-h-[150px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--sl-border)] px-4 text-center">
						<Users className="size-5 text-[var(--sl-text-muted)]" />

						<p className="mt-2 text-xs font-semibold text-[var(--sl-text)]">
							No members assigned
						</p>

						<p className="mt-1 text-[10px] leading-4 text-[var(--sl-text-muted)]">
							Select members from the available list.
						</p>
					</div>
				) : (
					<div className="space-y-2">
						{members.map((member) => (
							<div
								key={member.id}
								className="flex items-center gap-3 rounded-xl bg-[var(--sl-input)] px-3 py-2.5"
							>
								<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-surface)] text-[10px] font-black text-[var(--sl-text)]">
									{member.name.charAt(0).toUpperCase()}
								</div>

								<div className="min-w-0 flex-1">
									<p className="truncate text-xs font-bold text-[var(--sl-text)]">
										{member.name}
									</p>

									<p className="mt-0.5 text-[9px] text-[var(--sl-text-muted)]">
										Furnace {member.furnace} ·{" "}
										{formatPower(getMemberPower(member, squadId))}
									</p>
								</div>

								<button
									type="button"
									onClick={() => onRemove(member.id)}
									className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]"
									aria-label={`Remove ${member.name}`}
								>
									<ArrowLeft className="size-3.5" />
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
