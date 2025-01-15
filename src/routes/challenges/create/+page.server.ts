import { createProjectSchema } from '$lib/zod';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/db';
import { competition } from '$lib/db/schema';
import { checkUser } from '$lib/utils';

export const load: PageServerLoad = async ({ locals }) => {
	const user = checkUser(locals);

	if (!user.admin && user.role != 'Coach') return redirect(302, '/');
	const createForm = await superValidate(zod(createProjectSchema));

	return { createForm };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(createProjectSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const user = checkUser(locals);

		if (!user.admin && user.role != 'Coach') return redirect(302, '/');

		const { endsAt, name, startsAt } = form.data;

		const [{ id: challengeId }] = await db
			.insert(competition)
			.values({
				creatorId: user.id,
				endsAt,
				name,
				startsAt
			})
			.returning();

		redirect(302, `/challenges/${challengeId}`);
	}
};
