import { db, getLeaderBoard } from '$lib/db';
import { challenge, challengeMember } from '$lib/db/schema';
import { lte, gte, and, getColumns, eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newEntry } from '$lib/zod';
import { getDaysRemainingForEntry, canAddEntries } from '$lib/utils';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;

	if (user) {
		const now = new Date();
		// Set to start of day (00:00:00.000)
		const startOfToday = new Date(now);
		startOfToday.setHours(0, 0, 0, 0);

		// Set to end of day (23:59:59.999)
		const endOfToday = new Date(now);
		endOfToday.setHours(23, 59, 59, 999);

		const activeChallenges = await db
			.select({
				...getColumns(challenge)
			})
			.from(challengeMember)
			.innerJoin(challenge, eq(challengeMember.challengeId, challenge.id))
			.where(
				and(
					eq(challengeMember.userId, user.id),
					// Challenge starts at or before end of today
					lte(challenge.startsAt, endOfToday),
					// Challenge ends at or after start of today
					gte(challenge.endsAt, startOfToday)
				)
			)
			.groupBy(challenge.id);

		const newEntryForm = await superValidate(zod4(newEntry));

		const challengesWithLeaderboards = activeChallenges.map(async (c) => {
			const disciplines = await db.query.discipline.findMany({
				where: {
					challengeId: c.id
				}
			});
			const leaderboard = getLeaderBoard.execute({ challengeId: c.id, limit: 5 });
			return { ...c, leaderboard, disciplines };
		});

		// Fetch challenges still open for entries (within 2-day grace period after end date)
		const gracePeriodEnd = new Date();
		gracePeriodEnd.setUTCDate(gracePeriodEnd.getUTCDate() + 2);
		gracePeriodEnd.setUTCHours(23, 59, 59, 999);

		const openForEntriesChallenges = await db
			.select({
				...getColumns(challenge)
			})
			.from(challengeMember)
			.innerJoin(challenge, eq(challengeMember.challengeId, challenge.id))
			.where(
				and(
					eq(challengeMember.userId, user.id),
					// Challenge has ended
					lte(challenge.endsAt, endOfToday),
					// Challenge is still within grace period
					gte(challenge.endsAt, new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000))
				)
			)
			.groupBy(challenge.id);

		const openForEntriesChallengesWithDays = openForEntriesChallenges
			.filter((c) => canAddEntries(c))
			.map((c) => ({
				...c,
				daysRemaining: getDaysRemainingForEntry(c)
			}));

		return {
			challengesWithLeaderboards,
			user,
			newEntryForm,
			openForEntriesChallenges: openForEntriesChallengesWithDays
		};
	}
};
