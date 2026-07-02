type BuildingSelectProps = {
	value: string;
	onChange: (value: string) => void;
	options: string[];
	dark?: boolean;
};

export default function BuildingSelect({
	value,
	onChange,
	options,
	dark = false,
}: BuildingSelectProps) {
	return (
		<select
			value={value}
			onChange={(event) => onChange(event.target.value)}
			className={`h-12 w-full rounded-xl px-3 text-sm outline-none ${
				dark ? "bg-[#292929] text-white" : "bg-white text-black"
			}`}
		>
			{options.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
	);
}