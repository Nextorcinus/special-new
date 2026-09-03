"use client";

import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import {
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

type TargetRect = {
	top: number;
	left: number;
	width: number;
	height: number;
};

const INTERACTIVE_STEPS = new Set([
	"chief-gear-type",
	"chief-gear-from",
	"chief-gear-target",
	"bag-chief-gear",
]);

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

	const [targetRect, setTargetRect] =
		useState<TargetRect | null>(null);

	const [popoverPosition, setPopoverPosition] =
		useState<{
			top: number;
			left: number;
			above: boolean;
		} | null>(null);

	const isInteractiveStep =
		INTERACTIVE_STEPS.has(step.id);

	const showPrevious =
		current > 1 &&
		!isInteractiveStep &&
		step.id !== "bag-chief-gear";

	const showNext =
		step.allowNext === true &&
		!isInteractiveStep &&
		step.id !== "bag-chief-gear";

	const handleNext = () => {
		if (step.id === "bag-compare") {
			onComplete();
			return;
		}

		onNext();
	};

	useEffect(() => {
		setMounted(true);

		return () => {
			setMounted(false);
		};
	}, []);

	useEffect(() => {
		if (isInteractiveStep) {
			return;
		}

		if (
			typeof document ===
			"undefined"
		) {
			return;
		}

		const target = step.target
			? document.querySelector(
					step.target,
				)
			: null;

		const driverInstance = driver({
			animate: true,
			duration: 300,
			overlayColor: "#000000",
			overlayOpacity: 0.68,
			smoothScroll: true,
			allowClose: false,
			allowScroll: true,
			allowKeyboardControl: false,
			disableActiveInteraction: false,
			advanceOnClick: false,
			stagePadding: 8,
			stageRadius: 16,
			popoverOffset: 12,
			popoverClass:
				"special-lazyness-driver",
			showProgress: false,
			steps: [
				{
					element:
						target ??
						undefined,
					popover: {
						title: step.title,
						description:
							step.description,
						side: getDriverSide(
							step,
						),
						align: "center",
						showButtons: [
							...(showPrevious
								? [
										"previous" as const,
									]
								: []),
							...(showNext
								? [
										"next" as const,
									]
								: []),
						],
					},
					disableActiveInteraction: false,
					advanceOnClick: false,
				},
			],
			onNextClick: () => {
				driverInstance.destroy();
				driverRef.current = null;
				handleNext();
			},
			onPrevClick: () => {
				driverInstance.destroy();
				driverRef.current = null;
				onPrevious();
			},
			onPopoverRender: (
				popover,
			) => {
				const footer =
					popover.footer;

				if (
					footer &&
					step.showSkip
				) {
					const existingSkip =
						footer.querySelector(
							".special-lazyness-driver-skip",
						);

					if (
						!existingSkip
					) {
						const skipButton =
							document.createElement(
								"button",
							);

						skipButton.type =
							"button";

						skipButton.className =
							"special-lazyness-driver-skip";

						skipButton.textContent =
							"Skip";

						skipButton.addEventListener(
							"click",
							() => {
								driverInstance.destroy();
								driverRef.current =
									null;
								onSkip();
							},
						);

						footer.insertBefore(
							skipButton,
							footer.firstChild,
						);
					}
				}
			},
			onDestroyStarted:
				() => {
					driverRef.current =
						null;
				},
		});

		driverRef.current =
			driverInstance;

		driverInstance.drive();

		return () => {
			driverInstance.destroy();
			driverRef.current =
				null;
		};
	}, [
		isInteractiveStep,
		step,
		showNext,
		showPrevious,
		onNext,
		onPrevious,
		onSkip,
		onComplete,
	]);

	useLayoutEffect(() => {
		if (!isInteractiveStep) {
			setTargetRect(null);
			setPopoverPosition(null);
			return;
		}

		if (
			typeof document ===
			"undefined"
		) {
			return;
		}

		let frame = 0;

		const updatePosition = () => {
			cancelAnimationFrame(
				frame,
			);

			frame =
				requestAnimationFrame(
					() => {
						const target =
							step.target
								? document.querySelector(
										step.target,
									)
								: null;

						if (
							!(
								target instanceof
								HTMLElement
							)
						) {
							setTargetRect(
								null,
							);
							setPopoverPosition(
								null,
							);
							return;
						}

						const rect =
							target.getBoundingClientRect();

						setTargetRect({
							top: rect.top,
							left: rect.left,
							width: rect.width,
							height: rect.height,
						});

						const viewportWidth =
							window.innerWidth;

						const viewportHeight =
							window.innerHeight;

						const popoverWidth =
							Math.min(
								360,
								viewportWidth -
									24,
							);

						const popoverHeight =
							step.id ===
							"bag-chief-gear"
								? 160
								: 150;

						const gap = 14;

						const left =
							clamp(
								rect.left +
									rect.width /
										2 -
									popoverWidth /
										2,
								12,
								viewportWidth -
									popoverWidth -
									12,
							);

						const spaceAbove =
							rect.top;

						const spaceBelow =
							viewportHeight -
							rect.bottom;

						let above =
							false;

						if (
							step.id ===
							"chief-gear-type"
						) {
							above = true;
						} else if (
							step.id ===
							"bag-chief-gear"
						) {
							above =
								spaceAbove >
									popoverHeight +
										gap &&
								spaceAbove >
									spaceBelow;
						} else {
							above =
								spaceBelow <
									popoverHeight +
										gap &&
								spaceAbove >
									spaceBelow;
						}

						const top = above
							? rect.top -
								gap
							: rect.bottom +
								gap;

						setPopoverPosition({
							top,
							left,
							above,
						});
					},
				);
		};

		updatePosition();

		window.addEventListener(
			"resize",
			updatePosition,
			{ passive: true },
		);

		window.addEventListener(
			"scroll",
			updatePosition,
			{
				passive: true,
				capture: true,
			},
		);

		const observer =
			new MutationObserver(
				updatePosition,
			);

		observer.observe(
			document.body,
			{
				childList: true,
				subtree: true,
				attributes: true,
			},
		);

		return () => {
			cancelAnimationFrame(
				frame,
			);

			window.removeEventListener(
				"resize",
				updatePosition,
			);

			window.removeEventListener(
				"scroll",
				updatePosition,
				true,
			);

			observer.disconnect();
		};
	}, [
		isInteractiveStep,
		step.target,
		step.id,
	]);

	if (!mounted) {
		return null;
	}

	return createPortal(
		<>
			<style>
				{`
					.driver-overlay {
						pointer-events: none !important;
					}

					.driver-stage {
						pointer-events: none !important;
					}

					.driver-active-element {
						pointer-events: auto !important;
					}

					.special-lazyness-driver {
						width: min(360px, calc(100vw - 24px)) !important;
						max-width: 360px !important;
						margin: 0 !important;
						padding: 18px !important;
						border: 1px solid rgba(255, 255, 255, 0.1) !important;
						border-radius: 16px !important;
						background: rgb(24, 24, 28) !important;
						color: #ffffff !important;
						box-shadow:
							0 20px 50px rgba(0, 0, 0, 0.45),
							0 8px 24px rgba(0, 0, 0, 0.28),
							0 0 0 1px rgba(255, 255, 255, 0.025) !important;
						backdrop-filter: blur(18px);
						-webkit-backdrop-filter: blur(18px);
						pointer-events: none !important;
					}

					.special-lazyness-driver .driver-popover-title {
						margin: 0 !important;
						font-size: 15px !important;
						font-weight: 700 !important;
						line-height: 1.35 !important;
						color: #ffffff !important;
					}

					.special-lazyness-driver .driver-popover-description {
						margin: 7px 0 0 !important;
						font-size: 12px !important;
						font-weight: 400 !important;
						line-height: 1.55 !important;
						color: rgba(255, 255, 255, 0.68) !important;
					}

					.special-lazyness-driver .driver-popover-footer {
						display: flex !important;
						align-items: center !important;
						justify-content: flex-end !important;
						gap: 8px !important;
						margin-top: 15px !important;
					}

					.special-lazyness-driver .driver-popover-footer button {
						pointer-events: auto !important;
						border: 0 !important;
						border-radius: 9px !important;
						font-size: 11px !important;
						font-weight: 700 !important;
						cursor: pointer !important;
					}

					.special-lazyness-driver .driver-popover-prev-btn {
						min-height: 32px !important;
						padding: 0 13px !important;
						background: rgba(255, 255, 255, 0.08) !important;
						color: rgba(255, 255, 255, 0.75) !important;
					}

					.special-lazyness-driver .driver-popover-next-btn {
						min-height: 32px !important;
						padding: 0 13px !important;
						background: #3089c0 !important;
						color: #ffffff !important;
					}

					.special-lazyness-driver .driver-popover-next-btn:hover {
						filter: brightness(1.08);
					}

					.special-lazyness-driver-skip {
						margin-right: auto !important;
						padding: 4px !important;
						background: transparent !important;
						color: rgba(255, 255, 255, 0.42) !important;
						font-size: 10px !important;
						font-weight: 600 !important;
					}

					.special-lazyness-driver-skip:hover {
						color: rgba(255, 255, 255, 0.72) !important;
					}

					.special-lazyness-tutorial-highlight {
						position: fixed;
						z-index: 2147483640;
						border: 3px solid #3089c0;
						border-radius: 14px;
						background: transparent;
						box-shadow:
							0 0 0 4px rgba(48, 137, 192, 0.22),
							0 0 24px rgba(48, 137, 192, 0.28);
						pointer-events: none;
						box-sizing: border-box;
					}

					.special-lazyness-tutorial-highlight::after {
						content: "";
						position: absolute;
						inset: -6px;
						border: 1px solid rgba(48, 137, 192, 0.28);
						border-radius: 18px;
						pointer-events: none;
					}

					.special-lazyness-tutorial-popover {
						position: fixed;
						z-index: 2147483647;
						width: min(360px, calc(100vw - 24px));
						max-width: 360px;
						padding: 18px;
						border: 1px solid rgba(255, 255, 255, 0.1);
						border-radius: 16px;
						background: rgb(24, 24, 28);
						color: #ffffff;
						box-shadow:
							0 20px 50px rgba(0, 0, 0, 0.45),
							0 8px 24px rgba(0, 0, 0, 0.28),
							0 0 0 1px rgba(255, 255, 255, 0.025);
						backdrop-filter: blur(18px);
						-webkit-backdrop-filter: blur(18px);
						pointer-events: none;
					}

					.special-lazyness-tutorial-popover.above {
						transform: translateY(-100%);
					}

					.special-lazyness-tutorial-title {
						margin: 0;
						font-size: 15px;
						font-weight: 700;
						line-height: 1.35;
						letter-spacing: -0.01em;
					}

					.special-lazyness-tutorial-description {
						margin: 7px 0 0;
						font-size: 12px;
						font-weight: 400;
						line-height: 1.55;
						color: rgba(255, 255, 255, 0.68);
					}

					.special-lazyness-tutorial-footer {
						display: flex;
						align-items: center;
						justify-content: space-between;
						gap: 12px;
						margin-top: 15px;
					}

					.special-lazyness-tutorial-progress {
						font-size: 10px;
						font-weight: 700;
						line-height: 1;
						color: rgba(255, 255, 255, 0.42);
					}

					.special-lazyness-tutorial-actions {
						display: flex;
						align-items: center;
						gap: 8px;
					}

					.special-lazyness-tutorial-button {
						pointer-events: auto;
						display: inline-flex;
						align-items: center;
						justify-content: center;
						min-height: 32px;
						padding: 0 13px;
						border: 0;
						border-radius: 9px;
						background: #3089c0;
						color: #ffffff;
						font-size: 11px;
						font-weight: 700;
						line-height: 1;
						cursor: pointer;
						transition:
							filter 150ms ease,
							transform 150ms ease;
					}

					.special-lazyness-tutorial-button:hover {
						filter: brightness(1.08);
					}

					.special-lazyness-tutorial-button:active {
						transform: scale(0.97);
					}

					.special-lazyness-tutorial-skip {
						pointer-events: auto;
						border: 0;
						padding: 4px;
						background: transparent;
						color: rgba(255, 255, 255, 0.42);
						font-size: 10px;
						font-weight: 600;
						line-height: 1;
						cursor: pointer;
						transition: color 150ms ease;
					}

					.special-lazyness-tutorial-skip:hover {
						color: rgba(255, 255, 255, 0.72);
					}
				`}
			</style>

			{isInteractiveStep &&
				targetRect && (
					<div
						className="special-lazyness-tutorial-highlight"
						style={{
							top:
								targetRect.top -
								4,
							left:
								targetRect.left -
								4,
							width:
								targetRect.width +
								8,
							height:
								targetRect.height +
								8,
						}}
					/>
				)}

			{isInteractiveStep && (
				<div
					className={`special-lazyness-tutorial-popover ${
						popoverPosition?.above
							? "above"
							: ""
					}`}
					style={{
						top:
							popoverPosition?.top ??
							120,
						left:
							popoverPosition?.left ??
							12,
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
							{current} of{" "}
							{total}
						</div>

						<div className="special-lazyness-tutorial-actions">
							{step.showSkip && (
								<button
									type="button"
									className="special-lazyness-tutorial-skip"
									onClick={
										onSkip
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
										onPrevious
									}
								>
									Prev
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