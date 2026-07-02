import type { ResourceGroup as ResourceGroupType } from "../types";
import ResourceInput from "./ResourceInput";

type ResourceGroupProps = {
	group: ResourceGroupType;
};

export default function ResourceGroup({ group }: ResourceGroupProps) {
	return (
		<div>
			<h3 className="mb-2 text-xs text-zinc-300">{group.title}</h3>

			<div className="grid grid-cols-2 gap-3 rounded-xl bg-[#353535] p-3">
				{group.items.map((item) => (
					<ResourceInput key={item.id} item={item} />
				))}
			</div>
		</div>
	);
}
