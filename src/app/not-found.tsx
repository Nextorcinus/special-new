import Link from "next/link";
import {
	ArrowLeft,
	Home,
	SearchX,
} from "lucide-react";

export default function NotFound() {
	return (
		<main className="flex min-h-screen items-center justify-center bg-[var(--sl-background)] px-6 py-12 text-[var(--sl-text)]">
			<div className="w-full max-w-xl text-center">
				{/* Icon */}
				<div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-3xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
					<SearchX className="size-9 text-[var(--sl-text-muted)]" />
				</div>

				{/* 404 */}
				<p className="text-8xl font-black tracking-tight text-[var(--primary)] sm:text-9xl">
					404
				</p>

				{/* Title */}
				<h1 className="mt-4 text-2xl font-bold sm:text-3xl">
					Oops! Page not found
				</h1>

				{/* Description */}
				<p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--sl-text-muted)]">
					The page you're looking for doesn't
					exist or may have been moved.
				</p>

				{/* Actions */}
				<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
					<Link
						href="/"
						className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-6 text-sm font-bold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--sl-hover)]"
					>
						<Home className="size-4" />

						<span>Back Home</span>
					</Link>

					<Link
						href="/"
						className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--sl-input)] px-6 text-sm font-bold text-[var(--sl-text)] transition-colors hover:bg-[var(--sl-input-hover)]"
					>
						<ArrowLeft className="size-4" />

						<span>Go Back</span>
					</Link>
				</div>

				{/* Copyright */}
				<p className="mt-10 text-[10px] text-[var(--sl-text-muted)]">
					© 2026 Special Lazyness
				</p>
			</div>
		</main>
	);
}