import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Special Lazyness",
		short_name: "Special Lazyness",
		description:
			"Whiteout Survival companion for calculators, progression planning, resources, heroes, troops, and more.",
		start_url: "/",
		display: "standalone",
		background_color: "#111111",
		theme_color: "#111111",
		orientation: "portrait",
		scope: "/",

		icons: [
			{
				src: "/pwa/icon-192.png",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/pwa/icon-512.png",
				sizes: "512x512",
				type: "image/png",
			},
			{
				src: "/pwa/icon-maskable-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}