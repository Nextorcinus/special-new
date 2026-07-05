type MobileContainerProps = {
	children: React.ReactNode;
};

export default function MobileContainer({ children }: MobileContainerProps) {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6 md:max-w-2xl md:px-8 ">
			{children}
		</main>
	);
}
