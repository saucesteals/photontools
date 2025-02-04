import type { Swap } from "./cable";

export const getEventsHistory = async (poolId: number, wallet: string) => {
	const res = await fetch(
		`https://photon-sol.tinyastro.io/api/lp/events?old_pool=false&order_by=timestamp&order_dir=desc&pool_id=${poolId}&signer=${wallet}&size=50`,
	);
	if (res.status !== 200) {
		throw new Error("Failed to fetch events history");
	}

	const data = await res.json();
	const events = data.events.data;
	if (!Array.isArray(events)) {
		throw new Error(`No events found: ${JSON.stringify(data)}`);
	}

	return events.map((event) => {
		const swap = event.attributes as Swap;
		swap.id = event.id;
		return swap;
	}) as Swap[];
};
