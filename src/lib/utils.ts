import { redirect } from '@sveltejs/kit';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type WithElementRef<T> = T & {
	ref?: HTMLElement | null;
};

export type WithoutChildren<T> = Omit<T, 'children'>;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function prettyDate(date: Date) {
	return Intl.DateTimeFormat('de', { dateStyle: 'long' }).format(date);
}

export function getUser({ locals, redirectUrl }: { locals: App.Locals; redirectUrl: string }) {
	const { user } = locals;

	if (!user) return redirect(302, `/signin?redirect=${redirectUrl}`);

	const superUser = user.admin || user.role === 'Coach';
	const completedProfile = user.role != null && user.gender != null;

	return { ...user, superUser, completedProfile };
}

/**
 * Challenge status utilities
 * These functions handle challenge date logic ensuring challenges remain active through the entire end date
 * All day boundaries are calculated using UTC timezone for consistency across servers
 */

/**
 * Sets time to start of day (00:00:00.000 UTC)
 * Uses UTC timezone to ensure consistent day boundaries across all servers
 */
function startOfDay(date: Date): Date {
	const d = new Date(date);
	d.setUTCHours(0, 0, 0, 0);
	return d;
}

/**
 * Sets time to end of day (23:59:59.999 UTC)
 * Uses UTC timezone to ensure consistent day boundaries across all servers
 */
function endOfDay(date: Date): Date {
	const d = new Date(date);
	d.setUTCHours(23, 59, 59, 999);
	return d;
}

/**
 * Checks if a challenge is currently active (running)
 * A challenge is active if the current time is between the start date (00:00) and end date (23:59:59.999)
 * This ensures the challenge remains active throughout the entire last day
 */
export function isChallengeActive(challenge: { startsAt: Date; endsAt: Date }): boolean {
	const now = new Date();
	const start = startOfDay(challenge.startsAt);
	const end = endOfDay(challenge.endsAt);
	return now >= start && now <= end;
}

/**
 * Checks if a challenge is upcoming (hasn't started yet)
 */
export function isChallengeUpcoming(challenge: { startsAt: Date; endsAt: Date }): boolean {
	const now = new Date();
	const start = startOfDay(challenge.startsAt);
	return now < start;
}

/**
 * Checks if a challenge has ended
 */
export function isChallengePast(challenge: { startsAt: Date; endsAt: Date }): boolean {
	const now = new Date();
	const end = endOfDay(challenge.endsAt);
	return now > end;
}

/**
 * Calculates the number of days remaining for entry submissions (grace period)
 * Returns the number of days until entries can no longer be added (grace period ends)
 * Returns 0 or negative if the grace period has already ended
 */
export function getDaysRemainingForEntry(challenge: { endsAt: Date }): number {
	const now = new Date();
	const gracePeriodEnd = new Date(challenge.endsAt);
	gracePeriodEnd.setUTCDate(gracePeriodEnd.getUTCDate() + 2);
	gracePeriodEnd.setUTCHours(23, 59, 59, 999);

	const millisecondsRemaining = gracePeriodEnd.getTime() - now.getTime();
	const daysRemaining = Math.ceil(millisecondsRemaining / (1000 * 60 * 60 * 24));

	return daysRemaining;
}

/**
 * Checks if entries can still be added to a challenge (within grace period after end date)
 */
export function canAddEntries(challenge: { endsAt: Date }): boolean {
	return getDaysRemainingForEntry(challenge) > 0;
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use isChallengeActive instead
 */
export function isActive({ start, finish }: { start: Date; finish: Date }) {
	return isChallengeActive({ startsAt: start, endsAt: finish });
}
