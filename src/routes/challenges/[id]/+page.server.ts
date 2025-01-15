import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { competitionTable } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import { checkUser } from '$lib/utils';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = checkUser(locals);
	const { id: paramId } = params;

	const competition = await db.query.competitionTable.findFirst({
		where: eq(competitionTable.id, paramId),
		with: {
			participations: true,
			entries: true
		}
	});

	if (!competition) return redirect(302, '/challenges');

	return { competition };
};
