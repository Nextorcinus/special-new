"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
	ONBOARDING_FEATURES,
	ONBOARDING_STORAGE_KEY,
} from "@/config/onboarding";
import { NAVIGATION } from "@/config/navigation";

const TOTAL_SLIDES = 2;

export default function SplashScreen() {
	const [slide, setSlide] = useState(0);

	const featureItems = useMemo(() => {
		return ONBOARDING_FEATURES.map((feature) => {
			const navigationItem = NAVIGATION.find(
				(item) => item.id === feature.id,
			);

			return {
				...feature,
				href: navigationItem?.href ?? "#",
			};
		});
	}, []);

	function completeOnboarding() {
		localStorage.setItem(
			ONBOARDING_STORAGE_KEY,
			"true",
		);

		window.location.reload();
	}

	function nextSlide() {
		setSlide((current) =>
			Math.min(
				current + 1,
				TOTAL_SLIDES - 1,
			),
		);
	}

	function previousSlide() {
		setSlide((current) =>
			Math.max(current - 1, 0),
		);
	}

	function goToSlide(index: number) {
		setSlide(
			Math.max(
				0,
				Math.min(
					index,
					TOTAL_SLIDES - 1,
				),
			),
		);
	}

	function handleFeatureClick() {
		localStorage.setItem(
			ONBOARDING_STORAGE_KEY,
			"true",
		);
	}

	return (
		<div className="fixed inset-0 z-[99999] overflow-hidden bg-[#111111]">
			<div className="mx-auto flex h-full w-full max-w-md flex-col">
				<div className="relative min-h-0 flex-1 overflow-hidden">
					{/* ==================================================
					    SLIDE 1
					================================================== */}
					<div
						className={[
							"absolute inset-0 flex flex-col",
							"items-center",
							"px-5 py-6 sm:px-8 sm:py-8",
							"transition-all duration-500 ease-out",
							slide === 0
								? "pointer-events-auto translate-x-0 opacity-100"
								: "pointer-events-none -translate-x-full opacity-0",
						].join(" ")}
					>
						{/* Main Content */}
						<div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
							{/* Logo + Title */}
							<div className="flex w-full items-center justify-center gap-3 sm:gap-4">
								<div className="relative size-12 shrink-0 sm:size-14 md:size-16">
									<Image
										src="/icons/logo.png"
										alt="Special Lazyness"
										fill
										priority
										sizes="(max-width: 640px) 48px, 64px"
										className="rounded-full object-contain"
									/>
								</div>

								<h1
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
								Lorem ipsum dolor sit amet
								consectetur. Et purus
								veniam blandit facilisis
								velit leo amare.
								Ullam asperiores id
								quisit at erat.
								Consequatur laboriosam
								non.
							</p>
						</div>

						{/* Bottom */}
						<div className="flex w-full shrink-0 flex-col items-center">
							{/* Indicator */}
							<div className="mb-4 flex items-center gap-1">
								<button
									type="button"
									aria-label="Go to slide 1"
									onClick={() =>
										goToSlide(0)
									}
									className="flex size-5 items-center justify-center"
								>
									<span
										className={[
											"size-1.5 rounded-full",
											"transition-all duration-300",
											slide === 0
												? "bg-white"
												: "bg-white/30",
										].join(" ")}
									/>
								</button>

								<button
									type="button"
									aria-label="Go to slide 2"
									onClick={() =>
										goToSlide(1)
									}
									className="flex size-5 items-center justify-center"
								>
									<span
										className={[
											"size-1.5 rounded-full",
											"transition-all duration-300",
											slide === 1
												? "bg-white"
												: "bg-white/30 hover:bg-white/60",
										].join(" ")}
									/>
								</button>
							</div>

							{/* Buttons */}
							<div className="flex w-full max-w-[280px] items-center justify-center gap-2 sm:max-w-[320px] sm:gap-3">
								<button
									type="button"
									onClick={nextSlide}
									className="
										min-w-0
										flex-1
										rounded-full
										border border-white/40
										px-4 py-2.5
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
										border border-white/20
										px-4 py-2.5
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
						className={[
							"absolute inset-0 flex flex-col",
							"items-center",
							"px-5 py-6 sm:px-8 sm:py-8",
							"transition-all duration-500 ease-out",
							slide === 1
								? "pointer-events-auto translate-x-0 opacity-100"
								: "pointer-events-none translate-x-full opacity-0",
						].join(" ")}
					>
						{/* Character */}
						<div
							className="
								relative
								mt-1
								h-[clamp(180px,42vh,280px)]
								w-[clamp(160px,55vw,230px)]
								shrink-0
							"
						>
							<Image
								src="/icons/splash2.png"
								alt="Special Lazyness"
								fill
								priority
								sizes="(max-width: 640px) 55vw, 230px"
								className="object-contain"
							/>
						</div>

						{/* Description */}
						<p
							className="
								mt-2
								w-full
								max-w-[280px]
								text-center
								text-[clamp(0.7rem,2.5vw,0.875rem)]
								leading-relaxed
								text-white/60
								sm:max-w-[320px]
							"
						>
							Lorem ipsum dolor sit amet
							consectetur. Et purus
							veniam blandit facilisis
							velit leo.
							<br />
							Our special tools are
							designed to make your
							journey easier.
						</p>

						{/* Feature Pills */}
						<div
							className="
								mt-4
								grid
								w-full
								max-w-[280px]
								grid-cols-2
								gap-2
								sm:max-w-[320px]
								sm:gap-2.5
							"
						>
							{featureItems.map(
								(feature) => {
									const isAvailable =
										feature.href !==
										"#";

									if (!isAvailable) {
										return (
											<div
												key={
													feature.id
												}
												className="
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
													sm:px-3
												"
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
											href={
												feature.href
											}
											onClick={
												handleFeatureClick
											}
											className="
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
												hover:bg-white/15
												hover:text-white
												active:scale-95
												sm:px-3
											"
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

						{/* Bottom */}
						<div className="mt-auto flex w-full shrink-0 flex-col items-center pt-5">
							{/* Indicator */}
							<div className="mb-4 flex items-center gap-1">
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
										goToSlide(1)
									}
									className="flex size-5 items-center justify-center"
								>
									<span className="size-1.5 rounded-full bg-white" />
								</button>
							</div>

							{/* Get Started */}
							<button
								type="button"
								onClick={
									completeOnboarding
								}
								className="
									w-full
									max-w-[280px]
									rounded-full
									bg-white
									px-6
									py-3
									text-[clamp(0.7rem,2.5vw,0.875rem)]
									font-semibold
									tracking-wide
									text-[#111111]
									transition-all
									hover:scale-[1.02]
									active:scale-[0.98]
									sm:max-w-[320px]
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