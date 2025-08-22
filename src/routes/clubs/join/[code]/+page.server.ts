import { db } from '$lib/db';
import { getUser } from '$lib/remote/auth.remote';
import type { PageServerLoad } from './$types';
import { clubMember } from '$lib/db/schema';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, url }) => {
	const user = await getUser(url.pathname);

	const qClub = await db.query.inviteCode.findFirst({
		where: {
			code: params.code
		}
	});

	if (!qClub) return error(404, 'Einladungscode ungültig');

	const alreadyJoined = await db.query.clubMember.findFirst({
		where: {
			AND: [
				{
					clubId: qClub.clubId
				},
				{
					userId: user.id
				}
			]
		}
	});

	if (!alreadyJoined) {
		await db.insert(clubMember).values({
			clubId: qClub.clubId,
			userId: user.id
		});
	}

	return redirect(302, `/clubs/${qClub.clubId}`);
};
