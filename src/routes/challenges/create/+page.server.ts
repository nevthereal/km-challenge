import { createProjectSchema } from '$lib/zod';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { competition } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
	const createForm = await superValidate(zod(createProjectSchema));

	return { createForm };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(createProjectSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { endsAt, name, startsAt } = form.data;

		const [{ id: challengeId }] = await db
			.insert(competition)
			.values({
				creatorId: 'hallol',
				endsAt,
				name,
				startsAt
			})
			.returning();

		redirect(302, `challenges/${challengeId}`);
	}
};
