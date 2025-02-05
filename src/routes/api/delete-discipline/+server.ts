import { checkAdmin, db } from '$lib/db';
import { challenge, discipline } from '$lib/db/schema';
import { getUser } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });

	const dId = url.searchParams.get('id');

	if (!dId) return error(400, 'No ID provided');

	const qDiscipline = await db.query.discipline.findFirst({
		where: eq(discipline.id, dId)
	});

	if (!qDiscipline) return error(404, 'Disziplin existiert nicht');

	const qChallenge = await db.query.challenge.findFirst({
		where: eq(challenge.id, qDiscipline.challengeId)
	});

	if (!qChallenge) return error(404, 'Challenge existiert nicht');

	const isAdmin = checkAdmin(qChallenge.clubId, user.id);

	if (!isAdmin) return error(401, 'Nicht erlaubt');

	await db.delete(discipline).where(eq(discipline.id, qDiscipline.id));

	return new Response('success');
};
