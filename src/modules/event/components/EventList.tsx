"use client";

import { EVENT_CONFIG } from "../config/event.config";

import EventCard from "./EventCard";

export default function EventList() {
	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
			{EVENT_CONFIG.map((event) => (
				<EventCard key={event.id} event={event} />
			))}
		</div>
	);
}
