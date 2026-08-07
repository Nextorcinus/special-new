"use client";

import type { ReactNode } from "react";

import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

type Props = {
	title: string;
	children: ReactNode;
};

export default function StateContainer({ title, children }: Props) {
	return (
		<MobileContainer>
			<HeaderOther title={title} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] p-4">
			{children}</div>
				
		</MobileContainer>
	);
}
