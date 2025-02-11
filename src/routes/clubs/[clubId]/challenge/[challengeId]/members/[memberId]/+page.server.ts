import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, parent }) => {
	await parent();

	const { challengeId: currentChallengeId, memberId } = params;

	const qMember = await db.query.challengeMember.findFirst({
		where: ({ challengeId, userId }, { and, eq }) =>
			and(eq(userId, memberId), eq(challengeId, currentChallengeId)),
		with: {
			user: {
				with: {
					entries: {
						where: ({ challengeId }, { eq }) => eq(challengeId, currentChallengeId),
						with: {
							discipline: true
						}
					}
				}
			}
		}
	});

	if (!qMember) return error(404, 'Dieses Mitglied existiert nicht');

	return { member: qMember.user };
};
