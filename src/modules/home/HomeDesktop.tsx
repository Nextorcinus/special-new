import Header from "@/components/layout/Header";

export default function HomeDesktop() {
	return (
		<div className="flex min-h-screen">
			{/* Sidebar */}

			<aside className="w-72 border-r border-white/10">Sidebar</aside>

			{/* Content */}

			<main className="flex-1 px-10 py-8">
				<Header />

				<div className="mt-10">{/* Search */}</div>

				<div className="mt-10 grid grid-cols-2 gap-8">
					<div>{/* Quick Access */}</div>

					<div>{/* Recent History */}</div>
				</div>

				<div className="mt-10">{/* What's In Your Bag */}</div>
			</main>
		</div>
	);
}
