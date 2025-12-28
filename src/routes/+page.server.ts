import { db, getLeaderBoard } from '$lib/db';
import { challenge, challengeMember } from '$lib/db/schema';
import { lte, gte, and, getColumns, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { newEntry } from '$lib/zod';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;

	if (user) {
		const activeChallenges = await db
			.select({
				...getColumns(challenge)
			})
			.from(challengeMember)
			.innerJoin(challenge, eq(challengeMember.challengeId, challenge.id))
			.where(
				and(
					eq(challengeMember.userId, user.id),
					lte(challenge.startsAt, new Date()),
					gte(challenge.endsAt, new Date())
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
