import { getUser } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from '../$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userSetup } from '$lib/zod';
import type { Actions } from './$types';
import { auth } from '$lib/auth';

export const load: PageServerLoad = async ({ locals }) => {
	const user = getUser(locals);

	const form = await superValidate(zod(userSetup), {
		defaults: {
			username: user.name,
			role: user.role
		}
	});

	if (user.completedSetup) return redirect(302, '/');

	return { form };
};

export const actions: Actions = {
	default: async ({ locals, request }) => {
		const user = getUser(locals);

		if (user.completedSetup) return redirect(302, '/');

		const form = await superValidate(request, zod(userSetup));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { role, username: name } = form.data;

		await auth.api.updateUser({
			headers: request.headers,
			body: {
				role,
				name
			}
		});
	}
};
