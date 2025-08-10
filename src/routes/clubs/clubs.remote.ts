import { query } from '$app/server';
import { db } from '$lib/db';
import { getUser } from '$lib/auth.remote';
import { z } from 'zod';

export const getUsersClubs = query(z.string(), async (redirectUrl) => {
	const user = await getUser(redirectUrl);

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

	return usersClubs[0].clubs;
});
