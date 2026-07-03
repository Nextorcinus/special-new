"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

type HeaderOtherProps = {
	title: string;
	showBack?: boolean;
	rightSlot?: React.ReactNode;
};

export default function HeaderOther({
	title,
	showBack = true,
	rightSlot,
}: HeaderOtherProps) {
	const router = useRouter();

	return (
		<header className="relative flex h-10 items-center justify-center">
			{showBack && (
				<button
					type="button"
					onClick={() => router.back()}
					className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--card)] transition hover:opacity-80"
				>
					<ChevronLeft size={18} />
				</button>
			)}

			<h1 className="text-sm font-semibold text-[var(--foreground)]">
				{title}
			</h1>

			{rightSlot && <div className="absolute right-0">{rightSlot}</div>}
		</header>
	);
}
