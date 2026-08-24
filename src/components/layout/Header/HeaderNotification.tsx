"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { NOTIFICATIONS } from "@/config/notifications";

const READ_STORAGE_KEY = "special-lazyness-notifications-read";

export default function HeaderNotification() {
	const [open, setOpen] = useState(false);
	const [readIds, setReadIds] = useState<string[]>([]);

	const notificationRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		try {
			const stored = localStorage.getItem(READ_STORAGE_KEY);

			if (stored) {
				setReadIds(JSON.parse(stored));
			}
		} catch {
			setReadIds([]);
		}
	}, []);

	useEffect(() => {
		if (!open) {
			return;
		}

		function handleClickOutside(event: MouseEvent) {
			if (
				notificationRef.current &&
				!notificationRef.current.contains(event.target as Node)
			) {
				setOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open]);

	const unreadCount = NOTIFICATIONS.filter(
		(notification) => !readIds.includes(notification.id),
	).length;

	function markAsRead(id: string) {
		setReadIds((current) => {
			if (current.includes(id)) {
				return current;
			}

			const updated = [...current, id];

			localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(updated));

			return updated;
		});
	}

	function markAllAsRead() {
		const ids = NOTIFICATIONS.map((notification) => notification.id);

		setReadIds(ids);

		localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids));
	}

	return (
		<div ref={notificationRef} className="relative">
			<button
				type="button"
				aria-label="Notifications"
				aria-expanded={open}
				onClick={() => setOpen((current) => !current)}
				className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sl-surface-2)] transition-colors hover:bg-[var(--sl-surface-hover)] active:bg-[var(--ring)]"
			>
				<Image
					src="/icons/notification.png"
					alt="Notification"
					width={22}
					height={22}
				/>

				{unreadCount > 0 && (
					<span className="absolute right-1.5 top-1.5 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div className="absolute right-0 top-14 z-50 w-[340px] overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] shadow-2xl">
					<div className="flex items-center justify-between border-b border-[var(--sl-border)] px-4 py-3">
						<div>
							<h3 className="text-sm font-semibold text-[var(--sl-text)]">
								Notifications
							</h3>

							{unreadCount > 0 && (
								<p className="mt-0.5 text-xs text-[var(--sl-text-muted)]">
									{unreadCount} unread
								</p>
							)}
						</div>

						{unreadCount > 0 && (
							<button
								type="button"
								onClick={markAllAsRead}
								className="text-xs font-medium text-[var(--sl-primary)] transition-opacity hover:opacity-80"
							>
								Mark all as read
							</button>
						)}
					</div>

					<div className="max-h-[420px] overflow-y-auto">
						{NOTIFICATIONS.length === 0 ? (
							<div className="px-4 py-10 text-center">
								<p className="text-sm text-[var(--sl-text-muted)]">
									No notifications
								</p>
							</div>
						) : (
							NOTIFICATIONS.map((notification) => {
								const isRead = readIds.includes(notification.id);

								return (
									<button
										key={notification.id}
										type="button"
										onClick={() => markAsRead(notification.id)}
										className={`w-full border-b border-[var(--sl-border)] px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-[var(--sl-surface-2)] ${
											!isRead ? "bg-[var(--sl-surface-2)]" : ""
										}`}
									>
										<div className="flex gap-3">
											<div className="pt-1.5">
												<span
													className={`block h-2 w-2 rounded-full ${
														isRead ? "bg-transparent" : "bg-[var(--sl-primary)]"
													}`}
												/>
											</div>

											<div className="min-w-0 flex-1">
												<div className="flex items-start justify-between gap-2">
													<h4
														className={`text-sm ${
															isRead
																? "font-medium text-[var(--sl-text-muted)]"
																: "font-semibold text-[var(--sl-text)]"
														}`}
													>
														{notification.title}
													</h4>

													<span className="shrink-0 text-[10px] uppercase text-[var(--sl-text-muted)]">
														{notification.type}
													</span>
												</div>

												<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
													{notification.message}
												</p>

												<p className="mt-2 text-[10px] text-[var(--sl-text-muted)]">
													{new Date(notification.createdAt).toLocaleDateString(
														"en-US",
														{
															day: "numeric",
															month: "short",
															year: "numeric",
														},
													)}
												</p>
											</div>
										</div>
									</button>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
}
