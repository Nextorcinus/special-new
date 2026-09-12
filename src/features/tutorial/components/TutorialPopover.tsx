
"use client";

import { type Driver, driver } from "driver.js";
import "driver.js/dist/driver.css";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";

import type { TutorialStepConfig } from "../types";

type TutorialPopoverProps = {
	step: TutorialStepConfig;
	current: number;
	total: number;
	onNext: () => void;
	onPrevious: () => void;
	onSkip: () => void;
	onComplete: () => void;
};

type Rect = {
	top: number;
	left: number;
	width: number;
	height: number;
};

type PopoverPosition = {
	top: number;
	left: number;
	above: boolean;
};

const INTERACTIVE_STEPS = new Set([
	"chief-gear-type",
	"chief-gear-from",
	"chief-gear-target",
	"bag-chief-gear",
]);

function clamp(
	value: number,
	min: number,
	max: number,
) {
	return Math.min(
		Math.max(value, min),
		max,
	);
}

function getDriverSide(
	step: TutorialStepConfig,
): "top" | "right" | "bottom" | "left" {
	if (step.id === "result") {
		return "bottom";
	}

	if (step.placement === "center") {
		return "bottom";
	}

	return step.placement ?? "bottom";
}

function getElementRect(
	element: HTMLElement,
): Rect {
	const rect =
		element.getBoundingClientRect();

	return {
		top: rect.top,
		left: rect.left,
		width: rect.width,
		height: rect.height,
	};
}

function mergeRects(rects: Rect[]): Rect | null {
	if (rects.length === 0) {
		return null;
	}

	const top = Math.min(
		...rects.map((item) => item.top),
	);

	const left = Math.min(
		...rects.map((item) => item.left),
	);

	const right = Math.max(
		...rects.map(
			(item) =>
				item.left + item.width,
		),
	);

	const bottom = Math.max(
		...rects.map(
			(item) =>
				item.top + item.height,
		),
	);

	return {
		top,
		left,
		width: right - left,
		height: bottom - top,
	};
}

function getInteractiveElements(
	step: TutorialStepConfig,
) {
	if (typeof document === "undefined") {
		return [];
	}

	const elements: HTMLElement[] = [];

	if (step.target) {
		const target =
			document.querySelector(step.target);

		if (target instanceof HTMLElement) {
			if (
				step.id === "chief-gear-type" ||
				step.id === "chief-gear-from" ||
				step.id === "chief-gear-target"
			) {
				const button =
					target.querySelector("button");

				if (
					button instanceof HTMLElement
				) {
					elements.push(button);
				}
			} else {
				elements.push(target);
			}
		}
	}

	if (step.id === "bag-chief-gear") {
		const saveButton =
			document.querySelector(
				'[data-tutorial="bag-chief-gear-save"]',
			);

		if (
			saveButton instanceof HTMLElement
		) {
			elements.push(saveButton);
		}
	}

	return elements;
}

function getPrimaryElement(
	step: TutorialStepConfig,
) {
	if (typeof document === "undefined") {
		return null;
	}

	if (!step.target) {
		return null;
	}

	const target =
		document.querySelector(step.target);

	if (!(target instanceof HTMLElement)) {
		return null;
	}

	if (
		step.id === "chief-gear-type" ||
		step.id === "chief-gear-from" ||
		step.id === "chief-gear-target"
	) {
		const button =
			target.querySelector("button");

		if (button instanceof HTMLElement) {
			return button;
		}
	}

	return target;
}

export function TutorialPopover({
	step,
	current,
	total,
	onNext,
	onPrevious,
	onSkip,
	onComplete,
}: TutorialPopoverProps) {
	const driverRef =
		useRef<Driver | null>(null);

	const [mounted, setMounted] =
		useState(false);

	const [highlightRect, setHighlightRect] =
		useState<Rect | null>(null);

	const [popoverRect, setPopoverRect] =
		useState<Rect | null>(null);

	const [popoverPosition, setPopoverPosition] =
		useState<PopoverPosition | null>(
			null,
		);

	const isInteractive =
		INTERACTIVE_STEPS.has(step.id);

	const showPrevious =
		current > 1 && !isInteractive;

	const showNext =
		step.allowNext === true &&
		!isInteractive;

	const destroyDriver = useCallback(() => {
		if (driverRef.current) {
			driverRef.current.destroy();
			driverRef.current = null;
		}
	}, []);

	const handleNext = useCallback(() => {
		destroyDriver();

		if (step.id === "bag-compare") {
			onComplete();
			return;
		}

		onNext();
	}, [
		destroyDriver,
		onComplete,
		onNext,
		step.id,
	]);

	const handlePrevious = useCallback(() => {
		destroyDriver();
		onPrevious();
	}, [
		destroyDriver,
		onPrevious,
	]);

	const handleSkip = useCallback(() => {
		destroyDriver();
		onSkip();
	}, [
		destroyDriver,
		onSkip,
	]);

	useEffect(() => {
		setMounted(true);

		return () => {
			setMounted(false);
		};
	}, []);

	useEffect(() => {
		if (isInteractive) {
			return;
		}

		if (typeof document === "undefined") {
			return;
		}

		const target = step.target
			? document.querySelector(step.target)
			: null;

		const instance = driver({
			animate: true,
			duration: 280,
			overlayColor: "#000000",
			overlayOpacity: 0.68,
			smoothScroll: true,
			allowClose: false,
			allowScroll: true,
			allowKeyboardControl: false,
			disableActiveInteraction: false,
			advanceOnClick: false,
			nextBtnText:
				step.nextLabel ?? "Next",
			doneBtnText:
				step.nextLabel ?? "Next",
			stagePadding: 8,
			stageRadius: 16,
			popoverOffset: 12,
			popoverClass:
				"special-lazyness-driver",
			showProgress: false,
			steps: [
				{
					element:
						target ?? undefined,
					popover: {
						title: step.title,
						description:
							step.description,
						side: getDriverSide(step),
						align: "center",
						showButtons: [
							...(showPrevious
								? [
										"previous" as const,
									]
								: []),
							...(showNext
								? ["next" as const]
								: []),
						],
					},
					disableActiveInteraction:
						false,
					advanceOnClick: false,
				},
			],
			onNextClick: handleNext,
			onDoneClick: handleNext,
			onPrevClick: handlePrevious,
			onCloseClick: handleSkip,
			onPopoverRender: (popover) => {
				const footer = popover.footer;

				if (
					footer &&
					step.showSkip
				) {
					const skip =
						document.createElement(
							"button",
						);

					skip.type = "button";
					skip.className =
						"special-lazyness-driver-skip";
					skip.textContent = "Skip";

					skip.addEventListener(
						"click",
						handleSkip,
					);

					footer.insertBefore(
						skip,
						footer.firstChild,
					);
				}
			},
			onDestroyStarted: () => {
				if (
					driverRef.current === instance
				) {
					driverRef.current = null;
				}
			},
		});

		driverRef.current = instance;

		instance.drive();

		return () => {
			if (
				driverRef.current === instance
			) {
				driverRef.current = null;
			}

			instance.destroy();
		};
	}, [
		handleNext,
		handlePrevious,
		handleSkip,
		isInteractive,
		showNext,
		showPrevious,
		step,
	]);

	useLayoutEffect(() => {
		if (!isInteractive) {
			setHighlightRect(null);
			setPopoverRect(null);
			setPopoverPosition(null);
			return;
		}

		let frame = 0;

		const update = () => {
			cancelAnimationFrame(frame);

			frame = requestAnimationFrame(() => {
				const elements =
					getInteractiveElements(step);

				const primary =
					getPrimaryElement(step);

				if (
					elements.length === 0 ||
					!primary
				) {
					setHighlightRect(null);
					setPopoverRect(null);
					setPopoverPosition(null);
					return;
				}

				const rects =
					elements.map(getElementRect);

				const merged =
					mergeRects(rects);

				const primaryRect =
					getElementRect(primary);

				if (!merged) {
					return;
				}

				setHighlightRect(merged);
				setPopoverRect(primaryRect);

				const viewportWidth =
					window.innerWidth;

				const viewportHeight =
					window.innerHeight;

				const popoverWidth =
					Math.min(
						360,
						viewportWidth - 24,
					);

				const popoverHeight =
					step.id === "bag-chief-gear"
						? 145
						: 150;

				const gap = 14;

				const left = clamp(
					primaryRect.left +
						primaryRect.width / 2 -
						popoverWidth / 2,
					12,
					viewportWidth -
						popoverWidth -
						12,
				);

				const spaceAbove =
					primaryRect.top;

				const spaceBelow =
					viewportHeight -
					primaryRect.top -
					primaryRect.height;

				const above =
					spaceAbove >=
					popoverHeight + gap;

				const top = above
					? primaryRect.top - gap
					: primaryRect.top +
						primaryRect.height +
						gap;

				setPopoverPosition({
					top,
					left,
					above,
				});
			});
		};

		update();

		const timeout =
			window.setTimeout(update, 60);

		window.addEventListener(
			"resize",
			update,
			{ passive: true },
		);

		window.addEventListener(
			"scroll",
			update,
			true,
		);

		const observer =
			new MutationObserver(update);

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
		});

		return () => {
			cancelAnimationFrame(frame);
			window.clearTimeout(timeout);

			window.removeEventListener(
				"resize",
				update,
			);

			window.removeEventListener(
				"scroll",
				update,
				true,
			);

			observer.disconnect();
		};
	}, [
		isInteractive,
		step,
	]);

	if (!mounted) {
		return null;
	}

	return createPortal(
		<>
			<style>
				{`
					.driver-overlay {
						pointer-events:none !important;
					}

					.driver-stage {
						pointer-events:none !important;
					}

					.driver-active-element {
						pointer-events:auto !important;
					}

					.special-lazyness-driver{
						width:min(360px,calc(100vw - 24px)) !important;
						max-width:360px !important;
						margin:0 !important;
						padding:18px !important;
						border:1px solid rgba(255,255,255,.10) !important;
						border-radius:16px !important;
						background:rgb(24,24,28) !important;
						color:#fff !important;
						box-shadow:0 20px 50px rgba(0,0,0,.45),0 8px 24px rgba(0,0,0,.28),0 0 0 1px rgba(255,255,255,.025) !important;
						backdrop-filter:blur(18px);
						pointer-events:none !important;
					}

					.special-lazyness-driver .driver-popover-title{
						color:#fff !important;
						font-size:15px !important;
						font-weight:700 !important;
					}

					.special-lazyness-driver .driver-popover-description{
						color:rgba(255,255,255,.68) !important;
						font-size:12px !important;
						line-height:1.55 !important;
					}

					.special-lazyness-driver .driver-popover-footer{
						margin-top:15px !important;
					}

					.special-lazyness-driver .driver-popover-footer button{
						pointer-events:auto !important;
						border-radius:9px !important;
						font-size:11px !important;
						font-weight:700 !important;
					}

					.special-lazyness-driver .driver-popover-prev-btn{
						background:rgba(255,255,255,.08) !important;
						color:rgba(255,255,255,.78) !important;
					}

					.special-lazyness-driver .driver-popover-next-btn{
						background:#3089c0 !important;
						color:#fff !important;
					}

					.special-lazyness-driver-skip{
						margin-right:auto !important;
						border:0 !important;
						background:transparent !important;
						color:rgba(255,255,255,.42) !important;
					}

					.special-lazyness-tutorial-highlight{
						position:fixed;
						z-index:2147483640;
						box-sizing:border-box;
						border:3px solid #3089c0;
						border-radius:16px;
						background:transparent;
						box-shadow:0 0 0 4px rgba(48,137,192,.22),0 0 24px rgba(48,137,192,.30),0 0 0 9999px rgba(0,0,0,.68);
						pointer-events:none;
						transition:top .18s ease,left .18s ease,width .18s ease,height .18s ease;
					}

					.special-lazyness-tutorial-highlight::after{
						content:"";
						position:absolute;
						inset:-6px;
						border:1px solid rgba(48,137,192,.28);
						border-radius:20px;
					}

					.special-lazyness-tutorial-popover{
						position:fixed;
						z-index:2147483647;
						width:min(360px,calc(100vw - 24px));
						padding:18px;
						border:1px solid rgba(255,255,255,.10);
						border-radius:16px;
						background:rgb(24,24,28);
						color:#fff;
						box-shadow:0 20px 50px rgba(0,0,0,.45),0 8px 24px rgba(0,0,0,.28);
						backdrop-filter:blur(18px);
						pointer-events:none;
					}

					.special-lazyness-tutorial-popover.above{
						transform:translateY(-100%);
					}

					.special-lazyness-tutorial-title{
						margin:0;
						font-size:15px;
						font-weight:700;
						line-height:1.35;
					}

					.special-lazyness-tutorial-description{
						margin-top:7px;
						font-size:12px;
						line-height:1.55;
						color:rgba(255,255,255,.68);
					}

					.special-lazyness-tutorial-footer{
						display:flex;
						align-items:center;
						justify-content:space-between;
						margin-top:15px;
					}

					.special-lazyness-tutorial-progress{
						font-size:10px;
						font-weight:700;
						color:rgba(255,255,255,.42);
					}

					.special-lazyness-tutorial-actions{
						display:flex;
						align-items:center;
						gap:8px;
					}

					.special-lazyness-tutorial-button{
						pointer-events:auto;
						min-height:32px;
						padding:0 13px;
						border:0;
						border-radius:9px;
						background:#3089c0;
						color:#fff;
						font-size:11px;
						font-weight:700;
						cursor:pointer;
					}

					.special-lazyness-tutorial-skip{
						pointer-events:auto;
						border:0;
						background:transparent;
						color:rgba(255,255,255,.42);
						font-size:10px;
						font-weight:600;
						cursor:pointer;
					}
				`}
			</style>

			{isInteractive &&
				highlightRect && (
					<div
						className="special-lazyness-tutorial-highlight"
						style={{
							top:
								highlightRect.top -
								4,
							left:
								highlightRect.left -
								4,
							width:
								highlightRect.width +
								8,
							height:
								highlightRect.height +
								8,
						}}
					/>
				)}

			{isInteractive &&
				popoverRect &&
				popoverPosition && (
					<div
						className={`special-lazyness-tutorial-popover ${
							popoverPosition.above
								? "above"
								: ""
						}`}
						style={{
							top:
								popoverPosition.top,
							left:
								popoverPosition.left,
						}}
					>
						<h3 className="special-lazyness-tutorial-title">
							{step.title}
						</h3>

						<p className="special-lazyness-tutorial-description">
							{step.description}
						</p>

						<div className="special-lazyness-tutorial-footer">
							<div className="special-lazyness-tutorial-progress">
								{current} of {total}
							</div>

							<div className="special-lazyness-tutorial-actions">
								{step.showSkip && (
									<button
										type="button"
										className="special-lazyness-tutorial-skip"
										onClick={
											handleSkip
										}
									>
										Skip
									</button>
								)}

								{showPrevious && (
									<button
										type="button"
										className="special-lazyness-tutorial-button"
										onClick={
											handlePrevious
										}
									>
										Previous
									</button>
								)}

								{showNext && (
									<button
										type="button"
										className="special-lazyness-tutorial-button"
										onClick={
											handleNext
										}
									>
										{step.nextLabel ??
											"Next"}
									</button>
								)}
							</div>
						</div>
					</div>
				)}
		</>,
		document.body,
	);
}