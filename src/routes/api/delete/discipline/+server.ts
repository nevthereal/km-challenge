import { checkAdmin, db } from '$lib/db';
import { challenge, discipline } from '$lib/db/schema';
import { getUser } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });

	// get Discipline ID
	const dId = url.searchParams.get('id');

	// error if no discipline
	if (!dId) return error(400, 'No ID provided');

	// query discipline from db
	const qDiscipline = await db.query.discipline.findFirst({
		where: eq(discipline.id, dId)
	});

	// error if no discipline
	if (!qDiscipline) return error(404, 'Disziplin existiert nicht');

	// query challenge of discipline
	const qChallenge = await db.query.challenge.findFirst({
		where: eq(challenge.id, qDiscipline.challengeId)
	});

	// error if no challenge
	if (!qChallenge) return error(404, 'Challenge existiert nicht');

	// check if user is admin of challenge
	const isAdmin = checkAdmin(qChallenge.clubId, user.id);

	// error if not admin
	if (!isAdmin) return error(401, 'Nicht erlaubt');

	// actually delete
	await db.delete(discipline).where(eq(discipline.id, qDiscipline.id));

	return new Response('success');
};
