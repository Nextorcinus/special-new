"use client";

import { Settings2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { NAVIGATION } from "@/config/navigation";
import { DEFAULT_QUICK_ACCESS } from "@/config/quick-access";
import { useQuickAccessStore } from "@/features/home/store/quick-access/quick-access.store";

import QuickAccessManageModal from "@/modules/home/components/QuickAccesManageModal";

const MAX_QUICK_ACCESS = 6;

export default function QuickAccessSection() {
	const [manageOpen, setManageOpen] = useState(false);

	const selectedIds = useQuickAccessStore(
		(state) => state.selectedIds,
	);

	const isInitialized = useQuickAccessStore(
		(state) => state.isInitialized,
	);

	const setSelectedIds = useQuickAccessStore(
		(state) => state.setSelectedIds,
	);

	/*
	 * Default Quick Access digunakan ketika user
	 * belum pernah melakukan konfigurasi.
	 *
	 * Setelah user melakukan Save, gunakan pilihan
	 * yang tersimpan di Quick Access Store.
	 */
	const quickAccessIds = (
		isInitialized
			? selectedIds
			: DEFAULT_QUICK_ACCESS
	).slice(0, MAX_QUICK_ACCESS);

	/*
	 * NAVIGATION menjadi source of truth.
	 * ID dari Quick Access dikonversi menjadi
	 * NavigationItem lengkap.
	 */
	const quickAccessItems = quickAccessIds
		.map((id) =>
			NAVIGATION.find((item) => item.id === id),
		)
		.filter(
			(item): item is (typeof NAVIGATION)[number] =>
				item !== undefined,
		);

	return (
		<>
			<section className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] px-4 py-3 text-left transition-colors">
				{/* Header */}
				<div className="mb-5 flex items-center justify-between">
					<h2 className="text-[14px] text-[var(--sl-primary)] sm:text-[1rem]">
						Quick access
					</h2>

					<button
						type="button"
						onClick={() => setManageOpen(true)}
						className="flex items-center gap-1.5 text-xs font-semibold text-[var(--sl-text-muted)] transition-colors hover:text-[var(--sl-primary-hover)]"
					>
						Manage
						<Settings2 size={14} />
					</button>
				</div>

				{/* Quick Access Items */}
				<div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{quickAccessItems.map((item) => (
						<Link
							key={item.id}
							href={item.href}
							className="w-[64px] shrink-0 text-center sm:w-[72px] md:w-[80px]"
						>
							<div className="flex h-14 w-16 items-center justify-center rounded-xl border border-solid border-[color:var(--sl-border)] bg-black/20 transition-colors hover:bg-black/10 sm:h-16 sm:w-[72px] sm:rounded-2xl md:h-[72px] md:w-20">
								<Image
									src={item.icon}
									alt={item.title}
									width={44}
									height={44}
									className="size-9 object-contain sm:size-11 md:size-12"
								/>
							</div>

							<span className="mt-2 block truncate text-[12px] leading-tight text-[var(--sl-text-secondary)] sm:mt-3 sm:text-xs md:text-[13px]">
								{item.title}
							</span>
						</Link>
					))}

					{/* Empty State */}
					{quickAccessItems.length === 0 && (
						<div className="flex min-h-[88px] w-full items-center justify-center text-center">
							<p className="text-xs text-[var(--sl-text-muted)]">
								No quick access items selected.
							</p>
						</div>
					)}
				</div>
			</section>

			{/* Manage Modal */}
			<QuickAccessManageModal
				open={manageOpen}
				selectedIds={quickAccessIds}
				onSave={setSelectedIds}
				onClose={() => setManageOpen(false)}
			/>
		</>
	);
}