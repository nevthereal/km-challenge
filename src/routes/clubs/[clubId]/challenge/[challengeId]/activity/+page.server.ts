import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { and, eq } from 'drizzle-orm';
import { entry } from '$lib/db/schema';
import { getUser } from '$lib/utils';

export const load: PageServerLoad = async ({ parent }) => {
	const { challenge, user } = await parent();

	const entries = await db.query.entry.findMany({
		where(fields, operators) {
			return operators.and(
				operators.eq(fields.userId, user.id),
				operators.eq(fields.challengeId, challenge.id)
			);
		},
		with: {
			discipline: true
		},
		orderBy(fields, operators) {
			return operators.desc(fields.date);
		}
	});

	const membership = await db.query.challengeMember.findFirst({
		where(fields, operators) {
			return operators.and(
				operators.eq(fields.userId, user.id),
				operators.eq(fields.challengeId, challenge.id)
			);
		},
		with: {
			user: true
		}
	});

	if (!membership) return error(400);

	return { entries, membership };
};

export const actions: Actions = {
	delete: async ({ locals, params, request, url }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });
		const formDataId = (await request.formData()).get('id');

		if (!formDataId) return error(400);

		const qEntry = await db.query.entry.findFirst({
			where: and(eq(entry.id, formDataId.toString()), eq(entry.challengeId, params.challengeId))
		});

		if (!qEntry) return error(404);

		if (qEntry.userId != user.id) return error(401);

		await db.delete(entry).where(eq(entry.id, qEntry.id));
	}
};
