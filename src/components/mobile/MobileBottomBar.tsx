"use client";

import {
	Backpack,
	Grid3X3,
	History,
	Home,
	Menu,
} from "lucide-react";
import {
	usePathname,
	useRouter,
} from "next/navigation";
import {
	useRef,
	useState,
} from "react";

import MobileMenuDrawer from "@/components/mobile/MobileMenuDrawer";
import ResourceBagDrawer from "@/features/inventory/components/ResourceBagDrawer";
import { useTutorial } from "@/features/tutorial";

export default function MobileBottomBar() {
	const router = useRouter();
	const pathname = usePathname();

	const tutorial = useTutorial();

	const [bagOpen, setBagOpen] =
		useState(false);

	const [menuOpen, setMenuOpen] =
		useState(false);

	/*
	 * ============================================================
	 * TUTORIAL BAG STATE
	 * ============================================================
	 *
	 * Save & Close terdiri dari dua event:
	 *
	 * 1. ResourceBagContent menyimpan resource
	 * 2. Drawer ditutup
	 *
	 * Kita tidak langsung memindahkan tutorial
	 * ketika Save ditekan.
	 *
	 * Kita menunggu drawer benar-benar tertutup.
	 */

	const tutorialSavePendingRef =
		useRef(false);

	const isHome =
		pathname === "/";

	const isCategory =
		pathname.startsWith(
			"/categories",
		);

	const isHistory =
		pathname.startsWith(
			"/history",
		);

	function activeClass(active: boolean) {
		return active
			? "w-[124px] bg-[var(--sl-primary)] text-[var(--sl-primary-foreground)]"
			: "w-14 bg-[#2a2a2a] text-white";
	}

	function handleNavigate(path: string) {
		setMenuOpen(false);

		router.push(path);
	}

	/*
	 * ============================================================
	 * OPEN BAG
	 * ============================================================
	 */

	function handleOpenBag() {
		setBagOpen(true);

		/*
		 * Tutorial:
		 *
		 * Step:
		 * bag-resources
		 *
		 * User melakukan action membuka Bag.
		 *
		 * Setelah drawer terbuka:
		 *
		 * bag-chief-gear
		 */

		if (
			tutorial.active &&
			tutorial.step ===
				"bag-resources"
		) {
			tutorial.goTo(
				"bag-chief-gear",
			);
		}
	}

	/*
	 * ============================================================
	 * SAVE BAG
	 * ============================================================
	 *
	 * Dipanggil oleh ResourceBagContent ketika
	 * user menekan Save & Close.
	 */

	function handleBagSave() {
		if (
			!tutorial.active ||
			tutorial.step !==
				"bag-chief-gear"
		) {
			return;
		}

		/*
		 * Tandai bahwa drawer harus melanjutkan
		 * ke comparison setelah ditutup.
		 */

		tutorialSavePendingRef.current =
			true;
	}

	/*
	 * ============================================================
	 * BAG OPEN CHANGE
	 * ============================================================
	 */

	function handleBagOpenChange(
		open: boolean,
	) {
		/*
		 * Update state drawer terlebih dahulu.
		 */

		setBagOpen(open);

		/*
		 * Drawer sedang dibuka.
		 */

		if (open) {
			return;
		}

		/*
		 * ========================================================
		 * DRAWER CLOSED
		 * ========================================================
		 *
		 * Sekarang kita cek apakah penutupan drawer
		 * berasal dari Save & Close selama tutorial.
		 */

		if (
			!tutorialSavePendingRef.current
		) {
			return;
		}

		/*
		 * Consume pending state terlebih dahulu
		 * agar tidak dapat diproses dua kali.
		 */

		tutorialSavePendingRef.current =
			false;

		/*
		 * Pastikan tutorial masih berada
		 * di step yang benar.
		 */

		if (
			!tutorial.active ||
			tutorial.step !==
				"bag-chief-gear"
		) {
			return;
		}

		/*
		 * ========================================================
		 * MOVE TO COMPARISON
		 * ========================================================
		 *
		 * Drawer sudah tertutup.
		 *
		 * Sekarang tutorial boleh pindah
		 * ke comparison result.
		 */

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (
					tutorial.active &&
					tutorial.step ===
						"bag-chief-gear"
				) {
					tutorial.goTo(
						"bag-compare",
					);
				}
			});
		});
	}

	return (
		<>
			<nav className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-[390px] -translate-x-1/2">
				<div className="flex items-center justify-between rounded-full bg-[#181818] p-2 shadow-2xl">
					{/* ==================================================
					 * HOME
					 * ================================================== */}

					<button
						type="button"
						onClick={() =>
							handleNavigate("/")
						}
						className={`flex h-14 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeClass(
							isHome,
						)}`}
					>
						<Home size={21} />

						{isHome && (
							<span>
								Home
							</span>
						)}
					</button>

					{/* ==================================================
					 * BAG
					 * ================================================== */}

					<button
						type="button"
						onClick={
							handleOpenBag
						}
						data-tutorial="bag-resources"
						className={`flex h-14 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeClass(
							bagOpen,
						)}`}
					>
						<Backpack size={22} />

						{bagOpen && (
							<span>
								Bag
							</span>
						)}
					</button>

					{/* ==================================================
					 * CALCULATOR
					 * ================================================== */}

					<button
						type="button"
						onClick={() =>
							handleNavigate(
								"/categories",
							)
						}
						className={`flex h-14 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeClass(
							isCategory,
						)}`}
					>
						<Grid3X3 size={23} />

						{isCategory && (
							<span>
								Calc
							</span>
						)}
					</button>

					{/* ==================================================
					 * HISTORY
					 * ================================================== */}

					<button
						type="button"
						onClick={() =>
							handleNavigate(
								"/history",
							)
						}
						className={`flex h-14 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${activeClass(
							isHistory,
						)}`}
					>
						<History size={22} />

						{isHistory && (
							<span>
								History
							</span>
						)}
					</button>

					{/* ==================================================
					 * MENU
					 * ================================================== */}

					<button
						type="button"
						onClick={() =>
							setMenuOpen(true)
						}
						aria-label="Open menu"
						aria-expanded={
							menuOpen
						}
						className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2a2a2a] text-white transition-all duration-200 active:scale-95"
					>
						<Menu size={23} />
					</button>
				</div>
			</nav>

			{/* ======================================================
			 * RESOURCE BAG
			 * ====================================================== */}

			<ResourceBagDrawer
				open={bagOpen}
				onOpenChange={
					handleBagOpenChange
				}
				onTutorialSave={
					handleBagSave
				}
			/>

			{/* ======================================================
			 * MOBILE MENU
			 * ====================================================== */}

			<MobileMenuDrawer
				open={menuOpen}
				onOpenChange={
					setMenuOpen
				}
			/>
		</>
	);
}