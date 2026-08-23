"use client";

import {
	Backpack,
	Grid3X3,
	History,
	Home,
	Menu,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import ResourceBagDrawer from "@/features/inventory/components/ResourceBagDrawer";
import MobileMenuDrawer from "@/components/mobile/MobileMenuDrawer";

export default function MobileBottomBar() {
	const router = useRouter();
	const pathname = usePathname();

	const [bagOpen, setBagOpen] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	const isHome = pathname === "/";
	const isCategory = pathname.startsWith("/categories");
	const isHistory = pathname.startsWith("/history");

	function activeClass(active: boolean) {
		return active
			? "w-[124px] bg-[var(--sl-primary)] text-[var(--sl-primary-foreground)]"
			: "w-14 bg-[#2a2a2a] text-white";
	}

	function handleNavigate(path: string) {
		setMenuOpen(false);
		router.push(path);
	}

	return (
		<>
			<nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[390px] -translate-x-1/2 lg:hidden">
				<div className="flex items-center justify-between rounded-full bg-[#181818] p-2 shadow-2xl">
					{/* Home */}
					<button
						type="button"
						onClick={() => handleNavigate("/")}
						className={`flex h-14 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeClass(
							isHome,
						)}`}
					>
						<Home size={21} />

						{isHome && <span>Home</span>}
					</button>

					{/* Bag */}
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

					{/* Calculator */}
					<button
						type="button"
						onClick={() =>
							handleNavigate("/categories")
						}
						className={`flex h-14 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeClass(
							isCategory,
						)}`}
					>
						<Grid3X3 size={23} />

						{isCategory && <span>Calc</span>}
					</button>

					{/* History */}
					<button
						type="button"
						onClick={() =>
							handleNavigate("/history")
						}
						className={`flex h-14 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeClass(
							isHistory,
						)}`}
					>
						<History size={22} />

						{isHistory && <span>History</span>}
					</button>

					{/* Menu */}
					<button
						type="button"
						onClick={() => setMenuOpen(true)}
						aria-label="Open menu"
						aria-expanded={menuOpen}
						className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a2a2a] text-white transition-all duration-200 active:scale-95"
					>
						<Menu size={23} />
					</button>
				</div>
			</nav>

			{/* Resource Bag */}
			<ResourceBagDrawer
				open={bagOpen}
				onOpenChange={setBagOpen}
			/>

			{/* Mobile Menu */}
			<MobileMenuDrawer
				open={menuOpen}
				onOpenChange={setMenuOpen}
			/>
		</>
	);
}