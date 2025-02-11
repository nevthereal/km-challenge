import { checkAdmin, db } from '$lib/db';
import { and, eq } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';
import { challenge, challengeMember, clubMember } from '$lib/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { getUser } from '$lib/utils';

export const load: LayoutServerLoad = async ({ params, locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });
	const { challengeId } = params;

	if (!user.completedProfile) return redirect(302, '/profile/edit');

	const qChallenge = await db.query.challenge.findFirst({
		where: eq(challenge.id, challengeId),
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
		where: and(eq(challengeMember.challengeId, challengeId), eq(challengeMember.userId, user.id))
	});

	const currentUserClub = await db.query.clubMember.findFirst({
		where: and(eq(clubMember.clubId, qChallenge.clubId), eq(clubMember.userId, user.id))
	});

	if (!currentUserClub) return redirect(302, '/clubs');

	const clubAdmin = await checkAdmin(params.clubId, user.id);

	const challengePath = `/clubs/${params.clubId}/challenge/${params.challengeId}`;

	return {
		challenge: qChallenge,
		user,
		currentUserChallenge,
		clubAdmin,
		challengePath
	};
};
