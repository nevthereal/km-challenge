import { db } from '$lib/db';
import { getUser } from '$lib/remote/auth.remote';
import type { PageServerLoad } from './$types';
import { clubMember } from '$lib/db/schema';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const user = await getUser();

	const qClub = await db.query.inviteCode.findFirst({
		where: {
			code: params.code
		}
	});

	if (!qClub) return error(404, 'Einladungscode ungültig');

	await db.transaction(async (tx) => {
		await tx
			.insert(clubMember)
			.values({
				clubId: qClub.clubId,
				userId: user.id
			})
			.onConflictDoNothing({
				target: [clubMember.userId, clubMember.clubId]
			});
	});

	return redirect(302, `/clubs/${qClub.clubId}`);
};
