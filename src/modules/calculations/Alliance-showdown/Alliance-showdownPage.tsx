import { AllianceShowdownCalculator } from "./";

export default function AllianceShowdownPage() {
	return (
		<main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
			<header className="space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">
					Alliance Showdown Calculator
				</h1>

				<p className="text-sm text-muted-foreground">
					Calculate your daily points and track milestone goals for every
					Alliance Showdown stage.
				</p>
			</header>

			<AllianceShowdownCalculator />
		</main>
	);
}
