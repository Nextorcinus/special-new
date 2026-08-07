"use client";

import useStateAge from "../hooks/useStateAge";

import StateHeader from "./StateHeader";
import StateLoading from "./StateLoading";
import StateMilestoneList from "./StateMilestoneList";
import StateNote from "./StateNote";

type StateDetailProps = {
	stateId: number;
};

export default function StateDetail({ stateId }: StateDetailProps) {
	const { loading, state, upcoming, previous } = useStateAge(stateId);

	if (loading || !state) {
		return <StateLoading />;
	}

	return (
		<div className="space-y-6">
			<StateHeader
				stateId={state.id}
				createdAt={state.createdAt}
				ageInDays={state.ageInDays}
			/>

			<StateNote />

			<StateMilestoneList
				title="Upcoming Updates"
				milestones={upcoming}
				upcoming
			/>

			<StateMilestoneList title="Previous Updates" milestones={previous} />
		</div>
	);
}
