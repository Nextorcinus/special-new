import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

type SLAccordionProps = {
	title: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
};

export default function SLAccordion({
	title,
	children,
	defaultOpen = false,
}: SLAccordionProps) {
	return (
		<Accordion
			type="single"
			collapsible
			defaultValue={defaultOpen ? "item-1" : undefined}
			className="rounded-[14px] bg-[#353535] p-3"
		>
			<AccordionItem value="item-1" className="border-0">
				<AccordionTrigger className="py-0 text-xs font-bold text-white hover:no-underline">
					{title}
				</AccordionTrigger>

				<AccordionContent className="mt-4 space-y-3 pb-0">
					{children}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}