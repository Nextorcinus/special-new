"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Option = {
	value: string;
	label: string;
};

type SLSelectProps = {
	value: string;
	onChange: (value: string) => void;
	options: Option[];
	placeholder?: string;
	disabled?: boolean;
	className?: string;
};

export default function SLSelect({
	value,
	onChange,
	options,
	placeholder = "Select option",
	disabled = false,
	className = "",
}: SLSelectProps) {
	const id = useId();
	const triggerRef = useRef<HTMLButtonElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);

	const [open, setOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [position, setPosition] = useState({
		top: 0,
		left: 0,
		width: 0,
	});

	const selectedLabel =
		options.find((item) => item.value === value)?.label || placeholder;

	useEffect(() => {
		setMounted(true);
	}, []);

	function updatePosition() {
		const rect = triggerRef.current?.getBoundingClientRect();

		if (!rect) return;

		setPosition({
			top: rect.bottom + 8,
			left: rect.left,
			width: rect.width,
		});
	}

	useEffect(() => {
		function closeOtherSelect(event: Event) {
			const customEvent = event as CustomEvent<string>;

			if (customEvent.detail !== id) {
				setOpen(false);
			}
		}

		function closeOnOutsideClick(event: MouseEvent) {
			const target = event.target as Node;

			if (triggerRef.current?.contains(target)) return;
			if (contentRef.current?.contains(target)) return;

			setOpen(false);
		}

		window.addEventListener("sl-select-open", closeOtherSelect);
		document.addEventListener("mousedown", closeOnOutsideClick);
		window.addEventListener("scroll", updatePosition, true);
		window.addEventListener("resize", updatePosition);

		return () => {
			window.removeEventListener("sl-select-open", closeOtherSelect);
			document.removeEventListener("mousedown", closeOnOutsideClick);
			window.removeEventListener("scroll", updatePosition, true);
			window.removeEventListener("resize", updatePosition);
		};
	}, [id]);

	function handleToggle() {
		if (disabled) return;

		const nextOpen = !open;

		if (nextOpen) {
			updatePosition();
			window.dispatchEvent(new CustomEvent("sl-select-open", { detail: id }));
		}

		setOpen(nextOpen);
	}

	function handleSelect(nextValue: string) {
		onChange(nextValue);
		setOpen(false);
	}

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				disabled={disabled}
				onClick={handleToggle}
				className={`flex h-12 min-h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-[#292929] px-4 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:min-h-10 md:text-xs ${className}`}
			>
				<span className="truncate">{selectedLabel}</span>

				<ChevronDown
					size={14}
					className={`shrink-0 transition-transform ${
						open ? "rotate-180" : ""
					}`}
				/>
			</button>

			{mounted &&
				open &&
				!disabled &&
				createPortal(
					<div
						ref={contentRef}
						className="fixed z-[99999] max-h-64 overflow-y-auto rounded-xl border border-white/20 bg-[#1f1f1f] p-1 shadow-2xl"
						style={{
							top: position.top,
							left: position.left,
							width: position.width,
						}}
					>
						{options.map((item) => (
							<button
								key={item.value}
								type="button"
								onMouseDown={(event) => {
									event.preventDefault();
									handleSelect(item.value);
								}}
								className={`block min-h-11 w-full rounded-lg px-4 py-3 text-left text-sm text-white hover:bg-white/10 md:min-h-9 md:px-3 md:py-2 md:text-xs ${
									item.value === value ? "bg-white/10" : ""
								}`}
							>
								{item.label}
							</button>
						))}
					</div>,
					document.body,
				)}
		</>
	);
}
