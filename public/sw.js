const CACHE_NAME = "special-lazyness-v2";

self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		self.clients.claim(),
	);
});

/*
 * ============================================================
 * Fetch handler
 * ============================================================
 *
 * Chrome menggunakan keberadaan fetch handler sebagai salah
 * satu sinyal untuk menentukan apakah beforeinstallprompt
 * dapat diberikan.
 *
 * Untuk sekarang kita tidak melakukan caching.
 * Semua request tetap diteruskan langsung ke network.
 */

self.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") {
		return;
	}

	event.respondWith(
		fetch(event.request),
	);
});