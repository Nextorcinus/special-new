"use client";

import {
	ChevronDown,
	ChevronRight,
	
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

import { NAVIGATION } from "@/config/navigation";

type SidebarGroupId =
	| "chief"
	| "heroes"
	| "development";

type SidebarGroup = {
	id: SidebarGroupId;
	title: string;
};

const GROUPS: SidebarGroup[] = [
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

function isPathActive(
	pathname: string,
	href: string,
): boolean {
	return (
		pathname === href ||
		pathname.startsWith(`${href}/`)
	);
}

function getGroupItems(groupId: SidebarGroupId) {
	return NAVIGATION.filter(
		(item) => item.group === groupId,
	);
}

function hasActiveItem(
	pathname: string,
	groupId: SidebarGroupId,
) {
	return getGroupItems(groupId).some((item) =>
		isPathActive(pathname, item.href),
	);
}

export default function Sidebar() {
	const pathname = usePathname();

	const initialOpenGroups = useMemo(() => {
		return GROUPS.reduce<
			Record<SidebarGroupId, boolean>
		>(
			(result, group) => {
				result[group.id] = hasActiveItem(
					pathname,
					group.id,
				);

				return result;
			},
			{
				chief: true,
				heroes: false,
				development: false,
			},
		);
	}, [pathname]);

	const [openGroups, setOpenGroups] =
		useState<Record<SidebarGroupId, boolean>>(
			initialOpenGroups,
		);

	function toggleGroup(groupId: SidebarGroupId) {
		setOpenGroups((current) => ({
			...current,
			[groupId]: !current[groupId],
		}));
	}

	return (
		<aside className="flex h-full w-64 flex-col border-r border-[var(--sl-border)] bg-[var(--sl-background)]">
			<div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-5">
				<nav className="space-y-2">
					{GROUPS.map((group) => {
						const items = getGroupItems(
							group.id,
						);

						const isOpen =
							openGroups[group.id];

						const hasActive =
							hasActiveItem(
								pathname,
								group.id,
							);

						return (
							<div
								key={group.id}
								className="space-y-1"
							>
								<button
									type="button"
									onClick={() =>
										toggleGroup(
											group.id,
										)
									}
									className={[
										"flex w-full items-center justify-between rounded-xl px-3 py-2.5",
										"text-sm font-semibold transition-colors",
										hasActive
											? "text-[var(--sl-text)]"
											: "text-[var(--sl-text-muted)]",
										"hover:bg-[var(--sl-hover)]",
									].join(" ")}
									aria-expanded={
										isOpen
									}
								>
									<span>
										{group.title}
									</span>

									{isOpen ? (
										<ChevronDown className="size-4" />
									) : (
										<ChevronRight className="size-4" />
									)}
								</button>

								{isOpen && (
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
													<Link
														key={
															item.id
														}
														href={
															item.href
														}
														className={[
															"flex items-center gap-3 rounded-xl px-3 py-2.5",
															"text-sm font-medium transition-colors",
															active
																? "bg-[var(--sl-active)] text-[var(--sl-text)]"
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

														<span className="min-w-0 truncate">
															{
																item.title
															}
														</span>
													</Link>
												);
											},
										)}
									</div>
								)}
							</div>
						);
					})}
				</nav>

				<div className="mt-4 space-y-1 border-t border-[var(--sl-border)] pt-4">
					{[
						"troops",
						"war-academy",
						"widget",
						"state",
					].map((id) => {
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
							<Link
								key={item.id}
								href={item.href}
								className={[
									"flex items-center gap-3 rounded-xl px-3 py-2.5",
									"text-sm font-medium transition-colors",
									active
										? "bg-[var(--sl-active)] text-[var(--sl-text)]"
										: "text-[var(--sl-text-muted)] hover:bg-[var(--sl-hover)] hover:text-[var(--sl-text)]",
								].join(" ")}
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

								<span className="min-w-0 truncate">
									{
										item.title
									}
								</span>
							</Link>
						);
					})}
				</div>
			</div>

			<div className="shrink-0 space-y-3 border-t border-[var(--sl-border)] p-3">
				<a
					href="https://discord.com"
					target="_blank"
					rel="noopener noreferrer"
					className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
				>
				
					<span>Chat Me on Discord</span>
				</a>

				<div className="rounded-2xl bg-[var(--sl-active)] p-3">
					<div className="flex items-center gap-3">
						<div className="relative size-11 shrink-0 overflow-hidden rounded-full bg-[var(--sl-input)]">
							<Image
								src="/avatar/default.png"
								alt="Player"
								fill
								sizes="44px"
								className="object-cover"
							/>
						</div>

						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-bold text-[var(--sl-text)]">
								Player
							</p>

							<p className="truncate text-xs text-[var(--sl-text-muted)]">
								State #
							</p>
						</div>
					</div>
				</div>
			</div>
		</aside>
	);
}