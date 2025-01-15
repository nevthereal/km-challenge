import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const challenges = await db.query.competition.findMany({
		with: {
			participations: true
		}
	});
	return { challenges };
};
