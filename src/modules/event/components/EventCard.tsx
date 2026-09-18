"use client";

import { ArrowRight, Lock, Sparkles } from "lucide-react";
import Link from "next/link";

import type { EventDefinition } from "../config/event.config";

type EventCardProps = {
	event: EventDefinition;
};

export default function EventCard({ event }: EventCardProps) {
	const Icon = event.icon;

	if (!event.available) {
		return (
			<div className="group relative overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5 opacity-70">
				<div className="absolute right-4 top-4">
					<div className="flex size-8 items-center justify-center rounded-lg bg-[var(--sl-input)] text-[var(--sl-text-muted)]">
						<Lock className="size-3.5" />
					</div>
				</div>

				<div className="flex size-12 items-center justify-center rounded-xl bg-[var(--sl-input)] text-[var(--sl-text-muted)]">
					<Icon className="size-5" />
				</div>

				<div className="mt-4 pr-8">
					<h2 className="text-sm font-bold text-[var(--sl-text)]">
						{event.name}
					</h2>

					<p className="mt-1.5 text-xs leading-5 text-[var(--sl-text-muted)]">
						{event.description}
					</p>
				</div>

				<div className="mt-5 flex items-center gap-2">
					<span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--sl-input)] px-2.5 py-1 text-[10px] font-bold text-[var(--sl-text-muted)]">
						<Lock className="size-3" />
						Coming Soon
					</span>
				</div>
			</div>
		);
	}

	return (
		<Link
			href={event.route}
			className="group relative block overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--sl-primary)]/40 hover:bg-[var(--sl-surface-2)]/40 hover:shadow-xl"
		>
			<div className="absolute -right-8 -top-8 size-32 rounded-full bg-[var(--sl-primary)]/5 blur-2xl transition-all duration-300 group-hover:bg-[var(--sl-primary)]/10" />

			<div className="relative flex items-start justify-between gap-4">
				<div className="flex size-12 items-center justify-center rounded-xl bg-[var(--sl-primary)]/10 text-[var(--sl-primary)] transition-transform duration-200 group-hover:scale-105">
					<Icon className="size-5" />
				</div>

				<div className="flex size-8 items-center justify-center rounded-lg text-[var(--sl-text-muted)] transition-all duration-200 group-hover:bg-[var(--sl-primary)]/10 group-hover:text-[var(--sl-primary)]">
					<ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
				</div>
			</div>

			<div className="relative mt-4">
				<div className="flex items-center gap-2">
					<h2 className="text-sm font-bold text-[var(--sl-text)]">
						{event.name}
					</h2>

					<Sparkles className="size-3.5 text-[var(--sl-primary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
				</div>

				<p className="mt-1.5 text-xs leading-5 text-[var(--sl-text-muted)]">
					{event.description}
				</p>
			</div>

			<div className="relative mt-5 border-t border-[var(--sl-border)] pt-3">
				<span className="text-[10px] font-bold text-[var(--sl-primary)]">
					Open Strategy
				</span>
			</div>
		</Link>
	);
}
