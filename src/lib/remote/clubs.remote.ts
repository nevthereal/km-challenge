import { query } from '$app/server';
import { db } from '$lib/db';
import { getUser } from '$lib/remote/auth.remote';
import { error, redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const getUsersClubs = query(async () => {
	const user = await getUser();

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

export const getClub = query(z.string(), async (clubId) => {
	const user = await getUser();

	const qClub = await db.query.club.findFirst({
		where: {
			id: clubId
		},
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

	if (
		!(await db.query.clubMember.findFirst({
			where: {
				AND: [
					{
						clubId: qClub.id
					},
					{
						userId: user.id
					}
				]
			}
		}))
	)
		return redirect(302, '/clubs');
	return qClub;
});
