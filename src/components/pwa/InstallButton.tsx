"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

interface InstallButtonProps {
	className?: string;
	onManualTrigger?: () => void;
}

export default function InstallButton({
	className,
	onManualTrigger,
}: InstallButtonProps) {
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
	const [isInstalled, setIsInstalled] = useState<boolean>(false);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const isStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			(window.navigator as any).standalone ||
			document.referrer.includes("android-app://");

		if (isStandalone) {
			setIsInstalled(true);
			return;
		}

		if ((window as any).deferredPrompt) {
			setDeferredPrompt((window as any).deferredPrompt);
		}

		const handlePwaReady = () => {
			setDeferredPrompt((window as any).deferredPrompt);
		};

		window.addEventListener("pwa-installable", handlePwaReady);

		const handleAppInstalled = () => {
			console.log("[PWA] Aplikasi sukses terinstal oleh pengguna!");
			setIsInstalled(true);
		};

		window.addEventListener("appinstalled", handleAppInstalled);

		return () => {
			window.removeEventListener("pwa-installable", handlePwaReady);
			window.removeEventListener("appinstalled", handleAppInstalled);
		};
	}, []);

	const handleInstallClick = async () => {
		console.log("[PWA] Tombol install diklik");

		if (!deferredPrompt) {
			console.log("[PWA] Prompt sistem tidak siap. Memicu panduan manual.");
			if (typeof onManualTrigger === "function") {
				onManualTrigger();
			}
			return;
		}

		try {
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			console.log(`[PWA] Respons pengguna terhadap dialog: ${outcome}`);

			if (outcome === "accepted") {
				// Pengguna setuju menginstal, langsung sembunyikan tombol
				setIsInstalled(true);
				(window as any).deferredPrompt = null;
				setDeferredPrompt(null);
			}
		} catch (error) {
			console.error("[PWA] Gagal memicu dialog asli Chrome:", error);
			if (typeof onManualTrigger === "function") onManualTrigger();
		}
	};

	if (isInstalled) {
		return null;
	}

	return (
		<button
			type="button"
			onClick={handleInstallClick}
			className={`flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--sl-border)] bg-[var(--sl-surface-elevated)] px-4 py-3 text-sm font-bold text-[var(--sl-text)] transition-all hover:opacity-90 active:scale-[0.98] ${className || ""}`}
		>
			<Download className="size-4 shrink-0" />
			<span>Install App</span>
		</button>
	);
}
