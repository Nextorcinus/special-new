"use client";

import { useEffect, useState } from "react";

import SplashScreen from "@/components/onboarding/SplashScreen";
import { ONBOARDING_STORAGE_KEY } from "@/config/onboarding";

type OnboardingStatus =
	| "checking"
	| "onboarding"
	| "ready";

type Props = {
	children: React.ReactNode;
};

export default function OnboardingGate({
	children,
}: Props) {
	const [status, setStatus] =
		useState<OnboardingStatus>("checking");

	useEffect(() => {
		const completed = localStorage.getItem(
			ONBOARDING_STORAGE_KEY,
		);

		if (completed === "true") {
			setStatus("ready");
		} else {
			setStatus("onboarding");
		}
	}, []);

	if (status === "checking") {
		return (
			<div className="fixed inset-0 z-[99999] bg-[#111111]" />
		);
	}


	if (status === "onboarding") {
		return <SplashScreen />;
	}


	return <>{children}</>;
}