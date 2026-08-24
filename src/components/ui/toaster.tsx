"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
	return (
		<Toaster
			position="bottom-right"
			richColors
			closeButton
			expand={false}
			duration={3000}
			theme="dark"
		/>
	);
}
