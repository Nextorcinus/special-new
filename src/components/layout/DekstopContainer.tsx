type DesktopContainerProps = {
	sidebar: React.ReactNode;
	children: React.ReactNode;
};

export default function DesktopContainer({
	sidebar,
	children,
}: DesktopContainerProps) {
	return (
		<div className="hidden min-h-screen lg:flex">
			<aside className="w-72 border-r border-white/10">{sidebar}</aside>

			<main className="flex-1 px-10 py-8">{children}</main>
		</div>
	);
}
