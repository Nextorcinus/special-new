"use client";

import {
	Download,
	Share,
	X,
} from "lucide-react";
import {
	useEffect,
	useState,
} from "react";

type BeforeInstallPromptEvent =
	Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{
			outcome:
				| "accepted"
				| "dismissed";
			platform: string;
		}>;
	};

export default function InstallPWA() {
	const [
		installPrompt,
		setInstallPrompt,
	] = useState<BeforeInstallPromptEvent | null>(
		null,
	);

	const [isInstalled, setIsInstalled] =
		useState(false);

	const [isIOS, setIsIOS] =
		useState(false);

	const [showIOSGuide, setShowIOSGuide] =
		useState(false);

	useEffect(() => {
		/*
		 * ============================================================
		 * Detect installed PWA
		 * ============================================================
		 */

		const standalone =
			window.matchMedia(
				"(display-mode: standalone)",
			).matches;

		const iosStandalone =
			"standalone" in window.navigator &&
			Boolean(
				(
					window.navigator as Navigator & {
						standalone?: boolean;
					}
				).standalone,
			);

		if (
			standalone ||
			iosStandalone
		) {
			setIsInstalled(true);
		}

		/*
		 * ============================================================
		 * Detect iOS
		 * ============================================================
		 */

		const userAgent =
			window.navigator.userAgent;

		const iOS =
			/iPad|iPhone|iPod/.test(
				userAgent,
			) ||
			(
				window.navigator.platform ===
					"MacIntel" &&
				window.navigator.maxTouchPoints >
					1
			);

		setIsIOS(iOS);

		/*
		 * ============================================================
		 * Android / Chrome install prompt
		 * ============================================================
		 */

		function handleBeforeInstallPrompt(
			event: Event,
		) {
			event.preventDefault();

			setInstallPrompt(
				event as BeforeInstallPromptEvent,
			);
		}

		window.addEventListener(
			"beforeinstallprompt",
			handleBeforeInstallPrompt,
		);

		return () => {
			window.removeEventListener(
				"beforeinstallprompt",
				handleBeforeInstallPrompt,
			);
		};
	}, []);

	/*
	 * ================================================================
	 * Android / supported browser
	 * ================================================================
	 */

	async function handleInstall() {
		if (!installPrompt) {
			return;
		}

		await installPrompt.prompt();

		const result =
			await installPrompt.userChoice;

		if (
			result.outcome === "accepted"
		) {
			setInstallPrompt(null);
		}
	}

	/*
	 * ================================================================
	 * Don't render when already installed
	 * ================================================================
	 */

	if (isInstalled) {
		return null;
	}

	/*
	 * ================================================================
	 * iOS
	 * ================================================================
	 */

	if (isIOS) {
		return (
			<>
				<button
					type="button"
					onClick={() =>
						setShowIOSGuide(
							true,
						)
					}
					className="flex items-center gap-2 rounded-xl bg-[var(--sl-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--sl-primary-foreground)] transition-all hover:opacity-90 active:scale-[0.98]"
				>
					<Download className="size-4" />

					<span>
						Add to Home Screen
					</span>
				</button>

				{showIOSGuide && (
					<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
						<button
							type="button"
							aria-label="Close"
							onClick={() =>
								setShowIOSGuide(
									false,
								)
							}
							className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						/>

						<div className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5 shadow-2xl">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h2 className="text-base font-semibold text-[var(--sl-text)]">
										Add Special Lazyness
									</h2>

									<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
										Add this website to your
										Home Screen for quick
										access.
									</p>
								</div>

								<button
									type="button"
									onClick={() =>
										setShowIOSGuide(
											false,
										)
									}
									className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--sl-text-muted)] transition-colors hover:bg-white/10"
								>
									<X className="size-4" />
								</button>
							</div>

							<div className="mt-5 space-y-4">
								<div className="flex items-start gap-3">
									<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-primary)]/10 text-sm font-bold text-[var(--sl-primary)]">
										1
									</div>

									<p className="text-sm leading-relaxed text-[var(--sl-text-secondary)]">
										Tap the{" "}
										<Share className="mx-1 inline size-4 align-text-bottom" />{" "}
										Share button in
										Safari.
									</p>
								</div>

								<div className="flex items-start gap-3">
									<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-primary)]/10 text-sm font-bold text-[var(--sl-primary)]">
										2
									</div>

									<p className="text-sm leading-relaxed text-[var(--sl-text-secondary)]">
										Scroll down and
										select{" "}
										<span className="font-semibold text-[var(--sl-text)]">
											Add to Home Screen
										</span>
										.
									</p>
								</div>

								<div className="flex items-start gap-3">
									<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-primary)]/10 text-sm font-bold text-[var(--sl-primary)]">
										3
									</div>

									<p className="text-sm leading-relaxed text-[var(--sl-text-secondary)]">
										Tap{" "}
										<span className="font-semibold text-[var(--sl-text)]">
											Add
										</span>{" "}
										to finish.
									</p>
								</div>
							</div>

							<button
								type="button"
								onClick={() =>
									setShowIOSGuide(
										false,
									)
								}
								className="mt-6 h-11 w-full rounded-xl bg-[var(--sl-primary)] text-sm font-semibold text-[var(--sl-primary-foreground)] transition-opacity hover:opacity-90"
							>
								Got it
							</button>
						</div>
					</div>
				)}
			</>
		);
	}

	/*
	 * ================================================================
	 * Android / Chrome
	 * ================================================================
	 */

	if (!installPrompt) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={handleInstall}
			className="flex items-center gap-2 rounded-xl bg-[var(--sl-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--sl-primary-foreground)] transition-all hover:opacity-90 active:scale-[0.98]"
		>
			<Download className="size-4" />

			<span>
				Install Special Lazyness
			</span>
		</button>
	);
}