import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { clubMember } from '$lib/db/schema';
import { getUser } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });

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

	return { usersClubs, user };
};
