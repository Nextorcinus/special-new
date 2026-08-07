"use client";

type StateHeaderProps = {
	stateId: number;
	createdAt: Date;
	ageInDays: number;
};

export default function StateHeader({
	stateId,
	createdAt,
	ageInDays,
}: StateHeaderProps) {
	return (
		<div className="rounded-xl border bg-card p-6 space-y-3">
			<h1 className="text-3xl font-bold">State {stateId}</h1>

			<div className="grid gap-4 md:grid-cols-2">
				<div>
					<p className="text-sm text-muted-foreground">Created At</p>

					<p>{createdAt.toUTCString()}</p>
				</div>

				<div>
					<p className="text-sm text-muted-foreground">Age</p>

					<p className="text-lg font-semibold text-green-500">
						{ageInDays} Days
					</p>
				</div>
			</div>
		</div>
	);
}
