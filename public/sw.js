const CACHE_NAME = "special-lazyness-v3";

/*
 * ============================================================
 * Install
 * ============================================================
 */

self.addEventListener("install", (event) => {
	event.waitUntil(
		self.skipWaiting(),
	);
});

/*
 * ============================================================
 * Activate
 * ============================================================
 */

self.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			await self.clients.claim();

			/*
			 * Remove old Special Lazyness caches.
			 */

			const cacheNames =
				await caches.keys();

			await Promise.all(
				cacheNames
					.filter(
						(name) =>
							name !== CACHE_NAME,
					)
					.map((name) =>
						caches.delete(name),
					),
			);
		})(),
	);
});

/*
 * ============================================================
 * Fetch
 * ============================================================
 *
 * Keep a real fetch handler so the Service Worker participates
 * in navigation/request handling.
 *
 * We intentionally do NOT cache requests here.
 * Next.js remains responsible for serving the latest content.
 */

self.addEventListener("fetch", (event) => {
	const request = event.request;

	/*
	 * Only handle GET requests.
	 */

	if (request.method !== "GET") {
		return;
	}

	/*
	 * Only handle requests belonging to this origin.
	 */

	const url = new URL(
		request.url,
		self.location.origin,
	);

	if (
		url.origin !==
		self.location.origin
	) {
		return;
	}

	event.respondWith(
		(async () => {
			try {
				return await fetch(
					request,
				);
			} catch (error) {
				/*
				 * If network fails, try the cache.
				 *
				 * At the moment we don't actively
				 * cache requests, but keeping this
				 * fallback makes the worker safe if
				 * caching is added later.
				 */

				const cached =
					await caches.match(
						request,
					);

				if (cached) {
					return cached;
				}

				throw error;
			}
		})(),
	);
});