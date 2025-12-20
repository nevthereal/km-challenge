import { db } from '$lib/db';
import type { PageServerLoad } from './$types';
import { getUser } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });

	const usersClubs = await db.query.clubMember.findMany({
		where: { userId: user.id },
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
