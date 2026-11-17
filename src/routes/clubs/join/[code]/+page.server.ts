import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '#lib/db/index.ts';
import { clubMember } from '#lib/db/schema.ts';
import { requireCompletedProfile } from '#lib/server/request-user.ts';

export const load: PageServerLoad = async ({ params }) => {
	const user = requireCompletedProfile(`/clubs/join/${encodeURIComponent(params.code)}`);

	const invite = await db.query.inviteCode.findFirst({
		where: { code: params.code }
	});

	if (!invite) {
		error(404, 'Einladungscode ungültig');
	}

	const alreadyJoined = await db.query.clubMember.findFirst({
		where: { AND: [{ clubId: invite.clubId }, { userId: user.id }] }
	});

	if (!alreadyJoined) {
		await db.insert(clubMember).values({
			clubId: invite.clubId,
			userId: user.id
		});
	}

	redirect(303, `/clubs/${invite.clubId}`);
};
