import type { InputHTMLAttributes } from "react";

type SLInputProps = InputHTMLAttributes<HTMLInputElement>;

export default function SLInput({ className = "", ...props }: SLInputProps) {
	return (
		<input
			{...props}
			className={`flex h-10 w-full items-center justify-between rounded-lg border border-white/10 bg-[#292929] px-4 text-xs text-white outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
		/>
	);
}