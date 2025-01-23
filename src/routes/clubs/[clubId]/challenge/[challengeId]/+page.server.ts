import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { challenge, discipline } from '$lib/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { getUser } from '$lib/utils';
import { fail, superValidate } from 'sveltekit-superforms';
import { addDisciplines, newEntry } from '$lib/zod';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const user = getUser(locals, url.pathname);
	const { challengeId } = params;

	const qchallenge = await db.query.challenge.findFirst({
		where: eq(challenge.id, challengeId),
		with: {
			members: true,
			entries: {
				with: {
					user: true
				}
			},
			disciplines: true
		}
	});

	if (!qchallenge) return redirect(302, '/challenges');

	const addDisciplineForm = await superValidate(zod(addDisciplines), {
		defaults: {
			discipline: [
				{
					name: '',
					multiplier: 1
				}
			]
		}
	});

	const newEntryForm = await superValidate(zod(newEntry));

	return { challenge: qchallenge, user, addDisciplineForm, newEntryForm };
};

export const actions: Actions = {
	addDiscipline: async ({ request, params, locals }) => {
		const user = getUser(locals);

		if (!user.superUser) return error(401);

		const form = await superValidate(request, zod(addDisciplines));

		if (!form.valid) return fail(400, { form });

		for (const d of form.data.discipline) {
			await db.insert(discipline).values({
				factor: d.multiplier.toString(),
				name: d.name,
				challengeId: params.challengeId
			});
		}
	},
	newEntry: async ({ locals, request }) => {
		console.log('hit');
		const form = await superValidate(request, zod(newEntry));
		console.log(form.data);
	}
};
