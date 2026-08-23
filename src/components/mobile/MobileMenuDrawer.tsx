"use client";

import {
	ChevronDown,
	ChevronRight,
	MessageCircle,
	Pin,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { NAVIGATION } from "@/config/navigation";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import PlayerCard from "@/components/layout/PlayerCard";

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
): boolean {
	return (
		pathname === href ||
		pathname.startsWith(`${href}/`)
	);
}

function getGroupItems(group: NavigationGroupId) {
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

		setOpenGroups({
			chief: groupHasActiveItem(pathname, "chief"),
			heroes: groupHasActiveItem(
				pathname,
				"heroes",
			),
			development: groupHasActiveItem(
				pathname,
				"development",
			),
		});
	}, [open, pathname]);

	function goTo(path: string) {
		onOpenChange(false);
		router.push(path);
	}

	function toggleGroup(group: NavigationGroupId) {
		setOpenGroups((current) => ({
			...current,
			[group]: !current[group],
		}));
	}

	return (
		<Sheet
			open={open}
			onOpenChange={onOpenChange}
		>
			<SheetContent
				side="left"
				className="flex w-[min(360px,88vw)] flex-col border-[var(--sl-border)] bg-[var(--sl-surface)] p-0 text-[var(--sl-text)]"
			>
				<SheetHeader className="shrink-0 border-b border-[var(--sl-border)] px-5 py-4">
					<SheetTitle className="text-left text-base font-bold text-[var(--sl-text)]">
						Menu
					</SheetTitle>
				</SheetHeader>

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
												: "border-[var(--sl-border)] bg-[var(--sl-surface-2)] text-[var(--sl-text)]",
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
											<ChevronDown className="size-4" />
										) : (
											<ChevronRight className="size-4" />
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
										key={item.id}
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

				<div className="shrink-0 space-y-3 border-t border-[var(--sl-border)] bg-[var(--sl-surface)] p-4">
					<button
						type="button"
						onClick={() =>
							window.open(
								"https://discord.com",
								"_blank",
								"noopener,noreferrer",
							)
						}
						className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
					>
						<MessageCircle className="size-4" />

						<span>Join Discord</span>
					</button>

<PlayerCard />
				</div>
			</SheetContent>
		</Sheet>
	);
}