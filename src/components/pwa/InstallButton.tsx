// src/components/pwa/InstallButton.tsx
"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

interface InstallButtonProps {
	className?: string;
	onManualTrigger?: () => void; // Tambahkan tanda tanya (?) agar tidak wajib diisi
}

export default function InstallButton({ className, onManualTrigger }: InstallButtonProps) {
	const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

	useEffect(() => {
		if (typeof window !== "undefined" && (window as any).deferredPrompt) {
			setDeferredPrompt((window as any).deferredPrompt);
		}

		const handlePwaReady = () => {
			setDeferredPrompt((window as any).deferredPrompt);
		};

		window.addEventListener("pwa-installable", handlePwaReady);
		return () => window.removeEventListener("pwa-installable", handlePwaReady);
	}, []);

	const handleInstallClick = async () => {
		console.log("[PWA] Tombol install diklik");

		if (!deferredPrompt) {
			console.log("[PWA] Prompt sistem tidak siap. Memicu panduan manual.");
			
			// Tambahkan pengecekan aman (safe check) sebelum mengeksekusi fungsi
			if (typeof onManualTrigger === "function") {
				onManualTrigger();
			} else {
				console.warn("[PWA] Properti onManualTrigger tidak dilewatkan dari komponen induk.");
			}
			return;
		}

		try {
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			console.log(`[PWA] Respons pengguna terhadap dialog: ${outcome}`);
		} catch (error) {
			console.error("[PWA] Gagal memicu dialog asli Chrome:", error);
			if (typeof onManualTrigger === "function") onManualTrigger();
		}

		(window as any).deferredPrompt = null;
		setDeferredPrompt(null);
	};

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