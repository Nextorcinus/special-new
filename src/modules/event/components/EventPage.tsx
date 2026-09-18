"use client";

import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

import SLButton from "@/components/ui/sl-ui/SLButton";

import EventList from "./EventList";

export default function EventPage() {
	return (
		<div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-xl font-black tracking-tight text-[var(--sl-text)] sm:text-2xl">
						Events
					</h1>

					<p className="mt-1.5 max-w-xl text-xs leading-5 text-[var(--sl-text-muted)] sm:text-sm">
						Build strategies, organize your members, and prepare for upcoming
						events.
					</p>
				</div>

				<Link href="/events/members">
					<SLButton className="w-full sm:w-auto">
						<Users className="mr-2 size-4" />
						Member Database
						<ArrowRight className="ml-2 size-3.5" />
					</SLButton>
				</Link>
			</div>

			<div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
				<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sl-text-muted)]">
						Events
					</p>

					<p className="mt-1 text-lg font-black text-[var(--sl-text)]">4</p>
				</div>

				<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sl-text-muted)]">
						Available
					</p>

					<p className="mt-1 text-lg font-black text-[var(--sl-primary)]">1</p>
				</div>

				<div className="col-span-2 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4 sm:col-span-1">
					<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sl-text-muted)]">
						Reusable Members
					</p>

					<p className="mt-1 text-lg font-black text-[var(--sl-text)]">∞</p>
				</div>
			</div>

			<div className="mt-8">
				<div className="mb-4">
					<h2 className="text-sm font-bold text-[var(--sl-text)]">
						Event Strategies
					</h2>

					<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
						Choose an event to start planning.
					</p>
				</div>

				<EventList />
			</div>
		</div>
	);
}
