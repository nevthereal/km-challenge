import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;

	const activeChallenges = await db.query.challenge.findMany({
		where: (fields, operators) =>
			operators.and(
				operators.lte(fields.startsAt, new Date()),
				operators.gte(fields.endsAt, new Date())
			)
	});

	console.log(activeChallenges);

	return { user, activeChallenges };
};
