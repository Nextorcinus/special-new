import { notFound } from "next/navigation";

import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";
import { ExpertsCalculator } from "@/modules/experts/components/ExpertsCalculator";
import { EXPERTS } from "@/modules/experts/data";

interface ExpertDetailPageProps {
	params: Promise<{
		expertId: string;
	}>;
}

export default async function ExpertDetailPage({
	params,
}: ExpertDetailPageProps) {
	const { expertId } = await params;

	const expert = EXPERTS.find(
		(item) => item.id === decodeURIComponent(expertId),
	);

	if (!expert) {
		notFound();
	}

	return (
		<MobileContainer>
			<HeaderOther title={expert.name} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] px-1 py-1">
				<ExpertsCalculator />
			</div>
		</MobileContainer>
	);
}
