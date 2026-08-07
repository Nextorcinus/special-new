import StateContainer from "@/modules/state/components/StateContainer";
import StateSearch from "@/modules/state/components/StateSearch";

export default function StatePage() {
	return (
		<StateContainer title="State Age">
			<StateSearch />
		</StateContainer>
	);
}
