"use client";

import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import SLButton from "@/components/ui/sl-ui/SLButton";

import { getHeroes } from "@/modules/heroes";

import { createBearHeroPickerOptions } from "../helpers/bear.helpers";
import { useBearRecommendationStore } from "../store/bear-recommendation.store";

import BearHeroPicker from "./BearHeroPicker";

export default function BearRecommendationEditor() {
	const heroes = useMemo(() => getHeroes(), []);

	const heroOptions = useMemo(
		() => createBearHeroPickerOptions(heroes),
		[heroes],
	);

	const {
		data,
		addOpeningHero,
		removeOpeningHero,
		addJoiningHero,
		removeJoiningHero,
		moveJoiningHero,
		setJoiningHero,
		resetRecommendation,
	} = useBearRecommendationStore();

	const [picker, setPicker] = useState<{
		type: "opening" | "joining";
		group?: "p2w" | "f2p";
		itemId?: string;
	} | null>(null);

	function closePicker() {
		setPicker(null);
	}

	function selectHero(heroId: string) {
		if (!picker) {
			return;
		}

		if (picker.type === "opening" && picker.group) {
			addOpeningHero(picker.group, heroId);
		}

		if (picker.type === "joining" && picker.itemId) {
			setJoiningHero(picker.itemId, heroId);
		}

		closePicker();
	}

	return (
		<div className="space-y-5">
			{/* Opening Rally */}
			<section className="rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-black text-[var(--sl-text)]">
						Opening Rally
					</h3>

					<SLButton
						type="button"
						variant="ghost"
						onClick={resetRecommendation}
						className="h-8 gap-2 px-3 text-xs"
					>
						<RotateCcw size={14} />
						Reset
					</SLButton>
				</div>

				<div className="mt-5 grid gap-4 md:grid-cols-2">
					{(["p2w", "f2p"] as const).map((group) => (
						<div key={group} className="rounded-2xl bg-[var(--sl-active)] p-3">
							<div className="flex items-center justify-between">
								<h4 className="text-xs font-black text-[var(--sl-text)]">
									{group.toUpperCase()}
								</h4>

								<SLButton
									type="button"
									size="sm"
									onClick={() =>
										setPicker({
											type: "opening",
											group,
										})
									}
								>
									<Plus size={14} />
								</SLButton>
							</div>

							<div className="mt-3 space-y-2">
								{data.openingRallies[group].map((heroId) => (
									<div
										key={heroId}
										className="flex items-center justify-between rounded-xl bg-[var(--sl-surface)] px-3 py-2"
									>
										<p className="text-xs font-bold text-[var(--sl-text)]">
											{heroId}
										</p>

										<button
											type="button"
											onClick={() => removeOpeningHero(group, heroId)}
										>
											<Trash2 size={15} />
										</button>
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Joining */}
			<section className="rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-black text-[var(--sl-text)]">
						Joining Priority
					</h3>

					<SLButton type="button" size="sm" onClick={() => addJoiningHero()}>
						<Plus size={14} />
					</SLButton>
				</div>

				<div className="mt-4 space-y-2">
					{data.joiningPriority.map((item, index) => (
						<div
							key={item.id}
							className="flex items-center gap-2 rounded-2xl bg-[var(--sl-active)] p-3"
						>
							<div className="w-8 text-center text-sm font-black">
								{item.priority}
							</div>

							<button
								type="button"
								onClick={() =>
									setPicker({
										type: "joining",
										itemId: item.id,
									})
								}
								className="flex-1 rounded-xl bg-[var(--sl-surface)] px-3 py-2 text-left text-xs font-bold"
							>
								{item.heroId ?? item.label}
							</button>

							<div className="flex flex-col">
								<button
									type="button"
									disabled={index === 0}
									onClick={() => moveJoiningHero(item.id, "up")}
								>
									<ArrowUp size={15} />
								</button>

								<button
									type="button"
									disabled={index === data.joiningPriority.length - 1}
									onClick={() => moveJoiningHero(item.id, "down")}
								>
									<ArrowDown size={15} />
								</button>
							</div>

							<button type="button" onClick={() => removeJoiningHero(item.id)}>
								<Trash2 size={15} />
							</button>
						</div>
					))}
				</div>
			</section>

			{picker && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
					<div className="w-full max-w-md">
						<BearHeroPicker
							title="Select Hero"
							options={heroOptions}
							onSelect={selectHero}
							onClose={closePicker}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
