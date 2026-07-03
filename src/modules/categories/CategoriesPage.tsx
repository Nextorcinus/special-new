import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";
import CategoryGrid from "./components/CategoryGrid";

export default function CategoriesPage() {
	return (
		<MobileContainer>
			<HeaderOther title="Categories" />

			<div className="mt-8">
				<CategoryGrid />
			</div>
		</MobileContainer>
	);
}
