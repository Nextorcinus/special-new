"use client";

import SLAccordion from "@/components/ui/sl-ui/SLAccordion";
import SLButton from "@/components/ui/sl-ui/SLButton";
import SLInput from "@/components/ui/sl-ui/SLInput";
import SLLabel from "@/components/ui/sl-ui/SLLabel";
import SLSelect from "@/components/ui/sl-ui/SLSelect";
import SLSwitch from "@/components/ui/sl-ui/SLSwitch";

import useWarAcademyForm from "../hooks/useWarAcademyForm";
import type {
	WarAcademyCategory,
	WarAcademyDatabase,
	WarAcademyFormValues,
} from "../type";

type WarAcademyFormProps = {
	category: WarAcademyCategory;
	data: WarAcademyDatabase;
	initialValues?: Partial<WarAcademyFormValues>;
	mode?: "create" | "update";
	lockMainFields?: boolean;
	onSubmit: (values: WarAcademyFormValues) => void;
	onReset?: () => void;
};

const VP_OPTIONS = [
	{
		value: "Off",
		label: "Off",
	},
	{
		value: "10%",
		label: "+10%",
	},
	{
		value: "15%",
		label: "+15%",
	},
];

const AGNES_OPTIONS = [
	{
		value: "0",
		label: "Off",
	},
	{
		value: "1",
		label: "Level 1 (-2h)",
	},
	{
		value: "2",
		label: "Level 2 (-4h)",
	},
	{
		value: "3",
		label: "Level 3 (-6h)",
	},
	{
		value: "4",
		label: "Level 4 (-8h)",
	},
	{
		value: "5",
		label: "Level 5 (-10h)",
	},
];

export default function WarAcademyForm({
	category,
	data,
	initialValues,
	mode = "create",
	lockMainFields = false,
	onSubmit,
	onReset,
}: WarAcademyFormProps) {
	const {
		values,

		researchOptions,
		fromLevelOptions,
		toLevelOptions,

		canSubmit,

		setField,
		setResearch,
		setFromLevel,
		submit,
		reset,
	} = useWarAcademyForm({
		category,
		data,
		initialValues,
		onSubmit,
		onReset,
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!canSubmit) {
			return;
		}

		submit();
	}

	function handleReset() {
		reset();
	}

	return (
		<form onSubmit={handleSubmit} className="relative space-y-4 p-4 text-[var(--sl-text)] bg-[var(--sl-surface)] rounded-2xl border border-[var(--sl-border)]">
			<div className="space-y-5 p-4">
				<div>
					<h2 className="text-sm font-bold text-[var(--sl-text)]">
						{category} War Academy
					</h2>

					<p className="mt-1 text-xs text-[var(--sl-text-muted)]">
						Select the research and upgrade range.
					</p>
				</div>

				<div className="relative z-50 space-y-1.5">				
					<SLLabel>Research</SLLabel>

						<SLSelect
							value={values.research}
							onChange={setResearch}
							placeholder="Select research"
							options={researchOptions}
							disabled={lockMainFields}
						/>
				</div>

				<div className="relative z-40 grid grid-cols-2 gap-3">
					<div className="space-y-1.5">
						<SLLabel>From</SLLabel>

						<SLSelect
							value={values.fromLevel}
							onChange={setFromLevel}
							placeholder="Select level"
							options={fromLevelOptions}
							disabled={lockMainFields || !values.research}
						/>
					</div>

					<div className="space-y-1.5">
						<SLLabel>To</SLLabel>

						<SLSelect
							value={values.toLevel}
							onChange={(value) => setField("toLevel", value)}
							placeholder="Select level"
							options={toLevelOptions}
							disabled={
								lockMainFields || !values.research || values.fromLevel === ""
							}
						/>
					</div>
				</div>

				<SLAccordion title="Configuration">
					<div className="space-y-1.5">
						<div className="space-y-1.5">
							<SLLabel>Research Speed (%)</SLLabel>

							<SLInput
								value={values.researchSpeed}
								onChange={(event) =>
									setField("researchSpeed", event.target.value)
								}
								inputMode="decimal"
								placeholder="e.g. 68 for 68%"
							/>
						</div>

						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<SLLabel>Vice President</SLLabel>

								<SLSelect
									value={values.vpLevel}
									onChange={(value) => setField("vpLevel", value)}
									options={VP_OPTIONS}
								/>
							</div>

							<div className="space-y-1.5">
								<SLLabel>Agnes Skill</SLLabel>

								<SLSelect
									value={values.agnesLevel}
									onChange={(value) => setField("agnesLevel", value)}
									options={AGNES_OPTIONS}
								/>
							</div>
						</div>

						<div className="mt-5 border-t border-[var(--sl-border)] pt-3">
	<p className="text-xs font-bold text-[var(--sl-text)]">
		Additional Bonus
	</p>

	<div className="mt-3 flex items-center justify-between gap-4">
		<div className="min-w-0 flex-1">
			<p className="text-sm font-semibold text-[var(--sl-text)]">
				Double Time
			</p>

			<p className="mt-1 text-[11px] leading-5 text-[var(--sl-text-muted)]">
				+20% Research Speed while Double Time is active.
			</p>
		</div>

		<SLSwitch
			label=""
			checked={values.doubleTime}
			onCheckedChange={(checked) =>
				setField("doubleTime", checked)
			}
		/>
	</div>
</div>
					</div>
				</SLAccordion>

				<div className="grid grid-cols-2 gap-4 pt-1">
					<button
						type="submit"
						disabled={!canSubmit}
						className="h-10 rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)] transition-colors hover:bg-[var(--sl-hover)] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{mode === "update" ? "Update" : "Submit"}
					</button>

					<SLButton
						type="button"
						onClick={handleReset}
						className="h-10 rounded-full bg-[var(--sl-input)] text-xs font-bold text-[var(--sl-text)] hover:bg-[var(--sl-input-hover)]"
					>
						Reset
					</SLButton>
				</div>
			</div>
		</form>
	);
}
