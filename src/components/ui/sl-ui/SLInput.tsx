import type { InputHTMLAttributes } from "react";

type SLInputProps = InputHTMLAttributes<HTMLInputElement>;

export default function SLInput({ className = "", ...props }: SLInputProps) {
	return (
		<input
			{...props}
			className={`h-10 w-full rounded-lg border-0 px-4 text-xs outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
		/>
	);
}