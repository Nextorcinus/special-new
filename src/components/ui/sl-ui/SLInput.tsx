import type { InputHTMLAttributes } from "react";

type SLInputProps = InputHTMLAttributes<HTMLInputElement>;

export default function SLInput({ className = "", ...props }: SLInputProps) {
	return (
		<input
			{...props}
			className={`flex h-10 w-full items-center justify-between rounded-lg border border-[var(--sl-border)] bg-[var(--sl-input)] px-4 text-xs text-[var(--sl-text)] outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
		/>
	);
}
