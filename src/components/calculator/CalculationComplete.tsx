"use client";

import { useState } from "react";
import { toast } from "sonner";

import { RESOURCES } from "@/config/resources";
import { useInventoryStore } from "@/features/inventory/store/inventory.store";
import { parseShortNumber } from "@/lib/number";

import CalculationCompleteDialog from "./CalculationCompleteDialog";
import CalculationCompleteStatus from "./CalculationCompleteStatus";
import type {
	CalculationCompleteProps,
	CalculationResourceCheck,
} from "./calculation-complete.types";

function toNumber(value: unknown): number {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : 0;
	}

	if (typeof value === "string") {
		const parsed = parseShortNumber(value);

		return Number.isFinite(parsed) ? parsed : 0;
	}

	const parsed = Number(value ?? 0);

	return Number.isFinite(parsed) ? parsed : 0;
}

function getResourceConfig(resourceId: string) {
	return Object.values(RESOURCES).find(
		(resource) => resource.id === resourceId,
	);
}

export default function CalculationComplete({
	historyId,
	entryId,
	completed = false,
	resources,
	from,
	target,
	onCompleted,
}: CalculationCompleteProps) {
	const [open, setOpen] = useState(false);
	const [isCompleting, setIsCompleting] = useState(false);

	const inventoryResources = useInventoryStore(
		(state) => state.resources,
	);

	const consumeResources = useInventoryStore(
		(state) => state.consumeResources,
	);

	const resourceChecks: CalculationResourceCheck[] = resources
		.filter((resource) => toNumber(resource.amount) > 0)
		.map((resource) => {
			const config = getResourceConfig(resource.resourceId);
			const required = toNumber(resource.amount);
			const available = toNumber(
				inventoryResources[resource.resourceId],
			);

			return {
				resourceId: resource.resourceId,
				label: config?.label ?? resource.resourceId,
				icon: config?.icon ?? "",
				required,
				available,
				sufficient: available >= required,
				difference: available - required,
			};
		});

	const hasEnoughResources =
		resourceChecks.length === 0 ||
		resourceChecks.every((resource) => resource.sufficient);

	function handleOpen() {
		if (completed || isCompleting) {
			return;
		}

		if (!historyId || !entryId) {
			toast.error("Unable to complete calculation", {
				description:
					"This result is not connected to a History entry.",
			});

			return;
		}

		setOpen(true);
	}

	function handleClose() {
		if (isCompleting) {
			return;
		}

		setOpen(false);
	}

	function handleConfirm() {
		if (
			completed ||
			isCompleting ||
			!historyId ||
			!entryId
		) {
			return;
		}

		if (!hasEnoughResources) {
			toast.error("Not enough resources", {
				description:
					"Your inventory does not contain enough resources to complete this calculation.",
			});

			return;
		}

		setIsCompleting(true);

		try {
			const requiredResources: Record<string, number> = {};

			for (const resource of resourceChecks) {
				requiredResources[resource.resourceId] =
					resource.required;
			}

			const consumed =
				consumeResources(requiredResources);

			if (!consumed) {
				toast.error("Not enough resources", {
					description:
						"Your inventory changed and no longer contains enough resources.",
				});

				return;
			}

			onCompleted?.();

			setOpen(false);

			toast.success("Calculation completed", {
				description:
					"Required resources have been deducted from your inventory.",
			});
		} catch {
			toast.error("Failed to complete calculation", {
				description:
					"Something went wrong while updating your inventory.",
			});
		} finally {
			setIsCompleting(false);
		}
	}

	return (
		<>
			<CalculationCompleteStatus
				completed={completed}
				onClick={handleOpen}
				disabled={isCompleting}
			/>

			<CalculationCompleteDialog
				open={open}
				title="Complete Upgrade?"
				subtitle="The required resources will be deducted from your inventory."
				from={from}
				target={target}
				resources={resourceChecks}
				isCompleting={isCompleting}
				hasEnoughResources={hasEnoughResources}
				onCancel={handleClose}
				onConfirm={handleConfirm}
			/>
		</>
	);
}