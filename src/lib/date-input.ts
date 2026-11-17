/** Challenge boundaries are stored as UTC calendar dates, not local instants. */
export function toUtcDateInputValue(date: Date | string): string {
	return new Date(date).toISOString().slice(0, 10);
}

/** Use the user's local today, clamped to the challenge's UTC calendar dates. */
export function getEntryDefaultDate(
	startsAt: Date | string,
	endsAt: Date | string,
	now = new Date()
): string {
	const today = [
		now.getFullYear(),
		String(now.getMonth() + 1).padStart(2, '0'),
		String(now.getDate()).padStart(2, '0')
	].join('-');
	const start = toUtcDateInputValue(startsAt);
	const end = toUtcDateInputValue(endsAt);
	return today < start ? start : today > end ? end : today;
}
