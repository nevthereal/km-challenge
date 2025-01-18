import { createProjectSchema } from '$lib/zod';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/db';
import { challenge } from '$lib/db/schema';
import { getUser, isSuperUser } from '$lib/utils';

export const load: PageServerLoad = async ({ locals, url }) => {
	getUser(locals, url.pathname);

	if (!isSuperUser(locals, url.pathname)) return redirect(302, '/');

	const createForm = await superValidate(zod(createProjectSchema));

	return { createForm };
};

export const actions: Actions = {
	default: async ({ locals, request, url, params }) => {
		const user = getUser(locals, url.pathname);

		const form = await superValidate(request, zod(createProjectSchema));

		if (!form.valid) {
			console.log(form.errors);
			return fail(400, { form });
		}

		if (!user.admin && user.role != 'Coach') return redirect(302, '/');

		const { endsAt, name, startsAt } = form.data;

		const [{ id: challengeId }] = await db
			.insert(challenge)
			.values({
				name,
				startsAt: new Date(startsAt),
				endsAt: new Date(endsAt),
				creatorId: user.id,
				clubId: params.clubId
			})
			.returning({ id: challenge.id });

		redirect(302, `/challenges/${challengeId}`);
	}
};
