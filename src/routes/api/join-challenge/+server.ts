import { db } from '$lib/db';
import { challenge, challengeMember, clubMember } from '$lib/db/schema';
import { getUser } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { and, eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });

	// get the challenge ID
	const challengeId = url.searchParams.get('id');

	// Check if challenge ID is here
	if (!challengeId) return error(400, 'Keine Club ID');

	// query the Challenge with the ID from the params
	const qChallenge = await db.query.challenge.findFirst({ where: eq(challenge.id, challengeId) });

	// check if challenge exists
	if (!qChallenge) return error(404, 'Club existiert nicht');

	// query user-club rel
	const userInClub = await db.query.clubMember.findFirst({
		where: and(eq(clubMember.clubId, qChallenge.clubId), eq(clubMember.userId, user.id))
	});

	// check if user is actually in the club
	if (!userInClub) return error(403, 'Nicht im Club');

	// insert challenge Membership
	await db.insert(challengeMember).values({
		challengeId: challengeId,
		userId: user.id
	});

	return new Response('success');
};
