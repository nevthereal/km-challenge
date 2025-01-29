import { db } from '$lib/db';
import { challengeMember } from '$lib/db/schema';
import { getUser } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, url }) => {
	const user = getUser(locals, url.pathname);

	const challengeId = url.searchParams.get('id');

	if (!challengeId) return error(400, 'No ID provided');

	await db.insert(challengeMember).values({
		challengeId: challengeId,
		userId: user.id
	});

	return new Response('success');
};
