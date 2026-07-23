"use client";

import { Search, X } from "lucide-react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLInput from "@/components/ui/sl-ui/SLInput";
import SLSelect from "@/components/ui/sl-ui/SLSelect";

import {
	HERO_CLASS_OPTIONS,
	HERO_RARITY_OPTIONS,
} from "../helpers/hero.helpers";

import type {
	HeroFilterClass,
	HeroFilterGeneration,
	HeroFilterRarity,
	HeroFiltersValue,
} from "../type";

type HeroGenerationOption = {
	value: string;
	label: string;
};

type HeroFiltersProps = {
	value: HeroFiltersValue;
	generationOptions: HeroGenerationOption[];
	onChange: (value: HeroFiltersValue) => void;
	onReset: () => void;
};

export default function HeroFilters({
	value,
	generationOptions,
	onChange,
	onReset,
}: HeroFiltersProps) {
	const hasActiveFilters =
		value.search.trim() !== "" ||
		value.heroClass !== "all" ||
		value.rarity !== "all" ||
		value.generation !== "all";

	function updateFilter<Key extends keyof HeroFiltersValue>(
		key: Key,
		nextValue: HeroFiltersValue[Key],
	) {
		onChange({
			...value,
			[key]: nextValue,
		});
	}

	function clearSearch() {
		updateFilter("search", "");
	}

	return (
		<div className="space-y-3">
			<div className="relative">
				<Search
					size={16}
					className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[var(--sl-text-muted)]"
				/>

				<SLInput
					value={value.search}
					onChange={(event) => updateFilter("search", event.target.value)}
					placeholder="Search heroes..."
					className="pl-9 pr-9"
				/>

				{value.search.trim() !== "" && (
					<button
						type="button"
						onClick={clearSearch}
						aria-label="Clear hero search"
						className="absolute right-3 top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]"
					>
						<X size={14} />
					</button>
				)}
			</div>

			<div className="grid grid-cols-2 gap-2">
				<SLSelect
					value={String(value.heroClass)}
					onChange={(selected) =>
						updateFilter("heroClass", selected as HeroFilterClass)
					}
					placeholder="All Classes"
					options={HERO_CLASS_OPTIONS}
				/>

				<SLSelect
					value={String(value.generation)}
					onChange={(selected) =>
						updateFilter("generation", selected as HeroFilterGeneration)
					}
					placeholder="All Generations"
					options={generationOptions}
				/>

				<div className="col-span-2">
					<SLSelect
						value={String(value.rarity)}
						onChange={(selected) =>
							updateFilter("rarity", selected as HeroFilterRarity)
						}
						placeholder="All Rarities"
						options={HERO_RARITY_OPTIONS}
					/>
				</div>
			</div>

			{hasActiveFilters && (
				<div className="flex items-center justify-between gap-3 pt-1">
					<p className="text-[10px] text-[var(--sl-text-muted)]">
						Filters active
					</p>

					<SLButton
						type="button"
						variant="ghost"
						onClick={onReset}
						className="h-8 gap-1.5 px-3 text-xs"
					>
						<X size={14} />
						Reset
					</SLButton>
				</div>
			)}
		</div>
	);
}
