import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { challengeMember } from '$lib/db/schema';

export const load: PageServerLoad = async ({ parent, params }) => {
	const { challenge } = await parent();
	const members = await db.query.challengeMember.findMany({
		where: eq(challengeMember.challengeId, challenge.id),
		with: {
			user: {
				columns: {
					name: true,
					gender: true,
					role: true,
					id: true,
					admin: true
				}
			}
		},
		orderBy(fields, operators) {
			return operators.asc(fields.joinedAt);
		}
	});

	const admins = await db.query.clubAdmin.findMany({
		where: ({ clubId }, { eq }) => eq(clubId, params.clubId)
	});

	return { members, admins };
};
