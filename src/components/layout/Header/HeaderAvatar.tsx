import Image from "next/image";

export default function HeaderAvatar() {
	return (
		<Image
			src="/icons/logo.png"
			alt="Avatar"
			width={48}
			height={48}
			className="rounded-full object-cover"
		/>
	);
}
