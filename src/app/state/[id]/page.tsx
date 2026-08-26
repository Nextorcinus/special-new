import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";

import StateDetail from "@/modules/state/components/StateDetail";

type Props = {
	params: Promise<{
		id: string;
	}>;
};

export default async function StateDetailPage({ params }: Props) {
	const { id } = await params;

	return (
		<MobileContainer>
			<HeaderOther title={`State ${id}`} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] p-4">
				<StateDetail stateId={Number(id)} />
			</div>
		</MobileContainer>
	);
}
