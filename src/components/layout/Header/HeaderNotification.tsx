import Image from "next/image";

export default function HeaderNotification() {
	return (
		<button
			type="button"
			className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F2F2F] transition-colors hover:bg-[#3A3A3A]"
			aria-label="Notifications"
		>
			<Image
				src="/notification.png"
				alt="Notification"
				width={22}
				height={22}
			/>
		</button>
	);
}
