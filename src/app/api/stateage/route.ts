import stateAge from "@/modules/state/data/state_age.json";

export async function GET() {
	return Response.json(stateAge);
}
