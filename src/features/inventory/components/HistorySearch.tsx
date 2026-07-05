// src/features/history/components/HistorySearch.tsx

"use client";

type HistorySearchProps = {
	value: string;
	onChange: (value: string) => void;
};

export default function HistorySearch({
	value,
	onChange,
}: HistorySearchProps) {
	return (
		<input
			value={value}
			onChange={(event) => onChange(event.target.value)}
			placeholder="Search history..."
			className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
		/>
	);
}