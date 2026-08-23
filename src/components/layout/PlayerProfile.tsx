import playerData from "@/data/player.json";

type PlayerData = {
	fid: string;
	nickname: string;
	avatar_image: string;
	furnace_lv: number;
	furnace_lv_content: string;
	kid: number;
};

const player = playerData as PlayerData;

export default function PlayerProfile() {
	return (
		<div className="w-full rounded-2xl border border-zinc-100/20 bg-[#0e2642] p-3 shadow-md">
			<div className="flex items-center gap-3">
				{/* Avatar */}
				<div className="shrink-0">
					<img
						src={player.avatar_image}
						alt={player.nickname}
						className="h-16 w-16 rounded-full border-2 border-zinc-200 object-cover"
					/>
				</div>

				{/* Player Information */}
				<div className="min-w-0 flex-1">
					<p className="text-[11px] text-zinc-400">
						ID: {player.fid}
					</p>

					<h2 className="truncate text-base font-semibold text-white">
						{player.nickname}
					</h2>

					<div className="mt-1 flex items-center gap-1.5">
						<span className="text-xs font-medium text-white">
							Furnace:
						</span>

						<img
							src={player.furnace_lv_content}
							alt={`Furnace Level ${player.furnace_lv}`}
							className="h-6 w-6 object-contain"
						/>

						<span className="text-xs text-zinc-300">
							{player.furnace_lv}
						</span>
					</div>

					<p className="mt-0.5 text-xs text-zinc-300">
						State: {player.kid}
					</p>
				</div>
			</div>
		</div>
	);
}