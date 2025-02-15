import { db } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { editEntry } from '$lib/zod';

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

	const editForm = await superValidate(zod(editEntry));

	if (!membership) return error(400);

	return { entries, membership, editForm };
};
