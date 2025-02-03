import { fail, superValidate } from 'sveltekit-superforms';
import type { Actions, PageServerLoad } from './$types';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { getUser } from '$lib/utils';
import { redirect } from '@sveltejs/kit';

const schema = z.object({
	code: z.string().min(6)
});

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = getUser({ locals, redirectUrl: url.pathname });

	const form = await superValidate(zod(schema));

	return { form, user };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) return fail(400, { form });

		const { code } = form.data;

		if (code) return redirect(302, `/clubs/join/${code}`);

		return { form };
	}
};
