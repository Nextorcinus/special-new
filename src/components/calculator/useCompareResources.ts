import { useMemo } from "react";

import { RESOURCES, type ResourceKey } from "@/config/resources";
import { useInventoryStore } from "@/features/inventory/store/inventory.store";
import { formatCompactNumber, parseShortNumber } from "@/lib/number";

import type { CalculatorCompareType } from "./types";

type ResultResources = Partial<Record<ResourceKey, number>>;

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

export function formatNumber(value: unknown) {
	if (value === undefined || value === null) {
		return "-";
	}

	const num = Number(value);

	if (!Number.isFinite(num)) {
		return String(value);
	}

	return formatCompactNumber(num, 2);
}

function formatDiff(value: number) {
	if (value > 0) {
		return `+${formatNumber(value)}`;
	}

	if (value < 0) {
		return `-${formatNumber(Math.abs(value))}`;
	}

	return "0";
}

function getCompareType(
	diff?: number,
): CalculatorCompareType | undefined {
	if (diff === undefined) {
		return undefined;
	}

	if (diff > 0) {
		return "plus";
	}

	if (diff < 0) {
		return "minus";
	}

	return "muted";
}

export function useCompareResources(
	resources: ResultResources,
) {
	const inventory = useInventoryStore(
		(state) => state.resources,
	);

	return useMemo(() => {
		return {
			createResourceItem(key: ResourceKey) {
				const resource = RESOURCES[key];
				const required = toNumber(resources[key]);
				const owned = toNumber(
					inventory[resource.id],
				);
				const diff = owned - required;

				return {
					id: resource.id,
					label: resource.label,
					icon: resource.icon,
					value: formatNumber(required),
					hidden: required <= 0,
					compareValue:
						required > 0
							? formatDiff(diff)
							: undefined,
					compareType:
						required > 0
							? getCompareType(diff)
							: undefined,
				};
			},
		};
	}, [resources, inventory]);
}