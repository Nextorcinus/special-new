"use client";

import { Loader2 } from "lucide-react";

export default function StateLoading() {
	return (
		<div className="flex flex-col items-center justify-center py-16 gap-4">
			<Loader2 className="h-8 w-8 animate-spin text-primary" />

			<p className="text-sm text-muted-foreground">
				Loading state information...
			</p>
		</div>
	);
}
