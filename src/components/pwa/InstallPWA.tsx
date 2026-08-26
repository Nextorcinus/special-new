"use client";

import {
	Download,
	X,
} from "lucide-react";
import {
	useEffect,
	useState,
} from "react";

type BeforeInstallPromptEvent =
	Event & {
		prompt: () => Promise<{
			outcome:
				| "accepted"
				| "dismissed";
			platform: string;
		}>;

		userChoice: Promise<{
			outcome:
				| "accepted"
				| "dismissed";
			platform: string;
		}>;

		platforms?: string[];
	};

export default function InstallPWA() {
	const [
		deferredPrompt,
		setDeferredPrompt,
	] =
		useState<BeforeInstallPromptEvent | null>(
			null,
		);

	const [
		isInstalled,
		setIsInstalled,
	] = useState(false);

	useEffect(() => {
		/*
		 * ============================================================
		 * Detect installed PWA
		 * ============================================================
		 */

		const checkInstalled = () => {
			const standalone =
				window.matchMedia(
					"(display-mode: standalone)",
				).matches;

			const iosStandalone =
				"standalone" in
				window.navigator &&
				Boolean(
					(
						window.navigator as Navigator & {
							standalone?: boolean;
						}
					).standalone,
				);

			setIsInstalled(
				standalone ||
					iosStandalone,
			);
		};

		checkInstalled();

		/*
		 * ============================================================
		 * beforeinstallprompt
		 * ============================================================
		 */

		const handleBeforeInstallPrompt = (
			event: Event,
		) => {
			console.log(
				"[PWA] beforeinstallprompt received",
			);

			event.preventDefault();

			const promptEvent =
				event as BeforeInstallPromptEvent;

			console.log(
				"[PWA] platforms:",
				promptEvent.platforms,
			);

			setDeferredPrompt(
				promptEvent,
			);
		};

		window.addEventListener(
			"beforeinstallprompt",
			handleBeforeInstallPrompt,
		);

		/*
		 * ============================================================
		 * Installed
		 * ============================================================
		 */

		const handleAppInstalled = () => {
			console.log(
				"[PWA] App installed",
			);

			setIsInstalled(true);
			setDeferredPrompt(null);
		};

		window.addEventListener(
			"appinstalled",
			handleAppInstalled,
		);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);

			window.removeEventListener(
				"appinstalled",
				handleAppInstalled,
			);
		};
	}, []);

	/*
	 * ============================================================
	 * Native install
	 * ============================================================
	 */

	async function handleInstall() {
		console.log(
			"[PWA] Install clicked",
		);

		if (!deferredPrompt) {
			console.warn(
				"[PWA] beforeinstallprompt is not available.",
			);

			return;
		}

		const prompt =
			deferredPrompt;

		setDeferredPrompt(null);

		try {
			const result =
				await prompt.prompt();

			console.log(
				"[PWA] Install result:",
				result.outcome,
			);
		} catch (error) {
			console.error(
				"[PWA] Install prompt failed:",
				error,
			);
		}
	}

	/*
	 * ============================================================
	 * Don't render when installed
	 * ============================================================
	 */

	if (isInstalled) {
		return null;
	}

	/*
	 * ============================================================
	 * Important:
	 *
	 * Do NOT render the native install button until
	 * Chrome actually gives us beforeinstallprompt.
	 * ============================================================
	 */

	if (!deferredPrompt) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={handleInstall}
			className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--sl-primary)] px-4 py-3 text-sm font-bold text-[var(--sl-primary-foreground)] transition-all hover:opacity-90 active:scale-[0.98]"
		>
			<Download className="size-4" />

			<span>
				Install Special Lazyness
			</span>
		</button>
	);
}