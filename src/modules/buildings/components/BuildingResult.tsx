"use client";

type BuildingResultProps = {
	result: any;
};

function formatNumber(value: unknown) {
	if (value === undefined || value === null) return "-";

	const num = Number(value);

	if (Number.isNaN(num)) return String(value);

	return new Intl.NumberFormat().format(Math.round(num));
}

export default function BuildingResult({ result }: BuildingResultProps) {
	if (!result) return null;

	const resources = result.resources || {};

	return (
		<div className="rounded-2xl border border-white/10 bg-special-inside p-4">
			<div className="space-y-6">
				<h2 className="text-xl font-bold text-white">Result</h2>

				<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
					<div className="rounded-lg bg-special p-4">
						<div className="text-sm text-gray-400">Meat</div>
						<div className="text-xl font-bold text-white">{formatNumber(resources.Meat)}</div>
					</div>

					<div className="rounded-lg bg-special p-4">
						<div className="text-sm text-gray-400">Wood</div>
						<div className="text-xl font-bold text-white">{formatNumber(resources.Wood)}</div>
					</div>

					<div className="rounded-lg bg-special p-4">
						<div className="text-sm text-gray-400">Coal</div>
						<div className="text-xl font-bold text-white">{formatNumber(resources.Coal)}</div>
					</div>

					<div className="rounded-lg bg-special p-4">
						<div className="text-sm text-gray-400">Iron</div>
						<div className="text-xl font-bold text-white">{formatNumber(resources.Iron)}</div>
					</div>

					{resources.Crystal > 0 && (
						<div className="rounded-lg bg-special p-4">
							<div className="text-sm text-gray-400">Fire Crystal</div>
							<div className="text-xl font-bold text-white">{formatNumber(resources.Crystal)}</div>
						</div>
					)}

					{resources.RFC > 0 && (
						<div className="rounded-lg bg-special p-4">
							<div className="text-sm text-gray-400">Refined Fire Crystal</div>
							<div className="text-xl font-bold text-white">{formatNumber(resources.RFC)}</div>
						</div>
					)}

					<div className="rounded-lg bg-special p-4">
						<div className="text-sm text-gray-400">Original Time</div>
						<div className="text-xl font-bold text-white">{result.timeOriginal}</div>
					</div>

					<div className="rounded-lg bg-special p-4">
						<div className="text-sm text-gray-400">Reduced Time</div>
						<div className="text-xl font-bold text-white">{result.timeReduced}</div>
					</div>

					<div className="rounded-lg bg-special p-4">
						<div className="text-sm text-gray-400">SvS Points</div>
						<div className="text-xl font-bold text-white">{formatNumber(result.svsFinal)}</div>
					</div>
				</div>
			</div>
		</div>
	);
}