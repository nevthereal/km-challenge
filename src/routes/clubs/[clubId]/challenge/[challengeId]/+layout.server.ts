import { checkAdmin, db } from '$lib/db';
import { zod4 } from 'sveltekit-superforms/adapters';

import type { LayoutServerLoad } from './$types';

import { error, redirect } from '@sveltejs/kit';
import { getUser } from '$lib/utils';
import { superValidate } from 'sveltekit-superforms';

import { createChallenge } from '$lib/zod';

export const load: LayoutServerLoad = async ({ params, locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });
	const { challengeId } = params;

	if (!user.completedProfile) return redirect(302, '/profile/edit');

	const qChallenge = await db.query.challenge.findFirst({
		where: { id: challengeId },
		with: {
			members: true,
			entries: {
				with: {
					user: true,
					discipline: true
				}
			},
			disciplines: true
		}
	});

	if (!qChallenge) return error(404, 'Challenge nicht gefunden');

	const currentUserChallenge = await db.query.challengeMember.findFirst({
		where: { challengeId, userId: user.id }
	});

	const currentUserClub = await db.query.clubMember.findFirst({
		where: { clubId: qChallenge.clubId, userId: user.id }
	});

	if (!currentUserClub) return redirect(302, '/clubs');

	const clubAdmin = await checkAdmin(params.clubId, user.id);

	const challengePath = `/clubs/${params.clubId}/challenge/${params.challengeId}`;

	const editForm = await superValidate(zod4(createChallenge));

	return {
		challenge: qChallenge,
		user,
		currentUserChallenge,
		clubAdmin,
		challengePath,
		editForm
	};
};
