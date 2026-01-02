import { db, getLeaderBoard } from '$lib/db';
import { challenge, challengeMember } from '$lib/db/schema';
import { lte, gte, and, getColumns, eq, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newEntry } from '$lib/zod';

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
					gte(sql`date(${challenge.endsAt})`, sql`date(${startOfToday})`)
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

		return { challengesWithLeaderboards, user, newEntryForm };
	}
};
