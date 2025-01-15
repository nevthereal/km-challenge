import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { competition } from '$lib/db/schema';
import { redirect } from '@sveltejs/kit';
import { checkUser } from '$lib/utils';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = checkUser(locals);
	const { id: paramId } = params;

	const competition = await db.query.competitionTable.findFirst({
		where: eq(competition.id, paramId),
		with: {
			participations: true,
			entries: true
		}
	});

	if (!competition) return redirect(302, '/challenges');

	return { competition };
};
