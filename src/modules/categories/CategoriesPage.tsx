import CategoriesHeader from "./components/CategoriesHeader";
import CategoryGrid from "./components/CategoryGrid";

export default function CategoriesPage() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
			<CategoriesHeader />

			<div className="mt-8">
				<CategoryGrid />
			</div>
		</main>
	);
}
