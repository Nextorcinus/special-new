"use client";

import {
	ChevronDown,
	ChevronRight,
	MessageCircle,
	X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import HeaderAvatar from "@/components/layout/Header/HeaderAvatar";
import HeaderThemeToggle from "@/components/layout/Header/HeaderThemeToggle";
import PlayerCard from "@/components/layout/PlayerCard";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { NAVIGATION } from "@/config/navigation";

type MobileMenuDrawerProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

type NavigationGroupId =
	| "chief"
	| "heroes"
	| "development";

type NavigationGroup = {
	id: NavigationGroupId;
	title: string;
};

const GROUPS: NavigationGroup[] = [
	{
		id: "chief",
		title: "Chief",
	},
	{
		id: "heroes",
		title: "Heroes",
	},
	{
		id: "development",
		title: "Development",
	},
];

const ADDITIONAL_ITEMS = [
	"troops",
	"war-academy",
	"widget",
	"state",
];

function isPathActive(
	pathname: string,
	href: string,
) {
	return (
		pathname === href ||
		pathname.startsWith(`${href}/`)
	);
}

function getGroupItems(
	group: NavigationGroupId,
) {
	return NAVIGATION.filter(
		(item) => item.group === group,
	);
}

function groupHasActiveItem(
	pathname: string,
	group: NavigationGroupId,
) {
	return getGroupItems(group).some((item) =>
		isPathActive(pathname, item.href),
	);
}

export default function MobileMenuDrawer({
	open,
	onOpenChange,
}: MobileMenuDrawerProps) {
	const router = useRouter();
	const pathname = usePathname();

	const [openGroups, setOpenGroups] = useState<
		Record<NavigationGroupId, boolean>
	>({
		chief: true,
		heroes: false,
		development: false,
	});

	useEffect(() => {
		if (!open) {
			return;
		}

		const activeGroup = GROUPS.find((group) =>
			groupHasActiveItem(
				pathname,
				group.id,
			),
		);

		setOpenGroups({
			chief: activeGroup?.id === "chief",
			heroes: activeGroup?.id === "heroes",
			development:
				activeGroup?.id === "development",
		});
	}, [open, pathname]);

	function goTo(path: string) {
		onOpenChange(false);
		router.push(path);
	}

	function toggleGroup(
		group: NavigationGroupId,
	) {
		setOpenGroups((current) => {
			const isCurrentlyOpen =
				current[group];

			if (isCurrentlyOpen) {
				return {
					chief: false,
					heroes: false,
					development: false,
				};
			}

			return {
				chief: group === "chief",
				heroes: group === "heroes",
				development:
					group === "development",
			};
		});
	}

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
		>
		<SheetContent
	side="left"
	showCloseButton={false}
	className="flex w-[min(360px,88vw)] flex-col border-[var(--sl-border)] bg-[var(--sl-surface)] p-0 text-[var(--sl-text)]"
>
				{/* Header */}
				<SheetHeader className="shrink-0 border-b border-[var(--sl-border)] px-4 py-3">
					<SheetTitle asChild>
						<div className="flex items-center justify-between">
							{/* Avatar */}
							<div className="flex min-w-0 items-center">
								<HeaderAvatar />
							</div>

							{/* Header Actions */}
							<div className="flex items-center gap-6">
								{/* Theme Toggle */}
								<div className="flex size-9 items-center justify-center">
									<HeaderThemeToggle />
								</div>

								{/* Close */}
								<SheetClose asChild>
	<button
		type="button"
		aria-label="Close menu"
		className="flex size-9 items-center justify-center rounded-full border border-[var(--sl-border)] bg-[var(--sl-input)] text-[var(--sl-text-muted)] transition-colors hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)] active:scale-95"
	>
		<X className="size-4" />
	</button>
</SheetClose>
							</div>
						</div>
					</SheetTitle>
				</SheetHeader>

				{/* Navigation */}
				<div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
					<div className="space-y-2">
						{GROUPS.map((group) => {
							const items =
								getGroupItems(
									group.id,
								);

							const isOpen =
								openGroups[
									group.id
								];

							const hasActive =
								groupHasActiveItem(
									pathname,
									group.id,
								);

							return (
								<div
									key={
										group.id
									}
									className="space-y-1"
								>
									<button
										type="button"
										onClick={() =>
											toggleGroup(
												group.id,
											)}
										aria-expanded={
											isOpen
										}
										className={[
											"flex w-full items-center justify-between rounded-2xl border px-4 py-3",
											"transition-colors",
											hasActive
												? "border-[var(--sl-primary)]/40 bg-[var(--sl-active)] text-[var(--sl-text)]"
												: "border-[var(--sl-border)] bg-[var(--sl-surface)] text-[var(--sl-text)]",
											"hover:bg-[var(--sl-hover)]",
										].join(
											" ",
										)}
									>
										<span className="text-sm font-bold">
											{
												group.title
											}
										</span>

										{isOpen ? (
											<ChevronDown className="size-4 shrink-0" />
										) : (
											<ChevronRight className="size-4 shrink-0" />
										)}
									</button>

									{isOpen &&
										items.length >
											0 && (
											<div className="space-y-1 pl-2">
												{items.map(
													(
														item,
													) => {
														const active =
															isPathActive(
																pathname,
																item.href,
															);

														return (
															<button
																key={
																	item.id
																}
																type="button"
																onClick={() =>
																	goTo(
																		item.href,
																	)
																}
																className={[
																	"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
																	"transition-colors",
																	active
																		? "bg-[var(--sl-primary)] text-[var(--sl-primary-foreground)]"
																		: "text-[var(--sl-text-muted)] hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]",
																].join(
																	" ",
																)}
															>
																<span className="relative flex size-7 shrink-0 items-center justify-center">
																	<Image
																		src={
																			item.icon
																		}
																		alt=""
																		fill
																		sizes="28px"
																		className="object-contain"
																	/>
																</span>

																<span className="min-w-0 flex-1 truncate text-sm font-medium">
																	{
																		item.title
																	}
																</span>

																{active && (
																	<span className="size-1.5 shrink-0 rounded-full bg-current" />
																)}
															</button>
														);
													},
												)}
											</div>
										)}
								</div>
							);
						})}
					</div>

					<div className="my-5 border-t border-[var(--sl-border)]" />

					{/* Additional Navigation */}
					<div className="space-y-1">
						{ADDITIONAL_ITEMS.map(
							(id) => {
								const item =
									NAVIGATION.find(
										(entry) =>
											entry.id ===
											id,
									);

								if (!item) {
									return null;
								}

								const active =
									isPathActive(
										pathname,
										item.href,
									);

								return (
									<button
										key={
											item.id
										}
										type="button"
										onClick={() =>
											goTo(
												item.href,
											)
										}
										className={[
											"flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
											"transition-colors",
											active
												? "bg-[var(--sl-primary)] text-[var(--sl-primary-foreground)]"
												: "text-[var(--sl-text-muted)] hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]",
										].join(
											" ",
										)}
									>
										<span className="relative flex size-7 shrink-0 items-center justify-center">
											<Image
												src={
													item.icon
												}
												alt=""
												fill
												sizes="28px"
												className="object-contain"
											/>
										</span>

										<span className="min-w-0 truncate text-sm font-medium">
											{
												item.title
											}
										</span>
									</button>
								);
							},
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="shrink-0 space-y-3 border-t border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
					{/* Discord */}
					<button
						type="button"
						onClick={() =>
							window.open(
								"https://discord.com/users/380668333948928000",
								"_blank",
								"noopener,noreferrer",
							)
						}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
					>
						<MessageCircle className="size-4" />

						<span>
							Chat Discord
						</span>
					</button>

					{/* Developer */}
					<div className="px-1">
						<p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sl-text-muted)]">
							Developer Lazyness
						</p>
					</div>

					{/* Player Card */}
					<div className="w-full">
						<PlayerCard />
					</div>

					{/* Copyright */}
					<div className="px-1 text-center">
						<p className="text-[9px] leading-4 text-[var(--sl-text-muted)]">
							© 2026 Special
							Lazyness. Not
							affiliated with
							Century Games or
							Whiteout Survival.
						</p>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}