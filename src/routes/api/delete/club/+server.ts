import { checkAdmin, db } from '$lib/db';
import { challenge } from '$lib/db/schema';
import { getUser } from '$lib/utils';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });

	// get challenge ID
	const idFromParams = url.searchParams.get('id');

	// error if no param
	if (!idFromParams) return error(400, 'No ID provided');

	// query challenge from db
	const qClub = await db.query.club.findFirst({
		where: ({ id }, { eq }) => eq(id, idFromParams)
	});

	// error if no club
	if (!qClub) return error(404, 'Challenge existiert nicht');

	// check if user is admin of club
	const isAdmin = checkAdmin(qClub.id, user.id);

	// error if not admin
	if (!isAdmin) return error(401, 'Nicht erlaubt');

	// actually delete
	await db.delete(challenge).where(eq(challenge.id, qClub.id));

	throw redirect(303, '/clubs');
};
