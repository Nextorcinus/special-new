export type NotificationType =
	| "update"
	| "feature"
	| "announcement"
	| "maintenance";

export type NotificationItem = {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	createdAt: string;
};

export const NOTIFICATIONS: NotificationItem[] = [
	{
		id: "charm-level-18",
		type: "update",
		title: "Chief Charm Updated",
		message: "Chief Charm data now supports levels up to Lv.18.",
		createdAt: "2026-08-24T08:00:00Z",
	},
];
