"use client";

import StateCard from "./StateCard";

type StateItem = {
	id: number;
	age: number;
	next?: string;
};

type Props = {
	states: StateItem[];
};

export default function StateGrid({ states }: Props) {
	if (!states.length) {
		return null;
	}

	return (
		<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{states.map((state) => (
				<StateCard
					key={state.id}
					stateId={state.id}
					ageInDays={state.age}
					nextMilestone={state.next}
				/>
			))}
		</div>
	);
}
