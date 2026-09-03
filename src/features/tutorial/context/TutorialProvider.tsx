"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
	ONBOARDING_STORAGE_KEY,
} from "@/config/onboarding";

import {
	TUTORIAL_STEPS,
	TUTORIAL_STORAGE_KEY,
	getTutorialStepIndex,
} from "../config/appTutorial";

import type {
	TutorialState,
	TutorialStep,
} from "../types";

interface TutorialContextValue
	extends TutorialState {
	start: () => void;
	next: () => void;
	previous: () => void;
	goTo: (step: TutorialStep) => void;
	skip: () => void;
	complete: () => void;
	reset: () => void;
	progress: {
		current: number;
		total: number;
		percentage: number;
	};
}

const TutorialContext =
	createContext<TutorialContextValue | null>(
		null,
	);

const ONBOARDING_COMPLETED_EVENT =
	"special-lazyness-onboarding-completed";

export function TutorialProvider({
	children,
}: {
	children: ReactNode;
}) {
	const pathname = usePathname();

	const [active, setActive] =
		useState(false);

	const [completed, setCompleted] =
		useState(false);

	const [step, setStep] =
		useState<TutorialStep>(
			"home-quick-access",
		);

	/*
	 * ============================================================
	 * START AFTER ONBOARDING
	 * ============================================================
	 */

	const startAfterOnboarding =
		useCallback(() => {
			/*
			 * Tutorial hanya dimulai dari Home.
			 */
			if (pathname !== "/") {
				return;
			}

			/*
			 * Jangan mulai ulang tutorial
			 * yang sudah selesai.
			 */
			const tutorialCompleted =
				localStorage.getItem(
					TUTORIAL_STORAGE_KEY,
				);

			if (
				tutorialCompleted === "true"
			) {
				setCompleted(true);
				setActive(false);

				return;
			}

			/*
			 * Tutorial hanya boleh dimulai
			 * setelah onboarding selesai.
			 */
			const onboardingCompleted =
				localStorage.getItem(
					ONBOARDING_STORAGE_KEY,
				);

			if (
				onboardingCompleted !== "true"
			) {
				return;
			}

			/*
			 * SplashScreen baru saja selesai.
			 *
			 * Beri browser satu frame untuk
			 * menyelesaikan proses hide SplashScreen
			 * sebelum tutorial ditampilkan.
			 */
			requestAnimationFrame(() => {
				setCompleted(false);
				setActive(true);
				setStep(
					"home-quick-access",
				);
			});
		}, [pathname]);

	/*
	 * ============================================================
	 * INITIAL CHECK
	 * ============================================================
	 */

	useEffect(() => {
		startAfterOnboarding();
	}, [
		startAfterOnboarding,
	]);

	/*
	 * ============================================================
	 * ONBOARDING COMPLETED EVENT
	 * ============================================================
	 */

	useEffect(() => {
		function handleOnboardingCompleted() {
			startAfterOnboarding();
		}

		window.addEventListener(
			ONBOARDING_COMPLETED_EVENT,
			handleOnboardingCompleted,
		);

		return () => {
			window.removeEventListener(
				ONBOARDING_COMPLETED_EVENT,
				handleOnboardingCompleted,
			);
		};
	}, [
		startAfterOnboarding,
	]);

	/*
	 * ============================================================
	 * ROUTE LISTENER
	 * ============================================================
	 *
	 * Home
	 *   ↓
	 * Chief Gear
	 *   ↓
	 * /gear
	 *   ↓
	 * chief-gear-type
	 */

	useEffect(() => {
		if (!active) {
			return;
		}

		if (
			pathname === "/gear" &&
			step === "chief-gear"
		) {
			setStep(
				"chief-gear-type",
			);
		}
	}, [
		pathname,
		active,
		step,
	]);

	/*
	 * ============================================================
	 * START
	 * ============================================================
	 */

	const start = useCallback(() => {
		localStorage.removeItem(
			TUTORIAL_STORAGE_KEY,
		);

		setCompleted(false);

		setActive(true);

		setStep(
			"home-quick-access",
		);
	}, []);

	/*
	 * ============================================================
	 * NEXT
	 * ============================================================
	 */

	const next = useCallback(() => {
		if (!active) {
			return;
		}

		setStep((current) => {
			const index =
				getTutorialStepIndex(
					current,
				);

			const nextStep =
				TUTORIAL_STEPS[index + 1];

			if (!nextStep) {
				return current;
			}

			return nextStep.id;
		});
	}, [active]);

	/*
	 * ============================================================
	 * PREVIOUS
	 * ============================================================
	 */

	const previous = useCallback(() => {
		if (!active) {
			return;
		}

		setStep((current) => {
			const index =
				getTutorialStepIndex(
					current,
				);

			const previousStep =
				TUTORIAL_STEPS[index - 1];

			if (!previousStep) {
				return current;
			}

			return previousStep.id;
		});
	}, [active]);

	/*
	 * ============================================================
	 * GO TO
	 * ============================================================
	 */

	const goTo = useCallback(
		(nextStep: TutorialStep) => {
			if (!active) {
				return;
			}

			setStep(nextStep);
		},
		[active],
	);

	/*
	 * ============================================================
	 * SKIP
	 * ============================================================
	 */

	const skip = useCallback(() => {
		localStorage.setItem(
			TUTORIAL_STORAGE_KEY,
			"true",
		);

		setCompleted(true);

		setActive(false);

		setStep("complete");
	}, []);

	/*
	 * ============================================================
	 * COMPLETE
	 * ============================================================
	 */

	const complete = useCallback(() => {
		localStorage.setItem(
			TUTORIAL_STORAGE_KEY,
			"true",
		);

		setCompleted(true);

		setActive(false);

		setStep("complete");
	}, []);

	/*
	 * ============================================================
	 * RESET
	 * ============================================================
	 */

	const reset = useCallback(() => {
		localStorage.removeItem(
			TUTORIAL_STORAGE_KEY,
		);

		setCompleted(false);

		setActive(true);

		setStep(
			"home-quick-access",
		);
	}, []);

	/*
	 * ============================================================
	 * PROGRESS
	 * ============================================================
	 *
	 * "complete" tidak dihitung sebagai
	 * bagian dari progress tutorial.
	 */

	const progress = useMemo(() => {
		const tutorialSteps =
			TUTORIAL_STEPS.filter(
				(item) =>
					item.id !== "complete",
			);

		const currentIndex =
			tutorialSteps.findIndex(
				(item) =>
					item.id === step,
			);

		const current =
			currentIndex >= 0
				? currentIndex + 1
				: tutorialSteps.length;

		const total =
			tutorialSteps.length;

		const percentage =
			total > 0
				? Math.round(
						(current / total) *
							100,
					)
				: 0;

		return {
			current,
			total,
			percentage,
		};
	}, [step]);

	/*
	 * ============================================================
	 * CONTEXT VALUE
	 * ============================================================
	 */

	const value = useMemo(
		() => ({
			active,

			step,

			completed,

			start,

			next,

			previous,

			goTo,

			skip,

			complete,

			reset,

			progress,
		}),
		[
			active,
			step,
			completed,
			start,
			next,
			previous,
			goTo,
			skip,
			complete,
			reset,
			progress,
		],
	);

	return (
		<TutorialContext.Provider
			value={value}
		>
			{children}
		</TutorialContext.Provider>
	);
}

export function useTutorialContext() {
	const context =
		useContext(TutorialContext);

	if (!context) {
		throw new Error(
			"useTutorialContext must be used inside TutorialProvider",
		);
	}

	return context;
}