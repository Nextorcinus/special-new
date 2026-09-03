"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
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

	const selectingRef = useRef(false);

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

	const updatePosition = useCallback(() => {
		const trigger = triggerRef.current;

		if (!trigger) {
			return;
		}

		const rect = trigger.getBoundingClientRect();

		setPosition({
			top: rect.bottom + 8,
			left: rect.left,
			width: rect.width,
		});
	}, []);

	useEffect(() => {
		function closeOtherSelect(event: Event) {
			const customEvent = event as CustomEvent<string>;

			if (customEvent.detail !== id) {
				setOpen(false);
			}
		}

		function closeOnOutsideClick(event: MouseEvent) {
			const target = event.target as Node;

			if (triggerRef.current?.contains(target)) {
				return;
			}

			if (contentRef.current?.contains(target)) {
				return;
			}

			setOpen(false);
		}

		window.addEventListener("sl-select-open", closeOtherSelect);

		document.addEventListener("mousedown", closeOnOutsideClick, true);

		window.addEventListener("scroll", updatePosition, true);

		window.addEventListener("resize", updatePosition);

		return () => {
			window.removeEventListener("sl-select-open", closeOtherSelect);

			document.removeEventListener("mousedown", closeOnOutsideClick, true);

			window.removeEventListener("scroll", updatePosition, true);

			window.removeEventListener("resize", updatePosition);
		};
	}, [id, updatePosition]);

	useEffect(() => {
		if (!open) {
			return;
		}

		updatePosition();

		const frame = requestAnimationFrame(updatePosition);

		return () => {
			cancelAnimationFrame(frame);
		};
	}, [open, updatePosition]);

	function handleToggle() {
		if (disabled) {
			return;
		}

		if (open) {
			setOpen(false);
			return;
		}

		updatePosition();

		window.dispatchEvent(
			new CustomEvent("sl-select-open", {
				detail: id,
			}),
		);

		setOpen(true);
	}

	function handleSelect(nextValue: string) {
		if (selectingRef.current) {
			return;
		}

		selectingRef.current = true;

		onChange(nextValue);
		setOpen(false);

		window.setTimeout(() => {
			selectingRef.current = false;
		}, 0);
	}

	function handleOptionClick(nextValue: string) {
		handleSelect(nextValue);
	}

	return (
		<>
			<button
				ref={triggerRef}
				type="button"
				disabled={disabled}
				onClick={handleToggle}
				className={`flex h-11 min-h-11 w-full items-center justify-between rounded-sm border border-[var(--sl-border)] bg-[var(--sl-input)] px-4 text-sm text-[var(--secondary-foreground)] outline-none transition-colors hover:bg-[var(--sl-input-hover)] disabled:cursor-not-allowed disabled:opacity-50 md:h-10 md:min-h-10 md:text-xs ${className}`}
			>
				<span className="truncate">{selectedLabel}</span>

				<ChevronDown
					size={14}
					className={`shrink-0 text-[var(--sl-text-muted)] transition-transform ${
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
						className="sl-select-portal fixed max-h-64 overflow-y-auto rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-1 shadow-[var(--sl-shadow)]"
						style={{
							top: position.top,
							left: position.left,
							width: position.width,
							zIndex: 2147483647,
							pointerEvents: "auto",
							touchAction: "manipulation",
							isolation: "isolate",
						}}
					>
						{options.map((item) => {
							const isSelected = item.value === value;

							return (
								<button
									key={item.value}
									type="button"
									className={`block min-h-11 w-full cursor-pointer select-none rounded-lg px-4 py-3 text-left text-sm text-[var(--sl-text)] outline-none transition-colors hover:bg-[var(--sl-hover)] focus:bg-[var(--sl-hover)] active:bg-[var(--sl-active)] md:min-h-9 md:px-3 md:py-2 md:text-xs ${
										isSelected ? "bg-[var(--sl-active)]" : ""
									}`}
									onClick={() => handleOptionClick(item.value)}
								>
									{item.label}
								</button>
							);
						})}
					</div>,
					document.body,
				)}
		</>
	);
}
