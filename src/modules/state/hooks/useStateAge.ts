"use client";

import { useEffect, useMemo, useState } from "react";

import { getStateAgeData } from "../api";
import { calculateStateAge } from "../lib/calculateStateAge";
import { getMilestones } from "../lib/milestones";

import type { MilestoneResult, StateInfo, UseStateAgeResult } from "../type";

export default function useStateAge(stateId: number): UseStateAgeResult {
	const [loading, setLoading] = useState(true);

	const [state, setState] = useState<StateInfo | null>(null);

	const [upcoming, setUpcoming] = useState<MilestoneResult[]>([]);

	const [previous, setPrevious] = useState<MilestoneResult[]>([]);

	useEffect(() => {
		let mounted = true;

		async function load() {
			try {
				setLoading(true);

				const data = await getStateAgeData();

				const timestamp = data[String(stateId)];

				if (!timestamp) {
					if (!mounted) return;

					setState(null);
					setUpcoming([]);
					setPrevious([]);

					return;
				}

				const createdAt = new Date(timestamp * 1000);

				const ageInDays = calculateStateAge(createdAt);

				const milestones = getMilestones(stateId);

				const upcomingMilestones: MilestoneResult[] = milestones
					.filter((milestone) => ageInDays - milestone.days <= 7)
					.map((milestone) => ({
						...milestone,
						daysLeft:
							milestone.days > ageInDays ? milestone.days - ageInDays : 0,
						daysAgo:
							milestone.days <= ageInDays ? ageInDays - milestone.days : 0,
					}));

				const previousMilestones: MilestoneResult[] = milestones
					.filter((milestone) => ageInDays - milestone.days > 7)
					.map((milestone) => ({
						...milestone,
						daysLeft: 0,
						daysAgo: ageInDays - milestone.days,
					}))
					.reverse();

				if (!mounted) return;

				setState({
					id: stateId,
					createdAt,
					ageInDays,
				});

				setUpcoming(upcomingMilestones);

				setPrevious(previousMilestones);
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		}

		load();

		const interval = setInterval(load, 30000);

		return () => {
			mounted = false;
			clearInterval(interval);
		};
	}, [stateId]);

	return useMemo(
		() => ({
			loading,
			state,
			upcoming,
			previous,
		}),
		[loading, previous, state, upcoming],
	);
}
