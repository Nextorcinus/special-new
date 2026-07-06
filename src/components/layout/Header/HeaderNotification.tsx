import Image from "next/image";

export default function HeaderNotification() {
	return (
		<button
			type="button"
			aria-label="Notifications"
			className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sl-surface-2)] transition-colors hover:bg-[var(--sl-surface-hover)] active:bg-[var(--ring)]"
		>
			<Image
				src="/icons/notification.png"
				alt="Notification"
				width={22}
				height={22}
			/>
		</button>
	);
}