import { notFound } from "next/navigation";

import HeaderOther from "@/components/layout/Header/HeaderOther";
import MobileContainer from "@/components/layout/MobileContainer";
import PetCalculatorPage from "@/modules/pets/components/PetCalculatorPage";
import petDatabase from "@/modules/pets/data/pets.json";
import type { PetData, PetDatabase } from "@/modules/pets/type";

type PetPageProps = {
	params: Promise<{
		petId: string;
	}>;
};

export default async function PetPage({ params }: PetPageProps) {
	const { petId } = await params;

	const database = petDatabase as PetDatabase;

	const pet = database.pets.find((item) => item.id === petId) as
		| PetData
		| undefined;

	if (!pet) {
		notFound();
	}

	return (
		<MobileContainer>
			<HeaderOther title={pet.name} />

			<div className="mt-8 rounded-3xl bg-[var(--sl-active)] px-1 py-1">
				<PetCalculatorPage database={database} pet={pet} />
			</div>
		</MobileContainer>
	);
}
