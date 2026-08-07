"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLCard from "@/components/ui/sl-ui/SLCard";
import SLInput from "@/components/ui/sl-ui/SLInput";

export default function StateSearch() {
	const router = useRouter();

	const [value, setValue] = useState("");

	function handleSearch() {
		const id = Number(value);

		if (!Number.isInteger(id)) return;

		if (id < 500 || id > 9999) return;

		router.push(`/state/${id}`);
	}

	return (
		<SLCard className="space-y-4 p-6">
			<h2 className="text-xl font-bold">State Age Calculator</h2>

			<p className="text-sm text-muted-foreground">
				Enter your Whiteout Survival State ID.
			</p>

			<div className="flex gap-3">
				<SLInput
					type="number"
					placeholder="State ID"
					value={value}
					onChange={(e) => setValue(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleSearch();
						}
					}}
				/>

				<SLButton onClick={handleSearch}>
					<Search className="mr-2 h-4 w-4" />
					Search
				</SLButton>
			</div>
		</SLCard>
	);
}
