"use client";

import { Backpack, ChevronDown, History, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import ResourceBagDrawer from "@/features/inventory/components/ResourceBagDrawer";

type UserAccountProps = {
	user: {
		id: string;
		name?: string | null;
		image?: string | null;
	};
};

export default function UserAccount({ user }: UserAccountProps) {
	const [open, setOpen] = useState(false);
	const [bagOpen, setBagOpen] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	function handleOpenBag() {
		setOpen(false);
		setBagOpen(true);
	}

	return (
		<>
			<div ref={containerRef} className="relative">
				<button
					type="button"
					onClick={() => setOpen((value) => !value)}
					aria-expanded={open}
					aria-haspopup="menu"
					className={`group flex h-12 items-center gap-2 rounded-full border px-1.5 pr-2 transition-all duration-200 active:scale-[0.98] ${
						open
							? "border-white/20 bg-white/[0.10] shadow-[0_0_20px_rgba(255,255,255,0.05)]"
							: "border-transparent bg-[var(--button)] hover:border-white/10 hover:bg-[var(--sl-surface-hover)]"
					}`}
				>
					{user.image ? (
						<img
							src={user.image}
							alt={user.name ?? "Discord user"}
							width={40}
							height={40}
							className="size-10 rounded-full object-cover ring-1 ring-white/10"
						/>
					) : (
						<div className="flex size-10 items-center justify-center rounded-full bg-[var(--sl-surface-hover)]">
							<span className="text-sm font-semibold text-[var(--sl-text)]">
								{user.name?.charAt(0).toUpperCase() ?? "U"}
							</span>
						</div>
					)}

					<span className="hidden max-w-28 truncate text-sm font-semibold text-[var(--sl-text)] sm:block">
						{user.name ?? "Discord User"}
					</span>

					<ChevronDown
						className={`size-4 text-[var(--sl-text-muted)] transition-transform duration-200 ${
							open ? "rotate-180" : ""
						}`}
					/>
				</button>

				<div
					className={`absolute right-0 top-[calc(100%+10px)] z-50 w-64 origin-top-right transition-all duration-200 ${
						open
							? "pointer-events-auto translate-y-0 scale-100 opacity-100"
							: "pointer-events-none -translate-y-2 scale-95 opacity-0"
					}`}
				>
					<div className="overflow-hidden rounded-2xl border border-white/10 bg-[rgba(20,20,20,0.96)] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
						<div className="rounded-xl border border-white/[0.04] bg-white/[0.06] p-3">
							<div className="flex items-center gap-3">
								{user.image ? (
									<img
										src={user.image}
										alt={user.name ?? "Discord user"}
										width={48}
										height={48}
										className="size-12 rounded-full object-cover ring-1 ring-white/10"
									/>
								) : (
									<div className="flex size-12 items-center justify-center rounded-full bg-[var(--button)]">
										<span className="text-base font-semibold text-[var(--sl-text)]">
											{user.name?.charAt(0).toUpperCase() ?? "U"}
										</span>
									</div>
								)}

								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-[var(--sl-text)]">
										{user.name ?? "Discord User"}
									</p>

									<p className="mt-0.5 text-xs text-[var(--sl-text-muted)]">
										Discord Account
									</p>
								</div>
							</div>
						</div>

						<div className="my-2 h-px bg-white/[0.08]" />

						<div className="space-y-1">
							<Link
								href="/history"
								onClick={() => setOpen(false)}
								className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 hover:bg-white/[0.07]"
							>
								<span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.06] text-[var(--sl-text-muted)] transition-all duration-150 group-hover:bg-white/[0.10] group-hover:text-[var(--sl-text)]">
									<History className="size-4" />
								</span>

								<span className="text-sm font-medium text-[var(--sl-text)]">
									History
								</span>
							</Link>

							<button
								type="button"
								onClick={handleOpenBag}
								className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 hover:bg-white/[0.07]"
							>
								<span className="flex size-8 items-center justify-center rounded-lg bg-white/[0.06] text-[var(--sl-text-muted)] transition-all duration-150 group-hover:bg-white/[0.10] group-hover:text-[var(--sl-text)]">
									<Backpack className="size-4" />
								</span>

								<span className="text-sm font-medium text-[var(--sl-text)]">
									Inventory
								</span>
							</button>
						</div>

						<div className="my-2 h-px bg-white/[0.08]" />

						<button
							type="button"
							onClick={() => signOut()}
							className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 hover:bg-red-500/[0.08]"
						>
							<span className="flex size-8 items-center justify-center rounded-lg bg-red-500/[0.10] text-red-400 transition-all duration-150 group-hover:bg-red-500/[0.15]">
								<LogOut className="size-4" />
							</span>

							<span className="text-sm font-semibold text-red-400">Logout</span>
						</button>
					</div>
				</div>
			</div>

			<ResourceBagDrawer open={bagOpen} onOpenChange={setBagOpen} />
		</>
	);
}
