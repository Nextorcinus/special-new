"use client";

import {
	BriefcaseBusiness,
	Plus,
	ShieldCheck,
	Sparkles,
	Zap,
} from "lucide-react";

import SLButton from "@/components/ui/sl-ui/SLButton";

import type { UnlockT12CalculationResult } from "../type";

type UnlockT12ResultProps = {
	result: UnlockT12CalculationResult;
	title?: string;
	showAddButton?: boolean;
	onAddItem?: () => void;
};

function formatNumber(value: unknown): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return "0";
	}

	return new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 2,
	}).format(number);
}

function formatAttributeValue(value: unknown, unit?: string): string {
	const number = Number(value ?? 0);

	if (!Number.isFinite(number)) {
		return `+0${unit ?? ""}`;
	}

	return `+${formatNumber(number)}${unit ?? ""}`;
}

function ResultSection({
	title,
	icon,
	children,
}: {
	title: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
			<div className="mb-4 flex items-center gap-2">
				<div className="flex size-8 items-center justify-center rounded-xl bg-[var(--sl-active)] text-[var(--sl-primary)]">
					{icon}
				</div>

				<p className="text-sm font-bold text-[var(--sl-text)]">{title}</p>
			</div>

			<div className="space-y-3">{children}</div>
		</div>
	);
}

function ResultRow({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-4">
			<p className="min-w-0 text-xs text-[var(--sl-text-muted)]">{label}</p>

			<p className="shrink-0 text-sm font-bold text-[var(--sl-text)]">
				{value}
			</p>
		</div>
	);
}

export default function UnlockT12Result({
	result,
	title = "Unlock T12 Result",
	showAddButton = false,
	onAddItem,
}: UnlockT12ResultProps) {
	const hasAttributes = result.attributes.length > 0;

	return (
		<div className="space-y-4">
			<div className="rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<p className="text-xs font-medium text-[var(--sl-text-muted)]">
							{result.category}
						</p>

						<h2 className="mt-1 truncate text-lg font-bold text-[var(--sl-text)]">
							{title}
						</h2>

						<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
							{result.research}
						</p>
					</div>

					<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sl-active)] text-[var(--sl-primary)]">
						<ShieldCheck className="size-5" />
					</div>
				</div>

				<div className="mt-5 flex items-center justify-between rounded-2xl bg-[var(--sl-active)] px-4 py-3">
					<div>
						<p className="text-[11px] text-[var(--sl-text-muted)]">
							Level Range
						</p>

						<p className="mt-1 text-sm font-bold text-[var(--sl-text)]">
							Lv.{result.fromLevel} → Lv.{result.toLevel}
						</p>
					</div>

					<div className="text-right">
						<p className="text-[11px] text-[var(--sl-text-muted)]">
							Levels Upgraded
						</p>

						<p className="mt-1 text-sm font-bold text-[var(--sl-text)]">
							{result.selectedLevels.length}
						</p>
					</div>
				</div>
			</div>

			<ResultSection title="Power Increase" icon={<Zap className="size-4" />}>
				<ResultRow label="Power" value={`+${formatNumber(result.power)}`} />
			</ResultSection>

			{hasAttributes && (
				<ResultSection
					title="Attributes"
					icon={<Sparkles className="size-4" />}
				>
					{result.attributes.map((attribute) => (
						<ResultRow
							key={`${attribute.name}-${attribute.unit}`}
							label={attribute.name}
							value={formatAttributeValue(attribute.value, attribute.unit)}
						/>
					))}
				</ResultSection>
			)}

			<ResultSection
				title="Base Resources"
				icon={<BriefcaseBusiness className="size-4" />}
			>
				<ResultRow label="Steel" value={formatNumber(result.resources.Steel)} />
			</ResultSection>

			<ResultSection
				title="Fire Crystals"
				icon={<Sparkles className="size-4" />}
			>
				<ResultRow
					label="Refined Fire Crystal"
					value={formatNumber(result.resources.RFC)}
				/>

				<ResultRow
					label="Fire Crystal Shard"
					value={formatNumber(result.resources.Shard)}
				/>
			</ResultSection>

			{showAddButton && onAddItem && (
				<SLButton type="button" className="w-full" onClick={onAddItem}>
					<Plus className="mr-2 size-4" />
					Add Another
				</SLButton>
			)}
		</div>
	);
}
