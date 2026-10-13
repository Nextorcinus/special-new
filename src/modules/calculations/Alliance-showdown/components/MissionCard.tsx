"use client";

import type { Mission } from "../utils/calculatePoints";
import {
  calculateMissionPoints,
  formatPoints,
} from "../utils/calculatePoints";

type MissionCardProps = {
  mission: Mission;
  index: number;
  onQuantityChange: (quantity: number) => void;
};

const priorityStyles = {
  great: {
    badge: "bg-[var(--sl-success)]/10 text-[var(--sl-success)]",
    border: "border-l-[var(--sl-success)]",
    label: "Great",
  },
  medium: {
    badge: "bg-[var(--sl-warning)]/10 text-[var(--sl-warning)]",
    border: "border-l-[var(--sl-warning)]",
    label: "Medium",
  },
  low: {
    badge:
      "bg-[var(--sl-text-muted)]/10 text-[var(--sl-text-muted)]",
    border: "border-l-[var(--sl-text-muted)]",
    label: "Low",
  },
};

export default function MissionCard({
  mission,
  index,
  onQuantityChange,
}: MissionCardProps) {
  const subtotal = calculateMissionPoints(mission);
  const priority = priorityStyles[mission.priority];

  // Alternating background for even and odd cards
  const backgroundClass =
    index % 2 === 0
      ? "bg-[var(--sl-surface)]"
      : "bg-[var(--sl-surface-2,var(--sl-surface))]";

  const handleQuantityChange = (value: number) => {
    if (!Number.isFinite(value)) {
      onQuantityChange(0);
      return;
    }

    onQuantityChange(Math.max(0, Math.floor(value)));
  };

  return (
    <article
      className={`min-w-0 rounded-xl border border-[var(--sl-border)] border-l-[3px] ${backgroundClass} p-3 transition-colors duration-200 hover:border-[var(--sl-primary)]/40`}
    >
      <div
        className={`-ml-3 -mt-3 mb-3 rounded-tl-xl border-l-[3px] border-transparent ${priority.border}`}
      />

      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 text-sm font-medium leading-snug text-[var(--sl-text)]">
          {mission.name}
        </h3>

        <span
          className={`shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold ${priority.badge}`}
        >
          ★ {priority.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5">
        <button
          type="button"
          aria-label={`Decrease ${mission.name}`}
          disabled={mission.quantity <= 0}
          onClick={() =>
            handleQuantityChange(mission.quantity - 1)
          }
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-input-hover)] hover:text-[var(--sl-text)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>

        <input
          type="number"
          min={0}
          step={1}
          value={mission.quantity}
          aria-label={`Quantity for ${mission.name}`}
          onChange={(event) =>
            handleQuantityChange(Number(event.target.value))
          }
          className="h-8 min-w-0 flex-1 rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-2 text-center text-sm font-medium text-[var(--sl-text)] outline-none transition-colors focus:border-[var(--sl-primary)]"
        />

        <button
          type="button"
          aria-label={`Increase ${mission.name}`}
          onClick={() =>
            handleQuantityChange(mission.quantity + 1)
          }
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-input-hover)] hover:text-[var(--sl-text)]"
        >
          +
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-t border-[var(--divider)] pt-2.5">
        <span className="text-[11px] leading-relaxed text-[var(--sl-text-muted)]">
          {formatPoints(mission.points)} pts each
          {mission.unit === "minute" ? " · per minute" : ""}
        </span>

        <span
          className={`text-xs font-semibold tabular-nums ${
            subtotal > 0
              ? "text-[var(--sl-success)]"
              : "text-[var(--sl-text-muted)]"
          }`}
        >
          {subtotal > 0
            ? `= ${formatPoints(subtotal)} pts`
            : "0 pts"}
        </span>
      </div>
    </article>
  );
}
