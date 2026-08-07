"use client";

import Image from "next/image";

import type { MilestoneCard, MilestoneResult } from "../type";

type Props = {
	milestone: MilestoneResult;
	upcoming?: boolean;
};

function StateMilestoneItem({ card }: { card: MilestoneCard }) {
	return (
		<div className="rounded-xl border bg-muted/30 p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-muted/50 hover:shadow-md">
			<div className="flex flex-col items-center text-center">
				<Image
					src={`/${card.folder}/${card.image}`}
					alt={card.name}
					width={90}
					height={90}
					className="rounded-xl object-contain"
				/>

				<p className="mt-3 text-sm font-semibold leading-tight">{card.name}</p>

				{card.acquisition?.length ? (
					<div className="mt-3 flex flex-wrap justify-center gap-2">
						{card.acquisition.map((method) => (
							<Image
								key={method}
								src={`/icons/${method}.png`}
								alt={method}
								width={22}
								height={22}
								title={method}
								className="object-contain"
							/>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
}

export default function StateMilestoneCard({
	milestone,
	upcoming = false,
}: Props) {
	return (
		<div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
			<div className="flex items-start justify-between border-b bg-muted/20 px-6 py-5">
				<div className="space-y-3">
					<div className="flex flex-wrap items-center gap-3">
						<h3 className="text-xl font-bold">{milestone.name}</h3>

						<span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
							Day {milestone.days}
						</span>
					</div>

					{milestone.details?.map((detail) => (
						<p key={detail} className="text-sm text-muted-foreground">
							{detail}
						</p>
					))}
				</div>

				<div className="shrink-0">
					<div
						className={`rounded-full px-4 py-2 text-sm font-semibold ${
							upcoming
								? "bg-green-500/15 text-green-500"
								: "bg-muted text-muted-foreground"
						}`}
					>
						{upcoming
							? `${milestone.daysLeft} Days Left`
							: `${milestone.daysAgo} Days Ago`}
					</div>
				</div>
			</div>

			{milestone.cards?.length ? (
				<div className="grid grid-cols-2 gap-5 p-6 md:grid-cols-3 xl:grid-cols-4">
					{milestone.cards.map((card) => (
						<StateMilestoneItem
							key={`${milestone.days}-${card.folder}-${card.image}`}
							card={card}
						/>
					))}
				</div>
			) : null}

			{milestone.heroGroups?.length ? (
				<>
					{milestone.heroGroups.map((group) => (
						<div key={group.groupName} className="border-t p-6">
							<h4 className="mb-5 text-lg font-semibold">{group.groupName}</h4>

							<div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
								{group.cards.map((card) => (
									<StateMilestoneItem
										key={`${group.groupName}-${card.folder}-${card.image}`}
										card={card}
									/>
								))}
							</div>
						</div>
					))}
				</>
			) : null}
		</div>
	);
}
