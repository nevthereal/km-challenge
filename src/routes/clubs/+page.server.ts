import { db } from '$lib/db';
import { getUser, isSuperUser } from '$lib/utils';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { clubMember } from '$lib/db/schema';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = getUser(locals, url.pathname);

	const superUser = isSuperUser(locals, url.pathname);

	const usersClubs = await db.query.clubMember.findMany({
		where: eq(clubMember.userId, user.id),
		with: {
			club: {
				with: {
					challenges: true,
					members: true
				}
			}
		}
	});

	return { usersClubs, superUser };
};
