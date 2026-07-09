"use client";

import { useEffect } from "react";

import { Drawer, DrawerContent } from "@/components/ui/drawer";

import { useInventoryStore } from "../store/inventory.store";
import ResourceBagContent from "./ResourceBagContent";

type ResourceBagDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export default function ResourceBagDrawer({
	open,
	onOpenChange,
}: ResourceBagDrawerProps) {
	const loadResources = useInventoryStore((state) => state.loadResources);

	useEffect(() => {
		if (open) loadResources();
	}, [open, loadResources]);

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="max-h-[90vh] border-[var(--sl-border)] bg-[var(--sl-surface)] text-[var(--sl-text)]">
				<div className="overflow-y-auto px-5 pb-8 pt-4">
					<ResourceBagContent onClose={() => onOpenChange(false)} />
				</div>
			</DrawerContent>
		</Drawer>
	);
}
