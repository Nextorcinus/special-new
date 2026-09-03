"use client";

import {
	getTutorialStep,
} from "../config/appTutorial";

import {
	useTutorial,
} from "../hooks/useTutorial";

import {
	TutorialPopover,
} from "./TutorialPopover";

export function TutorialOverlay() {
	const tutorial = useTutorial();

	/*
	 * Tutorial tidak aktif.
	 */
	if (!tutorial.active) {
		return null;
	}

	/*
	 * Ambil konfigurasi step aktif.
	 */
	const step = getTutorialStep(
		tutorial.step,
	);

	if (!step) {
		return null;
	}

	return (
		<TutorialPopover
			step={step}
			current={
				tutorial.progress.current
			}
			total={
				tutorial.progress.total
			}
			onNext={tutorial.next}
			onPrevious={
				tutorial.previous
			}
			onSkip={tutorial.skip}
			onComplete={
				tutorial.complete
			}
		/>
	);
}