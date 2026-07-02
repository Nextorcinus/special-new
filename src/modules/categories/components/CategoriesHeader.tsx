"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CategoriesHeader() {
	const router = useRouter();

	return (
		<header className="relative flex items-center justify-center">
			<button
				type="button"
				onClick={() => router.back()}
				className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card)]"
			>
				<ChevronLeft size={18} />
			</button>

			<h1 className="text-lg font-medium text-[var(--foreground)]">Category</h1>
		</header>
	);
}
