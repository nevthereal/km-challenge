import { signInGoogle } from '$lib/auth/utils';
import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ request, url }) => {
	const challenges = await db.query.challenge.findMany();

	await signInGoogle(url.pathname, request.headers);
	return { challenges };
};
