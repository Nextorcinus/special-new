import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";
import PetCategoriesPage from "@/modules/pets/components/PetCategoriesPage";
import petDatabase from "@/modules/pets/data/pets.json";
import type { PetDatabase } from "@/modules/pets/type";

export default function PetsPage() {
	return (
		<MobileContainer>
			<HeaderOther title="Pet Calculator" />

			<div className="mt-8 px-1 py-1">
				<PetCategoriesPage database={petDatabase as PetDatabase} />
			</div>
		</MobileContainer>
	);
}
