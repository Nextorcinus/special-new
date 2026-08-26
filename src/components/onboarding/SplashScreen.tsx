"use client";

import Image from "next/image";
import Link from "next/link";
import {
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import gsap from "gsap";

import { NAVIGATION } from "@/config/navigation";
import {
	ONBOARDING_FEATURES,
	ONBOARDING_STORAGE_KEY,
} from "@/config/onboarding";

const TOTAL_SLIDES = 2;
const SWIPE_THRESHOLD = 60;

export default function SplashScreen() {
	const [slide, setSlide] = useState(0);

	/*
	 * ============================================================
	 * REFS
	 * ============================================================
	 */

	const viewportRef =
		useRef<HTMLDivElement | null>(null);

	const slideRefs =
		useRef<(HTMLDivElement | null)[]>([]);

	const previousSlideRef =
		useRef(0);

	const animationLock =
		useRef(false);

	/*
	 * Swipe
	 */
	const touchStartX =
		useRef<number | null>(null);

	const touchStartY =
		useRef<number | null>(null);

	const isSwiping =
		useRef(false);

	const suppressClick =
		useRef(false);

	/*
	 * Character floating animation
	 */
	const floatingTween =
		useRef<gsap.core.Tween | null>(
			null,
		);

	/*
	 * ============================================================
	 * FEATURE ITEMS
	 * ============================================================
	 */

	const featureItems = useMemo(() => {
		return ONBOARDING_FEATURES.map(
			(feature) => {
				const navigationItem =
					NAVIGATION.find(
						(item) =>
							item.id ===
							feature.id,
					);

				return {
					...feature,
					href:
						navigationItem?.href ??
						"#",
				};
			},
		);
	}, []);

	/*
	 * ============================================================
	 * COMPLETE
	 * ============================================================
	 */

	function completeOnboarding() {
		localStorage.setItem(
			ONBOARDING_STORAGE_KEY,
			"true",
		);

		window.location.reload();
	}

	/*
	 * ============================================================
	 * SLIDE NAVIGATION
	 * ============================================================
	 */

	function changeSlide(
		nextIndex: number,
	) {
		if (
			animationLock.current ||
			nextIndex === slide ||
			nextIndex < 0 ||
			nextIndex >= TOTAL_SLIDES
		) {
			return;
		}

		setSlide(nextIndex);
	}

	function nextSlide() {
		changeSlide(
			Math.min(
				slide + 1,
				TOTAL_SLIDES - 1,
			),
		);
	}

	function previousSlide() {
		changeSlide(
			Math.max(slide - 1, 0),
		);
	}

	function goToSlide(index: number) {
		changeSlide(
			Math.max(
				0,
				Math.min(
					index,
					TOTAL_SLIDES - 1,
				),
			),
		);
	}

	/*
	 * ============================================================
	 * GSAP
	 * ============================================================
	 */

	useLayoutEffect(() => {
	const current =
		slideRefs.current[slide];

	if (!current) {
		return;
	}

	const previousIndex =
		previousSlideRef.current;

	const direction =
		slide > previousIndex ? 1 : -1;

	const previous =
		slideRefs.current[previousIndex];

	animationLock.current = true;

	/*
	 * ============================================================
	 * CLEANUP ALL SLIDES
	 * ============================================================
	 */

	slideRefs.current.forEach(
		(element, index) => {
			if (!element) {
				return;
			}

			gsap.killTweensOf(element);

			gsap.killTweensOf(
				element.querySelectorAll(
					"[data-gsap], [data-logo], [data-title], [data-description], [data-character], [data-feature], [data-indicators], [data-buttons], [data-start]",
				),
			);

			/*
			 * IMPORTANT
			 *
			 * Semua slide selain slide aktif
			 * harus benar-benar invisible.
			 *
			 * Ini yang mencegah slide 1 dan 2
			 * tampil bersamaan ketika pertama
			 * kali halaman dibuka.
			 */
			if (index !== slide) {
				gsap.set(element, {
					xPercent:
						index < slide
							? -100
							: 100,
					scale: 0.92,
					opacity: 0,
					filter: "blur(8px)",
					zIndex: 1,
				});
			}
		},
	);

	/*
	 * Kill floating character animation.
	 */
	if (floatingTween.current) {
		floatingTween.current.kill();
		floatingTween.current = null;
	}

	/*
	 * ============================================================
	 * CURRENT SLIDE INITIAL STATE
	 * ============================================================
	 */

	gsap.set(current, {
		xPercent: direction * 100,
		scale: 0.92,
		opacity: 0,
		filter: "blur(8px)",
		zIndex: 2,
	});

	/*
	 * ============================================================
	 * PREVIOUS SLIDE
	 * ============================================================
	 */

	if (
		previous &&
		previous !== current
	) {
		gsap.to(previous, {
			xPercent:
				-direction * 100,
			scale: 0.92,
			opacity: 0,
			filter: "blur(8px)",
			duration: 0.55,
			ease: "power3.inOut",
			overwrite: true,
		});
	}

	/*
	 * ============================================================
	 * HIDE CURRENT CONTENT
	 * ============================================================
	 */

	const content =
		current.querySelectorAll(
			"[data-logo], [data-title], [data-description], [data-character], [data-feature], [data-indicators], [data-buttons], [data-start]",
		);

	gsap.set(content, {
		opacity: 0,
	});

	/*
	 * ============================================================
	 * MASTER TIMELINE
	 * ============================================================
	 */

	const master =
		gsap.timeline({
			overwrite: true,

			onComplete: () => {
				animationLock.current =
					false;

				previousSlideRef.current =
					slide;
			},
		});

	/*
	 * ============================================================
	 * SLIDE CONTAINER
	 * ============================================================
	 */

	master.to(
		current,
		{
			xPercent: 0,
			scale: 1,
			opacity: 1,
			filter: "blur(0px)",
			duration: 0.7,
			ease: "power4.out",
		},
		0,
	);

	/*
	 * ============================================================
	 * SLIDE 1
	 * ============================================================
	 */

	if (slide === 0) {
		const logo =
			current.querySelector(
				"[data-logo]",
			);

		const title =
			current.querySelector(
				"[data-title]",
			);

		const description =
			current.querySelector(
				"[data-description]",
			);

		const indicators =
			current.querySelector(
				"[data-indicators]",
			);

		const buttons =
			current.querySelector(
				"[data-buttons]",
			);

		/*
		 * Logo
		 */
		if (logo) {
			gsap.set(logo, {
				opacity: 0,
				scale: 0.5,
				y: 20,
				rotation: -8,
				filter: "blur(10px)",
			});

			master.to(
				logo,
				{
					opacity: 1,
					scale: 1,
					y: 0,
					rotation: 0,
					filter: "blur(0px)",
					duration: 0.8,
					ease: "back.out(1.7)",
				},
				0.2,
			);
		}

		/*
		 * Title
		 */
		if (title) {
			gsap.set(title, {
				opacity: 0,
				y: 35,
				filter: "blur(8px)",
			});

			master.to(
				title,
				{
					opacity: 1,
					y: 0,
					filter: "blur(0px)",
					duration: 0.65,
					ease: "power4.out",
				},
				0.4,
			);
		}

		/*
		 * Description
		 */
		if (description) {
			gsap.set(description, {
				opacity: 0,
				y: 25,
			});

			master.to(
				description,
				{
					opacity: 1,
					y: 0,
					duration: 0.55,
					ease: "power3.out",
				},
				0.7,
			);
		}

		/*
		 * Indicators
		 */
		if (indicators) {
			gsap.set(indicators, {
				opacity: 0,
				y: 15,
			});

			master.to(
				indicators,
				{
					opacity: 1,
					y: 0,
					duration: 0.45,
					ease: "power3.out",
				},
				0.95,
			);
		}

		/*
		 * Buttons
		 */
		if (buttons) {
			gsap.set(buttons, {
				opacity: 0,
				y: 25,
				scale: 0.9,
			});

			master.to(
				buttons,
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: 0.6,
					ease: "back.out(1.6)",
				},
				1.05,
			);
		}
	}

	/*
	 * ============================================================
	 * SLIDE 2
	 * ============================================================
	 */

	if (slide === 1) {
		const character =
			current.querySelector(
				"[data-character]",
			);

		const description =
			current.querySelector(
				"[data-description]",
			);

		const features =
			current.querySelectorAll(
				"[data-feature]",
			);

		const indicators =
			current.querySelector(
				"[data-indicators]",
			);

		const button =
			current.querySelector(
				"[data-start]",
			);

		/*
		 * Character
		 */
		if (character) {
			gsap.set(character, {
				opacity: 0,
				y: 70,
				scale: 0.65,
				rotation: -5,
				filter: "blur(10px)",
			});

			master.to(
				character,
				{
					opacity: 1,
					y: 0,
					scale: 1,
					rotation: 0,
					filter: "blur(0px)",
					duration: 0.9,
					ease: "elastic.out(1, 0.65)",
				},
				0.15,
			);

			/*
			 * Floating animation
			 */
			master.call(
				() => {
					floatingTween.current =
						gsap.to(
							character,
							{
								y: -7,
								duration: 2.2,
								ease: "sine.inOut",
								yoyo: true,
								repeat: -1,
							},
						);
				},
				[],
				1.2,
			);
		}

		/*
		 * Description
		 */
		if (description) {
			gsap.set(description, {
				opacity: 0,
				y: 30,
			});

			master.to(
				description,
				{
					opacity: 1,
					y: 0,
					duration: 0.55,
					ease: "power3.out",
				},
				0.65,
			);
		}

		/*
		 * Feature cards
		 */
		if (features.length) {
			gsap.set(features, {
				opacity: 0,
				y: 25,
				scale: 0.8,
				rotationX: 20,
			});

			master.to(
				features,
				{
					opacity: 1,
					y: 0,
					scale: 1,
					rotationX: 0,
					duration: 0.5,
					ease: "back.out(1.7)",
					stagger: 0.08,
				},
				0.9,
			);
		}

		/*
		 * Indicators
		 */
		if (indicators) {
			gsap.set(indicators, {
				opacity: 0,
				y: 15,
			});

			master.to(
				indicators,
				{
					opacity: 1,
					y: 0,
					duration: 0.45,
					ease: "power3.out",
				},
				1.35,
			);
		}

		/*
		 * Get Started
		 */
		if (button) {
			gsap.set(button, {
				opacity: 0,
				y: 30,
				scale: 0.9,
			});

			master.to(
				button,
				{
					opacity: 1,
					y: 0,
					scale: 1,
					duration: 0.6,
					ease: "back.out(1.7)",
				},
				1.42,
			);
		}
	}

	/*
	 * ============================================================
	 * CLEANUP
	 * ============================================================
	 */

	return () => {
		master.kill();

		if (floatingTween.current) {
			floatingTween.current.kill();
			floatingTween.current = null;
		}
	};
}, [slide]);

	/*
	 * ============================================================
	 * INTERACTIVE TARGET
	 * ============================================================
	 */

	function isInteractiveTarget(
		target: EventTarget | null,
	) {
		if (
			!(
				target instanceof
				HTMLElement
			)
		) {
			return false;
		}

		return Boolean(
			target.closest(
				"button, a, input, textarea, select, [role='button']",
			),
		);
	}

	/*
	 * ============================================================
	 * POINTER DOWN
	 * ============================================================
	 */

	function handlePointerDown(
		event: React.PointerEvent<HTMLDivElement>,
	) {
		if (!event.isPrimary) {
			return;
		}

		if (
			isInteractiveTarget(
				event.target,
			)
		) {
			touchStartX.current = null;
			touchStartY.current = null;
			isSwiping.current = false;

			return;
		}

		touchStartX.current =
			event.clientX;

		touchStartY.current =
			event.clientY;

		isSwiping.current = false;
	}

	/*
	 * ============================================================
	 * POINTER MOVE
	 * ============================================================
	 */

	function handlePointerMove(
		event: React.PointerEvent<HTMLDivElement>,
	) {
		if (
			touchStartX.current === null ||
			touchStartY.current === null
		) {
			return;
		}

		const deltaX =
			event.clientX -
			touchStartX.current;

		const deltaY =
			event.clientY -
			touchStartY.current;

		if (
			Math.abs(deltaY) >
			Math.abs(deltaX)
		) {
			return;
		}

		if (
			Math.abs(deltaX) >=
			SWIPE_THRESHOLD
		) {
			isSwiping.current = true;
		}
	}

	/*
	 * ============================================================
	 * POINTER UP
	 * ============================================================
	 */

	function handlePointerUp(
		event: React.PointerEvent<HTMLDivElement>,
	) {
		if (
			touchStartX.current === null ||
			touchStartY.current === null
		) {
			return;
		}

		const deltaX =
			event.clientX -
			touchStartX.current;

		const deltaY =
			event.clientY -
			touchStartY.current;

		const isHorizontal =
			Math.abs(deltaX) >
			Math.abs(deltaY);

		const isLongEnough =
			Math.abs(deltaX) >=
			SWIPE_THRESHOLD;

		touchStartX.current = null;
		touchStartY.current = null;

		if (
			!isHorizontal ||
			!isLongEnough
		) {
			isSwiping.current = false;
			return;
		}

		isSwiping.current = true;

		if (deltaX < 0) {
			nextSlide();
		}

		if (deltaX > 0) {
			previousSlide();
		}

		suppressClick.current = true;

		window.setTimeout(() => {
			suppressClick.current =
				false;
			isSwiping.current = false;
		}, 350);
	}

	/*
	 * ============================================================
	 * POINTER CANCEL
	 * ============================================================
	 */

	function handlePointerCancel() {
		touchStartX.current = null;
		touchStartY.current = null;
		isSwiping.current = false;
	}

	/*
	 * ============================================================
	 * CLICK CAPTURE
	 * ============================================================
	 */

	function handleClickCapture(
		event: React.MouseEvent<HTMLDivElement>,
	) {
		if (!suppressClick.current) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		suppressClick.current = false;
	}

	/*
	 * ============================================================
	 * FEATURE CLICK
	 * ============================================================
	 */

	function handleFeatureClick() {
		localStorage.setItem(
			ONBOARDING_STORAGE_KEY,
			"true",
		);
	}

	/*
	 * ============================================================
	 * RENDER
	 * ============================================================
	 */

	return (
		<div className="fixed inset-0 z-[99999] overflow-hidden bg-[#111111]">
			<div className="mx-auto flex h-full w-full max-w-md flex-col">
				<div
					ref={viewportRef}
					className="
						relative
						min-h-0
						flex-1
						overflow-hidden
						touch-pan-y
						select-none
					"
					onPointerDown={
						handlePointerDown
					}
					onPointerMove={
						handlePointerMove
					}
					onPointerUp={
						handlePointerUp
					}
					onPointerCancel={
						handlePointerCancel
					}
					onClickCapture={
						handleClickCapture
					}
				>
					{/* ==================================================
					    SLIDE 1
					================================================== */}

					<div
						ref={(element) => {
							slideRefs.current[0] =
								element;
						}}
						className={[
							"absolute inset-0 flex flex-col",
							"items-center",
							"px-5 py-6 sm:px-8 sm:py-8",
							slide === 0
								? "pointer-events-auto"
								: "pointer-events-none",
						].join(" ")}
					>
						{/* Main */}
						<div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
							{/* Logo + Title */}
							<div className="flex w-full items-center justify-center gap-3 sm:gap-4">
								<div
									data-logo
									className="relative size-12 shrink-0 sm:size-14 md:size-16"
								>
									<Image
										src="/icons/logo.png"
										alt="Special Lazyness"
										fill
										priority
										sizes="
											(max-width: 640px) 48px,
											(max-width: 768px) 56px,
											64px
										"
										className="rounded-full object-contain"
									/>
								</div>

								<h1
									data-title
									className="
										text-[clamp(1.5rem,6vw,2rem)]
										leading-[0.95]
										text-[#e5f56a]
									"
									style={{
										fontFamily:
											"Georgia, serif",
									}}
								>
									Special
									<br />
									Lazyness
								</h1>
							</div>

							{/* Description */}
							<p
								data-description
								className="
									mt-6
									w-full
									max-w-[280px]
									text-center
									text-[clamp(0.7rem,2.5vw,0.875rem)]
									leading-relaxed
									text-white/60
									sm:mt-8
									sm:max-w-[320px]
								"
							>
								A Whiteout Survival
								calculator and
								companion. Calculate
								Chief Gear, Chief
								Charm, Research,
								Buildings, War
								Academy, Troops, and
								more to help you plan
								your progression.
							</p>
						</div>

						{/* Bottom */}
						<div className="flex w-full shrink-0 flex-col items-center">
							{/* Indicators */}
							<div
								data-indicators
								className="mb-4 flex items-center gap-1"
							>
								<button
									type="button"
									aria-label="Go to slide 1"
									onClick={() =>
										goToSlide(
											0,
										)
									}
									className="flex size-5 items-center justify-center"
								>
									<span
										className={[
											"size-1.5 rounded-full",
											slide ===
											0
												? "bg-white"
												: "bg-white/30",
										].join(
											" ",
										)}
									/>
								</button>

								<button
									type="button"
									aria-label="Go to slide 2"
									onClick={() =>
										goToSlide(
											1,
										)
									}
									className="flex size-5 items-center justify-center"
								>
									<span
										className={[
											"size-1.5 rounded-full",
											slide ===
											1
												? "bg-white"
												: "bg-white/30",
										].join(
											" ",
										)}
									/>
								</button>
							</div>

							{/* Buttons */}
							<div
								data-buttons
								className="flex w-full max-w-[280px] items-center justify-center gap-2 sm:max-w-[320px] sm:gap-3"
							>
								<button
									type="button"
									onClick={
										nextSlide
									}
									className="
										min-w-0
										flex-1
										rounded-full
										border
										border-white/40
										px-4
										py-2.5
										text-[clamp(0.7rem,2.5vw,0.875rem)]
										font-medium
										tracking-wide
										text-white/80
										transition-all
										hover:border-white
										hover:bg-white/5
										hover:text-white
										active:scale-95
									"
								>
									NEXT
								</button>

								<button
									type="button"
									onClick={
										completeOnboarding
									}
									className="
										min-w-0
										flex-1
										rounded-full
										border
										border-white/20
										px-4
										py-2.5
										text-[clamp(0.7rem,2.5vw,0.875rem)]
										font-medium
										tracking-wide
										text-white/50
										transition-all
										hover:border-white/40
										hover:text-white
										active:scale-95
									"
								>
									SKIP
								</button>
							</div>
						</div>
					</div>

					{/* ==================================================
					    SLIDE 2
					================================================== */}

					<div
						ref={(element) => {
							slideRefs.current[1] =
								element;
						}}
						className={[
							"absolute inset-0 flex flex-col",
							"items-center",
							"px-5 py-6 sm:px-8 sm:py-8",
							slide === 1
								? "pointer-events-auto"
								: "pointer-events-none",
						].join(" ")}
					>
						{/* Main */}
						<div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
							{/* Character */}
							<div
								data-character
								className="
									relative
									h-[clamp(180px,35vh,260px)]
									w-[clamp(160px,55vw,230px)]
									shrink-0
								"
							>
								<Image
									src="/icons/splash2.png"
									alt="Special Lazyness"
									fill
									priority
									sizes="
										(max-width: 640px) 55vw,
										230px
									"
									className="object-contain"
								/>
							</div>

							{/* Description */}
							<p
								data-description
								className="
									mt-4
									w-full
									max-w-[300px]
									text-center
									text-[clamp(0.7rem,2.5vw,0.875rem)]
									leading-relaxed
									text-white/60
									sm:max-w-[340px]
								"
							>
								Everything you need
								to plan your Whiteout
								Survival progression.
								Explore calculators,
								track your resources,
								compare upgrades,
								and find the best way
								to spend your
								materials.
							</p>

							{/* Feature Pills */}
							<div
								className="
									mt-5
									grid
									w-full
									max-w-[320px]
									grid-cols-2
									gap-2
									sm:max-w-[340px]
									sm:gap-2.5
								"
							>
								{featureItems.map(
									(feature) => {
										const isAvailable =
											feature.href !==
											"#";

										const classes = `
											flex
											min-w-0
											items-center
											justify-center
											gap-1.5
											rounded-full
											bg-white/10
											px-2.5
											py-2
											text-[clamp(0.6rem,2vw,0.7rem)]
											text-white/80
											transition-all
											sm:px-3
											${
												isAvailable
													? "hover:bg-white/15 hover:text-white active:scale-95"
													: ""
											}
										`;

										if (
											!isAvailable
										) {
											return (
												<div
													key={
														feature.id
													}
													data-feature
													className={
														classes
													}
												>
													<span className="min-w-0 truncate">
														{
															feature.label
														}
													</span>

													<span className="flex size-3 shrink-0 items-center justify-center rounded-full bg-white/10 text-[7px]">
														↗
													</span>
												</div>
											);
										}

										return (
											<Link
												key={
													feature.id
												}
												data-feature
												href={
													feature.href
												}
												onClick={
													handleFeatureClick
												}
												className={
													classes
												}
											>
												<span className="min-w-0 truncate">
													{
														feature.label
													}
												</span>

												<span className="flex size-3 shrink-0 items-center justify-center rounded-full bg-white/10 text-[7px]">
													↗
												</span>
											</Link>
										);
									},
								)}
							</div>
						</div>

						{/* Bottom */}
						<div className="flex w-full shrink-0 flex-col items-center pt-5">
							{/* Indicator */}
							<div
								data-indicators
								className="mb-4 flex items-center gap-1"
							>
								<button
									type="button"
									aria-label="Go to slide 1"
									onClick={
										previousSlide
									}
									className="flex size-5 items-center justify-center"
								>
									<span className="size-1.5 rounded-full bg-white/30 transition-colors hover:bg-white/60" />
								</button>

								<button
									type="button"
									aria-label="Go to slide 2"
									onClick={() =>
										goToSlide(
											1,
										)
									}
									className="flex size-5 items-center justify-center"
								>
									<span className="size-1.5 rounded-full bg-white" />
								</button>
							</div>

							{/* Get Started */}
							<button
								data-start
								type="button"
								onClick={
									completeOnboarding
								}
								className="
									w-full
									max-w-[320px]
									rounded-full
									bg-white
									px-6
									py-3
									text-[clamp(0.7rem,2.5vw,0.875rem)]
									font-semibold
									tracking-wide
									text-[#111111]
									transition-transform
									hover:scale-[1.02]
									active:scale-[0.98]
								"
							>
								GET STARTED
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}