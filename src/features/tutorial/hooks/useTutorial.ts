"use client";

import { useCallback, useMemo } from "react";

import {
	useTutorialContext,
} from "../context/TutorialProvider";

import type {
	TutorialStep,
} from "../types";

export function useTutorial() {
	const tutorial = useTutorialContext();

	const isCurrentStep = useCallback(
		(step: TutorialStep) => {
			return (
				tutorial.active &&
				tutorial.step === step
			);
		},
		[
			tutorial.active,
			tutorial.step,
		],
	);

	const goTo = useCallback(
		(step: TutorialStep) => {
			if (!tutorial.active) return;

			tutorial.goTo(step);
		},
		[
			tutorial.active,
			tutorial.goTo,
		],
	);

	const next = useCallback(() => {
		if (!tutorial.active) return;

		tutorial.next();
	}, [
		tutorial.active,
		tutorial.next,
	]);

	const previous = useCallback(() => {
		if (!tutorial.active) return;

		tutorial.previous();
	}, [
		tutorial.active,
		tutorial.previous,
	]);

	const skip = useCallback(() => {
		if (!tutorial.active) return;

		tutorial.skip();
	}, [
		tutorial.active,
		tutorial.skip,
	]);

	const complete = useCallback(() => {
		if (!tutorial.active) return;

		tutorial.complete();
	}, [
		tutorial.active,
		tutorial.complete,
	]);

	const start = useCallback(() => {
		tutorial.start();
	}, [
		tutorial.start,
	]);

	const reset = useCallback(() => {
		tutorial.reset();
	}, [
		tutorial.reset,
	]);

	return useMemo(
		() => ({
			...tutorial,

			isCurrentStep,

			goTo,
			next,
			previous,
			skip,
			complete,
			start,
			reset,
		}),
		[
			tutorial,

			isCurrentStep,

			goTo,
			next,
			previous,
			skip,
			complete,
			start,
			reset,
		],
	);
}