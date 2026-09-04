"use client";

import { Input } from "@/components/ui/input";

type TroopNumberInputProps = {
	value: number | null | undefined;
	onChange: (value: number) => void;
	className?: string;
	disabled?: boolean;
	readOnly?: boolean;
	id?: string;
	placeholder?: string;
};

export default function TroopNumberInput({
	value,
	onChange,
	...props
}: TroopNumberInputProps) {
	const displayValue =
		value === null ||
		value === undefined ||
		value === 0
			? ""
			: Number(value).toLocaleString("en-US");

	return (
		<Input
			type="text"
			inputMode="numeric"
			value={displayValue}
			onChange={(event) => {
				const raw = event.target.value.replace(
					/,/g,
					"",
				);

				if (raw === "") {
					onChange(0);
					return;
				}

				const numeric = Number(raw);

				if (!Number.isNaN(numeric)) {
					onChange(numeric);
				}
			}}
			{...props}
		/>
	);
}