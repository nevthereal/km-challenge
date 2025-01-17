import { db } from '$lib/db';
import { getUser, isSuperUser } from '$lib/utils';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { clubMember } from '$lib/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	const user = getUser(locals);

	const superUser = isSuperUser(locals);

	const usersClubs = await db.query.clubMember.findMany({
		where: eq(clubMember.userId, user.id),
		with: {
			club: true
		}
	});

	return { usersClubs, superUser };
};
