"use client";

import * as React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type SLAccordionProps = {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
	className?: string;
};

export default function SLAccordion({
	title,
	children,
	defaultOpen = false,
	className,
}: SLAccordionProps) {
	const [value, setValue] = React.useState(defaultOpen ? "item-1" : "");

	const isOpen = value === "item-1";

	return (
		<Accordion
			type="single"
			collapsible
			value={value}
			onValueChange={setValue}
			className={cn(
				"rounded-[14px] p-3 transition-colors duration-200",
				isOpen ? "bg-[var(--sl-active)]" : "bg-white/0",
				className,
			)}
		>
			<AccordionItem value="item-1" className="border-0">
				<AccordionTrigger className="py-0 text-xs font-bold text-[var(--secondary-foreground)] hover:no-underline">
					{title}
				</AccordionTrigger>

				<AccordionContent className="mt-4 space-y-3 pb-0">
					{children}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
