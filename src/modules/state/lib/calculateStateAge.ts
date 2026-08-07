export function calculateStateAge(createdAt: Date): number {
	return Math.floor((Date.now() - createdAt.getTime()) / 86_400_000);
}
