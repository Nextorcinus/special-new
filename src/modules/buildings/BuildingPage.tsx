import CategoriesHeader from "@/modules/categories/components/CategoriesHeader";
import BuildingCalculatorPage from "@/modules/buildings/calculator/BuildingCalculatorPage";
import type { BuildingType } from "@/modules/buildings/calculator/calculateUpgrade";

type BuildingPageProps = {
	type: BuildingType;
	data: any[];
	title: string;
};

export default function BuildingPage({ type, data, title }: BuildingPageProps) {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
			<CategoriesHeader />

			<section className="mt-8">
				<h1 className="mb-5 text-center text-sm font-semibold text-white">
					{title}
				</h1>

				<BuildingCalculatorPage type={type} data={data} />
			</section>
		</main>
	);
}