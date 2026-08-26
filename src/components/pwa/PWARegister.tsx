"use client";

import { useEffect } from "react";

export default function PWARegister() {
	// 1. useEffect Pertama: Registrasi Service Worker (Kode asli Anda)
	useEffect(() => {
		if (
			typeof window === "undefined" ||
			!("serviceWorker" in navigator)
		) {
			console.log(
				"[PWA] Service Worker is not supported.",
			);
			return;
		}

		let cancelled = false;

		async function register() {
			try {
				console.log(
					"[PWA] Registering Service Worker...",
				);

				const registration =
					await navigator.serviceWorker.register(
						"/sw.js",
						{
							scope: "/",
						},
					);

				if (cancelled) {
					return;
				}

				console.log(
					"[PWA] Service Worker registered:",
					registration.scope,
				);

				try {
					await registration.update();
					console.log(
						"[PWA] Service Worker update checked.",
					);
				} catch {
					console.log(
						"[PWA] Service Worker update check skipped.",
					);
				}
			} catch (error) {
				if (cancelled) {
					return;
				}

				console.error(
					"[PWA] Service Worker registration failed:",
					error,
				);
			}
		}

		register();

		return () => {
			cancelled = true;
		};
	}, []);

	// 2. useEffect Kedua: WAJIB UNTUK MENANGKAP BEFOREINSTALLPROMPT
	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleBeforeInstallPrompt = (e: Event) => {
			// Mencegah Chrome memunculkan mini-infobar bawaan otomatis
			e.preventDefault();
			
			console.log("[PWA] Event beforeinstallprompt BERHASIL ditangkap! 🎉");

			// Simpan event ke objek global window agar bisa dipanggil oleh tombol UI mana saja
			(window as any).deferredPrompt = e;

			// Opsional: Kirim custom event ke window agar UI tahu tombol install sudah bisa dimunculkan
			window.dispatchEvent(new CustomEvent("pwa-installable"));
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		};
	}, []);

	return null;
}