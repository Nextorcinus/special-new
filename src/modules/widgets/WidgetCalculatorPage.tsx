"use client";

import { Calculator, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import SLButton from "@/components/ui/sl-ui/SLButton";

import { calculateWidget, normalizeWidgetDatabase } from "./calculator";
import WidgetForm from "./components/WidgetForm";
import WidgetResult from "./components/WidgetResult";
import type {
	WidgetCalculationResult,
	WidgetDatabaseItem,
	WidgetFormValues,
	WidgetLevelData,
} from "./type";

type RawWidgetItem = {
	heroes: string;
	exploration: string;
	expedition: string;
	status?: string;
	levels?: WidgetLevelData[];
};

type WidgetCalculatorPageProps = {
	data: RawWidgetItem[];
};

const DEFAULT_FORM_VALUES: WidgetFormValues = {
	heroId: "",
	fromLevel: "",
	toLevel: "",
};

export default function WidgetCalculatorPage({
	data,
}: WidgetCalculatorPageProps) {
	const [result, setResult] = useState<WidgetCalculationResult | null>(null);

	const [formValues, setFormValues] =
		useState<WidgetFormValues>(DEFAULT_FORM_VALUES);

	const [formKey, setFormKey] = useState(0);

	const widgetData = useMemo<WidgetDatabaseItem[]>(() => {
		if (!Array.isArray(data)) {
			return [];
		}

		return normalizeWidgetDatabase(data);
	}, [data]);

	function handleCalculate(values: WidgetFormValues) {
		try {
			const calculationResult = calculateWidget({
				data: widgetData,
				values,
			});

			setFormValues(values);
			setResult(calculationResult);

			toast.success("Widget calculation completed.");
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Unable to calculate widget upgrade.";

			toast.error(message);
		}
	}

	function handleReset() {
		setResult(null);
		setFormValues(DEFAULT_FORM_VALUES);
		setFormKey((current) => current + 1);
	}

	function handleNewCalculation() {
		handleReset();

		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}

	if (!widgetData.length) {
		return (
			<div className="rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)] p-5">
				<p className="text-sm font-bold text-[var(--sl-text)]">
					Widget data is unavailable
				</p>

				<p className="mt-2 text-xs leading-5 text-[var(--sl-text-muted)]">
					The widget database could not be loaded.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<section className="overflow-hidden rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-surface)]">
				<div className="border-b border-[var(--sl-border)] px-4 py-4">
					<div className="flex items-start gap-3">
						<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sl-primary)] text-[var(--sl-primary-foreground)]">
							<Calculator className="size-5" />
						</div>

						<div className="min-w-0">
							<h1 className="text-base font-bold text-[var(--sl-text)]">
								Widget Calculator
							</h1>

							<p className="mt-1 text-xs leading-5 text-[var(--sl-text-muted)]">
								Calculate the required resources, power increase, and widget
								bonuses.
							</p>
						</div>
					</div>
				</div>

				<div className="p-4">
					<WidgetForm
						key={formKey}
						data={widgetData}
						initialValues={formValues}
						onSubmit={handleCalculate}
						onReset={handleReset}
					/>
				</div>
			</section>

			{result && (
				<section className="space-y-4">
					<WidgetResult result={result} title="Widget Result" />

					<SLButton
						type="button"
						variant="secondary"
						onClick={handleNewCalculation}
						className="w-full"
					>
						<RotateCcw className="size-4" />
						New Calculation
					</SLButton>
				</section>
			)}
		</div>
	);
}
