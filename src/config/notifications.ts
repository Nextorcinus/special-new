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
	active: boolean;
	href: string | null;
};