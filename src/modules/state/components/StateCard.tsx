"use client";

type Props = {
	stateId: number;
	ageInDays: number;
	nextMilestone?: string;
};

export default function StateCard({
	stateId,
	ageInDays,
	nextMilestone,
}: Props) {
	return (
		<div className="rounded-xl border bg-card p-5">
			<h3 className="text-xl font-semibold">State {stateId}</h3>

			<p className="mt-2 text-muted-foreground">Age</p>

			<p className="text-lg font-medium">{ageInDays} Days</p>

			{nextMilestone && (
				<>
					<hr className="my-4" />

					<p className="text-muted-foreground">Next</p>

					<p className="font-medium">{nextMilestone}</p>
				</>
			)}
		</div>
	);
}
