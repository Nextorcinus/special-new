"use client";

import { useEffect } from "react";

import SLButton from "@/components/ui/sl-ui/SLButton";
import SLLabel from "@/components/ui/sl-ui/SLLabel";
import SLSelect from "@/components/ui/sl-ui/SLSelect";

import useUnlockT12Form from "../hooks/useUnlockT12Form";
import type {
	UnlockT12Category,
	UnlockT12Database,
	UnlockT12FormValues,
} from "../type";

type UnlockT12FormProps = {
	category: UnlockT12Category;
	data: UnlockT12Database;
	initialValues?: Partial<UnlockT12FormValues>;
	mode?: "create" | "update";
	onSubmit: (values: UnlockT12FormValues) => void;
	onReset?: () => void;
};

export default function UnlockT12Form({
	category,
	data,
	initialValues,
	mode = "create",
	onSubmit,
	onReset,
}: UnlockT12FormProps) {
	const {
		values,
		setResearch,
		setFromLevel,
		setToLevel,
		researchOptions,
		fromLevelOptions,
		toLevelOptions,
		isComplete,
		reset,
	} = useUnlockT12Form({
		category,
		data,
		initialValues,
	});

	useEffect(() => {
		if (!values.research && researchOptions.length === 1) {
			setResearch(researchOptions[0].value);
		}
	}, [researchOptions, setResearch, values.research]);

	const handleSubmit = () => {
		if (!isComplete) {
			return;
		}

		onSubmit(values);
	};

	const handleReset = () => {
		reset();
		onReset?.();
	};

	return (
		<div className="space-y-5">
			<div className="space-y-2">
				<SLLabel>Unlock</SLLabel>

				<SLSelect
					value={values.research}
					onChange={setResearch}
					placeholder="Select unlock"
					options={researchOptions}
				/>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<div className="space-y-2">
					<SLLabel>From</SLLabel>

					<SLSelect
						value={values.fromLevel}
						onChange={setFromLevel}
						placeholder="Select level"
						options={fromLevelOptions}
						disabled={!values.research}
					/>
				</div>

				<div className="space-y-2">
					<SLLabel>To</SLLabel>

					<SLSelect
						value={values.toLevel}
						onChange={setToLevel}
						placeholder="Select level"
						options={toLevelOptions}
						disabled={!values.research || values.fromLevel === ""}
					/>
				</div>
			</div>

			<div className="flex gap-3 pt-2">
				<SLButton
					type="button"
					variant="secondary"
					className="flex-1"
					onClick={handleReset}
				>
					Reset
				</SLButton>

				<SLButton
					type="button"
					className="flex-1"
					disabled={!isComplete}
					onClick={handleSubmit}
				>
					{mode === "update" ? "Update" : "Calculate"}
				</SLButton>
			</div>
		</div>
	);
}
