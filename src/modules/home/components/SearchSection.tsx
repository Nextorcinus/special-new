"use client";

import {
	Calculator,
	Clock3,
	Search,
	X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { NAVIGATION } from "@/config/navigation";

import { useHistoryStore } from "@/features/inventory/store/history/history.store";

import type {
	CalculationHistoryItem,
} from "@/features/inventory/store/history/types";

import { getHistoryRoute } from "@/features/inventory/store/history/getHistoryRoute";

type CalculatorSearchResult = {
	type: "calculator";
	id: string;
	title: string;
	subtitle?: string;
	href: string;
	icon?: string;
};

type HistorySearchResult = {
	type: "history";
	id: string;
	title: string;
	subtitle?: string;
	history: CalculationHistoryItem;
};

export default function SearchSection() {
	const router = useRouter();
	const pathname = usePathname();

	const containerRef =
		useRef<HTMLDivElement>(null);

	const [query, setQuery] = useState("");
	const [isFocused, setIsFocused] =
		useState(false);

	/*
	 * ============================
	 * History Store
	 * ============================
	 */

	const items = useHistoryStore(
		(state) => state.items,
	);

	const loadHistory = useHistoryStore(
		(state) => state.loadHistory,
	);

	useEffect(() => {
		loadHistory();
	}, [loadHistory]);

	/*
	 * ============================
	 * Query
	 * ============================
	 */

	const normalizedQuery = useMemo(() => {
		return query.trim().toLowerCase();
	}, [query]);

	/*
	 * ============================
	 * Calculator Results
	 * ============================
	 */

	const calculatorResults =
		useMemo<CalculatorSearchResult[]>(() => {
			if (!normalizedQuery) {
				return [];
			}

			return NAVIGATION
				.filter((item) => {
					const title =
						item.title?.toLowerCase() ??
						"";

					const subtitle =
						"subtitle" in item &&
						typeof item.subtitle ===
							"string"
							? item.subtitle.toLowerCase()
							: "";

					return (
						title.includes(
							normalizedQuery,
						) ||
						subtitle.includes(
							normalizedQuery,
						)
					);
				})
				.map((item) => ({
					type: "calculator",
					id: item.id,
					title: item.title,
					href: item.href,
					icon: item.icon,
				}));
		}, [normalizedQuery]);

	/*
	 * ============================
	 * History Results
	 * ============================
	 *
	 * Simpan history object lengkap.
	 *
	 * Ini penting karena getHistoryRoute()
	 * membutuhkan category / form / result
	 * untuk menentukan route.
	 */

	const historyResults =
		useMemo<HistorySearchResult[]>(() => {
			if (!normalizedQuery) {
				return [];
			}

			return items
				.filter((item) => {
					const title =
						item.title?.toLowerCase() ??
						"";

					const subtitle =
						item.subtitle?.toLowerCase() ??
						"";

					const category =
						typeof item.category ===
						"string"
							? item.category.toLowerCase()
							: "";

					return (
						title.includes(
							normalizedQuery,
						) ||
						subtitle.includes(
							normalizedQuery,
						) ||
						category.includes(
							normalizedQuery,
						)
					);
				})
				.slice(0, 8)
				.map((item) => ({
					type: "history",
					id: item.id,
					title: item.title,
					subtitle: item.subtitle,
					history: item,
				}));
		}, [items, normalizedQuery]);

	const hasResults =
		calculatorResults.length > 0 ||
		historyResults.length > 0;

	/*
	 * ============================
	 * Calculator Click
	 * ============================
	 */

	function handleCalculatorClick(
		href: string,
	) {
		setQuery("");
		setIsFocused(false);

		router.push(href);
	}

	/*
	 * ============================
	 * History Click
	 * ============================
	 */

	function handleHistoryClick(
		result: HistorySearchResult,
	) {
		const route = getHistoryRoute(
			result.history,
		);

		if (!route) {
			return;
		}

		setQuery("");
		setIsFocused(false);

		router.push(route);
	}

	/*
	 * ============================
	 * Clear
	 * ============================
	 */

	function handleClear() {
		setQuery("");
	}

	/*
	 * ============================
	 * Outside Click
	 * ============================
	 */

	useEffect(() => {
		function handleOutsideClick(
			event: MouseEvent,
		) {
			if (
				containerRef.current &&
				!containerRef.current.contains(
					event.target as Node,
				)
			) {
				setIsFocused(false);
			}
		}

		document.addEventListener(
			"mousedown",
			handleOutsideClick,
		);

		return () => {
			document.removeEventListener(
				"mousedown",
				handleOutsideClick,
			);
		};
	}, []);

	/*
	 * ============================
	 * Render
	 * ============================
	 */

	return (
		<section
			ref={containerRef}
			className="relative"
		>
			{/* Search Input */}
			<div
				className={[
					"flex h-14 items-center gap-3 rounded-4xl border px-4",
					"bg-[var(--input)]",
					"border-[var(--sl-border)]",
					"transition-colors",
					isFocused
						? "border-[var(--sl-primary)]/60"
						: "",
				].join(" ")}
			>
				<Search
					size={20}
					className="shrink-0 text-[var(--sl-text-muted)]"
				/>

				<input
					type="text"
					value={query}
					onChange={(event) =>
						setQuery(
							event.target.value,
						)
					}
					onFocus={() =>
						setIsFocused(true)
					}
					placeholder="Search calculator, history..."
					className="w-full bg-transparent text-sm text-[var(--sl-text)] outline-none placeholder:text-[var(--sl-text-muted)]"
				/>

				{query && (
					<button
						type="button"
						onClick={handleClear}
						className="flex size-7 shrink-0 items-center justify-center rounded-full text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]"
						aria-label="Clear search"
					>
						<X className="size-4" />
					</button>
				)}
			</div>

			{/* Search Results */}
			{isFocused &&
				normalizedQuery && (
					<div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] shadow-2xl">
						{hasResults ? (
							<div className="max-h-[420px] overflow-y-auto p-2">
								{/* ============================
								     Calculators
								     ============================ */}

								{calculatorResults.length >
									0 && (
									<div>
										<div className="px-3 py-2">
											<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-text-muted)]">
												Calculators
											</p>
										</div>

										<div className="space-y-1">
											{calculatorResults.map(
												(
													result,
												) => (
													<button
														key={`calculator-${result.id}`}
														type="button"
														onClick={() =>
															handleCalculatorClick(
																result.href,
															)
														}
														className={[
															"flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left",
															"transition-colors",
															"hover:bg-[var(--sl-hover)]",
															pathname ===
																result.href
																? "bg-[var(--sl-active)]"
																: "",
														].join(
															" ",
														)}
													>
														<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-input)]">
															<Calculator className="size-4 text-[var(--sl-text)]" />
														</div>

														<div className="min-w-0 flex-1">
															<p className="truncate text-sm font-semibold text-[var(--sl-text)]">
																{
																	result.title
																}
															</p>

															<p className="mt-0.5 truncate text-[11px] text-[var(--sl-text-muted)]">
																{
																	result.href
																}
															</p>
														</div>
													</button>
												),
											)}
										</div>
									</div>
								)}

								{/* Divider */}

								{calculatorResults.length >
									0 &&
									historyResults.length >
										0 && (
										<div className="my-2 border-t border-[var(--sl-border)]" />
									)}

								{/* ============================
								     History
								     ============================ */}

								{historyResults.length >
									0 && (
									<div>
										<div className="px-3 py-2">
											<p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-text-muted)]">
												History
											</p>
										</div>

										<div className="space-y-1">
											{historyResults.map(
												(
													result,
												) => (
													<button
														key={`history-${result.id}`}
														type="button"
														onClick={() =>
															handleHistoryClick(
																result,
															)
														}
														className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-[var(--sl-hover)]"
													>
														<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--sl-input)]">
															<Clock3 className="size-4 text-[var(--sl-text)]" />
														</div>

														<div className="min-w-0 flex-1">
															<p className="truncate text-sm font-semibold text-[var(--sl-text)]">
																{
																	result.title
																}
															</p>

															{result.subtitle && (
																<p className="mt-0.5 truncate text-[11px] text-[var(--sl-text-muted)]">
																	{
																		result.subtitle
																	}
																</p>
															)}
														</div>
													</button>
												),
											)}
										</div>
									</div>
								)}
							</div>
						) : (
							<div className="px-4 py-8 text-center">
								<Search className="mx-auto size-7 text-[var(--sl-text-muted)]" />

								<p className="mt-3 text-sm font-semibold text-[var(--sl-text)]">
									No results found
								</p>

								<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
									Try searching for a calculator
									or saved history.
								</p>
							</div>
						)}
					</div>
				)}
		</section>
	);
}