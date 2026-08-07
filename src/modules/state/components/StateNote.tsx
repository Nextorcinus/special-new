"use client";

import { TriangleAlert } from "lucide-react";

export default function StateNote() {
	return (
		<div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
			<div className="flex items-start gap-3">
				<TriangleAlert size={20} className="text-orange-500 mt-0.5" />

				<p className="text-sm leading-6 text-muted-foreground">
					Release times may vary between servers depending on server activity
					and system conditions.
					<br />
					Estimated accuracy is approximately
					<strong> ±7 to 21 days</strong>.
				</p>
			</div>
		</div>
	);
}
