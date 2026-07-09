"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { NAVIGATION } from "@/config/navigation";

type MobileMenuDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function MobileMenuDrawer({
	open,
	onOpenChange,
}: MobileMenuDrawerProps) {
	const router = useRouter();

	function goTo(path: string) {
		router.push(path);
		onOpenChange(false);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="left"
				className="w-[300px] border-[var(--sl-border)] bg-[var(--sl-surface)] text-[var(--sl-text)]"
			>
				<SheetHeader>
					<SheetTitle className="text-[var(--sl-text)]">Menu</SheetTitle>
				</SheetHeader>

				<div className="mt-6 space-y-2">
					{NAVIGATION.map((item) => (
						<button
							key={item.id}
							type="button"
							onClick={() => goTo(item.href)}
							className="flex w-full items-center justify-between rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface-2)] px-4 py-3 text-left text-sm font-semibold text-[var(--sl-text)]"
						>
							<span>{item.label}</span>
							<ChevronRight size={18} />
						</button>
					))}
				</div>
			</SheetContent>
		</Sheet>
	);
}
