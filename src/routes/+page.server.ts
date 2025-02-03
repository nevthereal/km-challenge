import { db, getLeaderBoard } from '$lib/db';
import { challenge } from '$lib/db/schema';
import { lte, gte, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newEntry } from '$lib/zod';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;

	if (user) {
		const activeChallenges = await db.query.challenge.findMany({
			with: {
				disciplines: true,
				members: true
			},
			where: and(lte(challenge.startsAt, new Date()), gte(challenge.endsAt, new Date()))
		});

		const newEntryForm = await superValidate(zod(newEntry));

		const challengesWithLeaderboards = activeChallenges.map((c) => {
			const leaderboard = getLeaderBoard(c.id);
			return { ...c, leaderboard };
		});

		return { challengesWithLeaderboards, user, newEntryForm };
	}
};
