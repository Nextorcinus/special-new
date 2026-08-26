"use client";

import { useEffect } from "react";

export default function PWARegister() {
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

				/*
				 * Check for updates.
				 */

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

	return null;
}