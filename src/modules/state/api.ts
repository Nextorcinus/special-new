import type { StateAgeResponse } from "@/modules/state/type";

export async function getStateAgeData(): Promise<StateAgeResponse> {
	const response = await fetch("/api/stateage", {
		cache: "no-store",
	});

	if (!response.ok) {
		throw new Error("Failed to fetch state age.");
	}

	return response.json();
}
