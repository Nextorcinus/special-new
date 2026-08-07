"use client";

import { useState } from "react";

export default function useStates() {
	const [search, setSearch] = useState("");

	const filteredStates: number[] = [];

	return {
		search,
		setSearch,
		filteredStates,
	};
}
