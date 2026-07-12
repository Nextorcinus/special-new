"use client";

import { Backpack, Grid3X3, History, Home, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import ResourceBagDrawer from "@/features/inventory/components/ResourceBagDrawer";

export default function MobileBottomBar() {
	const router = useRouter();
	const pathname = usePathname();

	const [bagOpen, setBagOpen] = useState(false);

	const isHome = pathname === "/";
	const isCategory = pathname.startsWith("/categories");
	const isHistory = pathname.startsWith("/history");

	function activeClass(active: boolean) {
		return active
			? "w-[124px] bg-[var(--sl-primary)] text-[var(--sl-primary-foreground)]"
			: "w-14 bg-[#2a2a2a] text-white";
	}

	return (
		<>
			<nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[390px] -translate-x-1/2 lg:hidden">
				<div className="flex items-center justify-between rounded-full bg-[#181818] p-2 shadow-2xl">
					<button
						type="button"
						onClick={() => router.push("/")}
						className={`flex h-14 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeClass(
							isHome,
						)}`}
					>
						<Home size={21} />
						{isHome && <span>Home</span>}
					</button>

					<button
						type="button"
						onClick={() => setBagOpen(true)}
						className={`flex h-14 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeClass(
							bagOpen,
						)}`}
					>
						<Backpack size={22} />
						{bagOpen && <span>Bag</span>}
					</button>

					<button
						type="button"
						onClick={() => router.push("/categories")}
						className={`flex h-14 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeClass(
							isCategory,
						)}`}
					>
						<Grid3X3 size={23} />
						{isCategory && <span>Calc</span>}
					</button>

					<button
						type="button"
						onClick={() => router.push("/history")}
						className={`flex h-14 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeClass(
							isHistory,
						)}`}
					>
						<History size={22} />
						{isHistory && <span>History</span>}
					</button>

					<button
						type="button"
						className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a2a2a] text-white transition active:scale-95"
					>
						<Menu size={23} />
					</button>
				</div>
			</nav>

			<ResourceBagDrawer open={bagOpen} onOpenChange={setBagOpen} />
		</>
	);
}
