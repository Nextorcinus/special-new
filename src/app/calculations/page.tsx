import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";
import CalculationCategoryGrid from "@/modules/calculations/CalculationCategoryGrid";

export default function CalculationsPage() {
	return (
		<MobileContainer>
			<HeaderOther title="Calculations" />

			<div className="mt-8 space-y-5">
				<header className="space-y-2">
					<h1 className="text-2xl font-bold tracking-tight text-[var(--sl-text)]">
						Calculations
					</h1>

					<p className="text-sm text-[var(--sl-text-muted)]">
						Choose a calculator for your event.
					</p>
				</header>

				<CalculationCategoryGrid />
			</div>
		</MobileContainer>
	);
}
