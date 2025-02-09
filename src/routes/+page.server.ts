import { db, getLeaderBoard } from '$lib/db';
import { challenge, challengeMember } from '$lib/db/schema';
import { lte, gte, and, getTableColumns, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newEntry } from '$lib/zod';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;

	if (user) {
		const activeChallenges = await db
			.select({
				...getTableColumns(challenge)
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

		// activeChallenges = activeChallenges.filter((c) => c.members.some((m) => m.userId === user.id));

		const newEntryForm = await superValidate(zod(newEntry));

		const challengesWithLeaderboards = activeChallenges.map((c) => {
			const leaderboard = getLeaderBoard(c.id);
			return { ...c, leaderboard };
		});

		return { challengesWithLeaderboards, user, newEntryForm };
	}
};
