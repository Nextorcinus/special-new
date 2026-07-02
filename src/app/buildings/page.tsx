import Link from "next/link";

export default function Page() {
	return (
		<main className="min-h-screen bg-[#dcebf0]">
			<div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#202020] px-4 py-6 text-white">
				<h1 className="mb-8 text-center text-sm font-semibold">Category</h1>

				<div className="grid grid-cols-2 gap-5">
					<Link href="/buildings/regular" className="space-y-4">
						<div className="flex h-[180px] items-center justify-center rounded-[24px] bg-[#303030] text-center">
							Regular<br />Buildings
						</div>

						<p className="text-center text-sm">Regular Buildings</p>
					</Link>

					<Link href="/buildings/fc" className="space-y-4">
						<div className="flex h-[180px] items-center justify-center rounded-[24px] bg-[#303030] text-center">
							FC Buildings
						</div>

						<p className="text-center text-sm">FC Buildings</p>
					</Link>
				</div>
			</div>
		</main>
	);
}