import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { challenge } from '$lib/db/schema';
import { redirect } from '@sveltejs/kit';
import { getUser } from '$lib/utils';

export const load: PageServerLoad = async ({ params, locals }) => {
	getUser(locals);
	const { id: paramId } = params;

	const qchallenge = await db.query.challenge.findFirst({
		where: eq(challenge.id, paramId),
		with: {
			participations: true,
			entries: true
		}
	});

	if (!qchallenge) return redirect(302, '/challenges');

	return { challenge: qchallenge };
};
