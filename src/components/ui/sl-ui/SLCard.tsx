import { cn } from "@/lib/utils";

type SLCardProps = React.HTMLAttributes<HTMLDivElement>;

export default function SLCard({ className, children, ...props }: SLCardProps) {
	return (
		<div
			className={cn(
				"rounded-[14px] bg-[#1f1f1f] p-4 text-white",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}