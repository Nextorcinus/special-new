import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SLLabelProps = React.ComponentProps<typeof Label>;

export default function SLLabel({
	className,
	...props
}: SLLabelProps) {
	return (
		<Label
			className={cn(
				"text-xs font-medium text-muted-foreground",
				className
			)}
			{...props}
		/>
	);
}