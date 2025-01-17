import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { club } from '$lib/db/schema';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const qClub = await db.query.club.findFirst({
		where: eq(club.id, params.clubId),
		with: {
			challenges: {
				with: {
					members: true
				}
			},
			members: true
		}
	});

	if (!qClub) return error(404);

	return { qClub };
};
