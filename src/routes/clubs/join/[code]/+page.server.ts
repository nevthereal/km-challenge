import { db } from '$lib/db';
import { getUser } from '$lib/utils';
import { and, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { clubMember, inviteCode } from '$lib/db/schema';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals }) => {
	const user = getUser(locals);

	const qClub = await db.query.inviteCode.findFirst({
		where: eq(inviteCode.code, params.code)
	});

	if (!qClub) return error(404, 'Einladungscode ungültig');

	const alreadyJoined = await db.query.clubMember.findFirst({
		where: and(eq(clubMember.clubId, qClub.clubId), eq(clubMember.userId, user.id))
	});

	if (!alreadyJoined) {
		await db.insert(clubMember).values({
			clubId: qClub.clubId,
			userId: user.id
		});
	}

	return redirect(302, `/clubs/${qClub.clubId}`);
};
