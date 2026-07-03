type SLSwitchProps = {
	label?: string;
	description?: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

export default function SLSwitch({
	label,
	description,
	checked,
	onCheckedChange,
}: SLSwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			onClick={() => onCheckedChange(!checked)}
			className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
				checked ? "bg-[#f7b72c]" : "bg-[#777]"
			}`}
		>
			<span
				className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
					checked ? "translate-x-4" : "translate-x-0.5"
				}`}
			/>

			{label && <span className="sr-only">{label}</span>}
			{description && <span className="sr-only">{description}</span>}
		</button>
	);
}