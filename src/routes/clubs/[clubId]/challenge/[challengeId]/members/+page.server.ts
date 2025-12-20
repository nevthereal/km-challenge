import { db } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent, params }) => {
	const { challenge } = await parent();
	const members = await db.query.challengeMember.findMany({
		where: { challengeId: challenge.id },
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
		where: {
			clubId: params.clubId
		}
	});

	return { members, admins };
};
