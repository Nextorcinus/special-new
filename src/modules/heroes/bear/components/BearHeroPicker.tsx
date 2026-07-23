"use client";

import { Search, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLInput from "@/components/ui/sl-ui/SLInput";

import type { BearHeroPickerOption } from "../type";

type BearHeroPickerProps = {
	title?: string;
	options: BearHeroPickerOption[];
	selectedHeroIds?: string[];
	onSelect: (heroId: string) => void;
	onClose?: () => void;
	allowMultiple?: boolean;
	emptyLabel?: string;
};

export default function BearHeroPicker({
	title = "Select Hero",
	options,
	selectedHeroIds = [],
	onSelect,
	onClose,
	allowMultiple = false,
	emptyLabel = "No heroes found.",
}: BearHeroPickerProps) {
	const [search, setSearch] = useState("");

	const selectedIds = useMemo(
		() =>
			new Set(
				selectedHeroIds.map((heroId) => normalizeComparableValue(heroId)),
			),
		[selectedHeroIds],
	);

	const filteredOptions = useMemo(() => {
		const normalizedSearch = normalizeComparableValue(search);

		if (!normalizedSearch) {
			return options;
		}

		return options.filter((option) => {
			const searchableText = [
				option.label,
				option.value,
				option.heroClass,
				option.rarity,
				option.generation,
				option.tier,
			]
				.map(normalizeComparableValue)
				.join(" ");

			return searchableText.includes(normalizedSearch);
		});
	}, [options, search]);

	function handleSelect(heroId: string) {
		onSelect(heroId);

		if (!allowMultiple) {
			onClose?.();
		}
	}

	return (
		<div className="overflow-hidden rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
			<div className="flex items-center justify-between gap-3 border-b border-[var(--sl-border)] px-4 py-3">
				<div className="min-w-0">
					<h3 className="truncate text-sm font-black text-[var(--sl-text)]">
						{title}
					</h3>

					<p className="mt-0.5 text-[10px] text-[var(--sl-text-muted)]">
						Choose a hero from your database.
					</p>
				</div>

				{onClose && (
					<button
						type="button"
						onClick={onClose}
						aria-label="Close hero picker"
						className="flex size-8 shrink-0 items-center justify-center rounded-full text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]"
					>
						<X size={16} />
					</button>
				)}
			</div>

			<div className="p-4">
				<div className="relative">
					<Search
						size={16}
						className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--sl-text-muted)]"
					/>

					<SLInput
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search hero..."
						className="pl-9 pr-9"
					/>

					{search.trim() !== "" && (
						<button
							type="button"
							onClick={() => setSearch("")}
							aria-label="Clear hero search"
							className="absolute right-3 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]"
						>
							<X size={14} />
						</button>
					)}
				</div>

				<div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-1">
					{filteredOptions.length === 0 ? (
						<div className="rounded-2xl bg-[var(--sl-active)] px-4 py-8 text-center">
							<p className="text-xs text-[var(--sl-text-muted)]">
								{emptyLabel}
							</p>
						</div>
					) : (
						filteredOptions.map((option) => {
							const isSelected = selectedIds.has(
								normalizeComparableValue(option.value),
							);

							return (
								<button
									key={option.value}
									type="button"
									onClick={() => handleSelect(option.value)}
									className={[
										"flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors",
										isSelected
											? "border-[var(--sl-primary)] bg-[var(--sl-primary)]/10"
											: "border-transparent bg-[var(--sl-active)] hover:border-[var(--sl-border)]",
									].join(" ")}
								>
									<div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-black/20">
										<Image
											src={option.thumbnail}
											alt={option.label}
											fill
											sizes="48px"
											className="object-cover object-top"
										/>
									</div>

									<div className="min-w-0 flex-1">
										<p className="truncate text-xs font-black text-[var(--sl-text)]">
											{option.label}
										</p>

										<div className="mt-1 flex flex-wrap gap-1.5">
											<PickerBadge>{String(option.heroClass)}</PickerBadge>

											<PickerBadge>{String(option.rarity)}</PickerBadge>

											{option.tier && (
												<PickerBadge>Tier {String(option.tier)}</PickerBadge>
											)}
										</div>
									</div>

									{isSelected && (
										<span className="shrink-0 rounded-full bg-[var(--sl-primary)] px-2 py-1 text-[9px] font-black text-[var(--sl-primary-foreground)]">
											Selected
										</span>
									)}
								</button>
							);
						})
					)}
				</div>

				{onClose && (
					<div className="mt-4 flex justify-end">
						<SLButton
							type="button"
							variant="ghost"
							onClick={onClose}
							className="h-9 px-4 text-xs"
						>
							Close
						</SLButton>
					</div>
				)}
			</div>
		</div>
	);
}

function PickerBadge({ children }: { children: React.ReactNode }) {
	return (
		<span className="rounded-full bg-[var(--sl-surface)] px-2 py-1 text-[8px] font-bold text-[var(--sl-text-muted)]">
			{children}
		</span>
	);
}

function normalizeComparableValue(value: unknown): string {
	return String(value ?? "")
		.trim()
		.toLowerCase();
}
