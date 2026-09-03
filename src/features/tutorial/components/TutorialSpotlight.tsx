"use client";

import {
	useCallback,
	useEffect,
	useState,
} from "react";

interface TutorialSpotlightProps {
	target?: string;

	padding?: number;

	radius?: number;
}

interface SpotlightRect {
	top: number;
	left: number;
	width: number;
	height: number;
}

const DEFAULT_PADDING = 8;
const DEFAULT_RADIUS = 14;

export function TutorialSpotlight({
	target,
	padding = DEFAULT_PADDING,
	radius = DEFAULT_RADIUS,
}: TutorialSpotlightProps) {
	const [rect, setRect] =
		useState<SpotlightRect | null>(null);

	const updatePosition = useCallback(() => {
		if (!target) {
			setRect(null);
			return;
		}

		const element =
			document.querySelector(target);

		if (!element) {
			setRect(null);
			return;
		}

		const bounds =
			element.getBoundingClientRect();

		setRect({
			top: bounds.top - padding,
			left: bounds.left - padding,
			width: bounds.width + padding * 2,
			height: bounds.height + padding * 2,
		});
	}, [target, padding]);

	useEffect(() => {
		if (!target) {
			setRect(null);
			return;
		}

		let cancelled = false;
		let animationFrame = 0;

		const findTarget = () => {
			if (cancelled) return;

			const element =
				document.querySelector(target);

			if (element) {
				updatePosition();
				return;
			}

			animationFrame =
				requestAnimationFrame(findTarget);
		};

		findTarget();

		return () => {
			cancelled = true;

			if (animationFrame) {
				cancelAnimationFrame(
					animationFrame,
				);
			}
		};
	}, [target, updatePosition]);

	useEffect(() => {
		if (!target) return;

		const handleUpdate = () => {
			updatePosition();
		};

		window.addEventListener(
			"resize",
			handleUpdate,
		);

		window.addEventListener(
			"scroll",
			handleUpdate,
			true,
		);

		return () => {
			window.removeEventListener(
				"resize",
				handleUpdate,
			);

			window.removeEventListener(
				"scroll",
				handleUpdate,
				true,
			);
		};
	}, [target, updatePosition]);

	useEffect(() => {
		if (!target) return;

		const element =
			document.querySelector(target);

		if (!element) return;

		const resizeObserver =
			new ResizeObserver(() => {
				updatePosition();
			});

		resizeObserver.observe(element);

		return () => {
			resizeObserver.disconnect();
		};
	}, [target, updatePosition]);

	if (!rect) {
		return null;
	}

	return (
		<div
			aria-hidden="true"
			className="pointer-events-none fixed z-[9998]"
			style={{
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height,
				borderRadius: radius,
				boxShadow:
					"0 0 0 9999px rgba(0, 0, 0, 0.68)",
				border:
					"1px solid rgba(255, 255, 255, 0.18)",
				transition:
					"top 240ms ease, left 240ms ease, width 240ms ease, height 240ms ease",
			}}
		/>
	);
}