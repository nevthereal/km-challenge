import { db, getLeaderBoard } from '$lib/db';
import { challenge, challengeMember } from '$lib/db/schema';
import { lte, gte, and, eq, getTableColumns } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;

	if (user) {
		const activeChallenges = await db
			.select(getTableColumns(challenge))
			.from(challenge)
			.innerJoin(challengeMember, eq(challengeMember.challengeId, challenge.id))
			.where(
				and(
					and(lte(challenge.startsAt, new Date()), gte(challenge.endsAt, new Date())),
					eq(challengeMember.userId, user.id)
				)
			);

		const challengesWithLeaderboards = activeChallenges.map(async (c) => {
			const leaderboard = await getLeaderBoard(c.id);
			return { ...c, leaderboard };
		});
		return { challengesWithLeaderboards, user };
	}
};
