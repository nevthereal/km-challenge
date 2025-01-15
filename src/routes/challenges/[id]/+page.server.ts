import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { competition } from '$lib/db/schema';
import { redirect } from '@sveltejs/kit';
import { getUser } from '$lib/auth';

export const load: PageServerLoad = async ({ params, request }) => {
	getUser(request);
	const { id: paramId } = params;

	const qCompetition = await db.query.competition.findFirst({
		where: eq(competition.id, paramId),
		with: {
			participations: true,
			entries: true
		}
	});

	if (!qCompetition) return redirect(302, '/challenges');

	return { competition: qCompetition };
};
