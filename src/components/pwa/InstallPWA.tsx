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

	const [showGuide, setShowGuide] =
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
		 * Android / Chrome / Edge install prompt
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

		/*
		 * ============================================================
		 * Detect when PWA gets installed
		 * ============================================================
		 */

		function handleAppInstalled() {
			setIsInstalled(true);
			setInstallPrompt(null);
			setShowGuide(false);
		}

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
	 * ================================================================
	 * Install using native browser prompt
	 * ================================================================
	 */

	async function handleInstall() {
		if (!installPrompt) {
			setShowGuide(true);
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
	 * Already installed
	 * ================================================================
	 */

	if (isInstalled) {
		return null;
	}

	return (
		<>
			{/* Install / Save button */}

			<button
				type="button"
				onClick={handleInstall}
				className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--sl-primary)] px-4 py-3 text-sm font-bold text-[var(--sl-primary-foreground)] transition-all hover:opacity-90 active:scale-[0.98]"
			>
				<Download className="size-4" />

				<span>
					Save to Home Screen
				</span>
			</button>

			{/* ========================================================
			    Installation Guide
			    ======================================================== */}

			{showGuide && (
				<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
					{/* Backdrop */}

					<button
						type="button"
						aria-label="Close"
						onClick={() =>
							setShowGuide(false)
						}
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
					/>

					{/* Modal */}

					<div className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5 shadow-2xl">
						{/* Header */}

						<div className="flex items-start justify-between gap-4">
							<div>
								<h2 className="text-base font-semibold text-[var(--sl-text)]">
									Save Special Lazyness
								</h2>

								<p className="mt-1 text-xs leading-relaxed text-[var(--sl-text-muted)]">
									Add Special Lazyness
									to your Home Screen
									for quick access.
								</p>
							</div>

							<button
								type="button"
								onClick={() =>
									setShowGuide(
										false,
									)
								}
								aria-label="Close"
								className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[var(--sl-text-muted)] transition-colors hover:bg-white/10 hover:text-[var(--sl-text)]"
							>
								<X className="size-4" />
							</button>
						</div>

						{/* Steps */}

						<div className="mt-5 space-y-4">
							{/* iOS */}

							{isIOS ? (
								<>
									<div className="flex items-start gap-3">
										<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-primary)]/10 text-sm font-bold text-[var(--sl-primary)]">
											1
										</div>

										<p className="text-sm leading-relaxed text-[var(--sl-text-secondary)]">
											Tap the{" "}
											<Share className="mx-1 inline size-4 align-text-bottom" />{" "}
											Share button
											in Safari.
										</p>
									</div>

									<div className="flex items-start gap-3">
										<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-primary)]/10 text-sm font-bold text-[var(--sl-primary)]">
											2
										</div>

										<p className="text-sm leading-relaxed text-[var(--sl-text-secondary)]">
											Select{" "}
											<span className="font-semibold text-[var(--sl-text)]">
												Add to Home
												Screen
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
								</>
							) : (
								<>
									<div className="flex items-start gap-3">
										<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-primary)]/10 text-sm font-bold text-[var(--sl-primary)]">
											1
										</div>

										<p className="text-sm leading-relaxed text-[var(--sl-text-secondary)]">
											Open your
											browser menu
											using the{" "}
											<span className="font-semibold text-[var(--sl-text)]">
												⋮
											</span>{" "}
											button.
										</p>
									</div>

									<div className="flex items-start gap-3">
										<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-primary)]/10 text-sm font-bold text-[var(--sl-primary)]">
											2
										</div>

										<p className="text-sm leading-relaxed text-[var(--sl-text-secondary)]">
											Select{" "}
											<span className="font-semibold text-[var(--sl-text)]">
												Add to Home
												Screen
											</span>{" "}
											or{" "}
											<span className="font-semibold text-[var(--sl-text)]">
												Install App
											</span>
											.
										</p>
									</div>

									<div className="flex items-start gap-3">
										<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-primary)]/10 text-sm font-bold text-[var(--sl-primary)]">
											3
										</div>

										<p className="text-sm leading-relaxed text-[var(--sl-text-secondary)]">
											Confirm the
											installation.
										</p>
									</div>
								</>
							)}
						</div>

						{/* Close */}

						<button
							type="button"
							onClick={() =>
								setShowGuide(
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