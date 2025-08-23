import { getUser, isActive } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { newChallenge, newEntry } from '$lib/zod';
import { checkAdmin, db, getLeaderBoard } from '$lib/db';
import { challenge, challengeMember, clubMember, discipline, entry } from '$lib/db/schema';
import { and, eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ parent }) => {
	const { challenge } = await parent();

	const leaderboard = getLeaderBoard(challenge.id);
	const newEntryForm = await superValidate(zod(newEntry));

	const lastActivities = await db.query.entry.findMany({
		where(fields, operators) {
			return operators.eq(fields.challengeId, challenge.id);
		},
		limit: 10,
		orderBy(fields, operators) {
			return operators.desc(fields.createdAt);
		},
		with: {
			user: true,
			discipline: true
		}
	});

	return { leaderboard, newEntryForm, lastActivities };
};

export const actions: Actions = {
	newEntry: async ({ request, params, locals, url }) => {},
	deleteChallenge: async ({ locals, url, params }) => {},
	editChallenge: async ({ locals, url, params, request }) => {},
	leave: async ({ locals, url, params }) => {}
};
