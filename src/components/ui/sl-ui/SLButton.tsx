import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SLButtonProps = React.ComponentProps<typeof Button> & {
	variantType?: "primary" | "secondary";
};

export default function SLButton({
	className,
	variantType = "primary",
	...props
}: SLButtonProps) {
	return (
		<Button
			className={cn(
				"h-10 rounded-full text-xs font-bold",
				variantType === "primary" &&
					"bg-[#f7b72c] text-black hover:bg-[#ffc94a]",
				variantType === "secondary" &&
					"bg-[#777] text-white hover:bg-[#888]",
				className,
			)}
			{...props}
		/>
	);
}