import { getUser } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { addDisciplines } from '$lib/zod';
import { db } from '$lib/db';
import { discipline } from '$lib/db/schema';

export const load: PageServerLoad = async () => {
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

	return { addDisciplineForm };
};

export const actions: Actions = {
	addDiscipline: async ({ request, params, locals, url }) => {
		const user = getUser({ locals, redirectUrl: url.pathname });

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
	}
};
