import { db } from '$lib/db';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { challenge, discipline } from '$lib/db/schema';
import { redirect } from '@sveltejs/kit';
import { getUser } from '$lib/utils';
import { fail, superValidate } from 'sveltekit-superforms';
import { addDisciplines } from '$lib/zod';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const user = getUser(locals, url.pathname);
	const { challengeId } = params;

	const qchallenge = await db.query.challenge.findFirst({
		where: eq(challenge.id, challengeId),
		with: {
			members: true,
			entries: true,
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

	return { challenge: qchallenge, user, addDisciplineForm };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		// TODO: security

		const form = await superValidate(request, zod(addDisciplines));

		if (!form.valid) return fail(400, { form });

		for (const d of form.data.discipline) {
			await db.insert(discipline).values({
				factor: d.multiplier,
				name: d.name,
				challengeId: params.challengeId
			});
		}
	}
};
