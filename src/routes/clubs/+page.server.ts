import { db } from '$lib/db';
import type { PageServerLoad } from './$types';
import { getUser } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });

	const usersClubs = await db.query.user.findMany({
		where: {
			id: user.id
		},
		with: {
			clubs: {
				with: {
					members: true,
					challenges: true
				}
			}
		}
	});

	return { usersClubs, user };
};
