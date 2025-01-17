import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const challenges = await db.query.challenge.findMany();

	return { challenges };
};
