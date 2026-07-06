const DAY = 24 * 60 * 60;
const HOUR = 60 * 60;
const MINUTE = 60;

export function parseDurationToSeconds(value: string): number {
	if (!value) return 0;

	let total = 0;

	const day = value.match(/(\d+)\s*d/i);
	const hour = value.match(/(\d+)\s*h/i);
	const minute = value.match(/(\d+)\s*m/i);
	const second = value.match(/(\d+)\s*s/i);

	if (day) total += Number(day[1]) * DAY;
	if (hour) total += Number(hour[1]) * HOUR;
	if (minute) total += Number(minute[1]) * MINUTE;
	if (second) total += Number(second[1]);

	return total;
}

export function formatDuration(totalSeconds: number): string {
	if (totalSeconds <= 0) return "-";

	const days = Math.floor(totalSeconds / DAY);
	totalSeconds %= DAY;

	const hours = Math.floor(totalSeconds / HOUR);
	totalSeconds %= HOUR;

	const minutes = Math.floor(totalSeconds / MINUTE);
	const seconds = totalSeconds % MINUTE;

	const parts: string[] = [];

	if (days) parts.push(`${days}d`);
	if (hours) parts.push(`${hours}h`);
	if (minutes) parts.push(`${minutes}m`);
	if (seconds) parts.push(`${seconds}s`);

	return parts.join(" ");
}
