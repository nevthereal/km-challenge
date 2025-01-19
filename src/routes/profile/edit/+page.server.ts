import { getUser, hasCompletedSetup } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userSetup } from '$lib/zod';
import type { Actions } from './$types';
import { auth } from '$lib/auth';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = getUser(locals, url.pathname);

	const form = await superValidate(zod(userSetup), {
		defaults: {
			gender: 'M',
			role: 'U19',
			username: user.name
		}
	});

	if (hasCompletedSetup(locals, url.pathname)) return redirect(302, '/');

	return { form };
};

export const actions: Actions = {
	default: async ({ locals, request, url }) => {
		getUser(locals, url.pathname);

		if (hasCompletedSetup(locals, url.pathname)) return redirect(302, '/');

		const form = await superValidate(request, zod(userSetup));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { role, username: name, gender } = form.data;

		await auth.api.updateUser({
			headers: request.headers,
			body: {
				role,
				name,
				gender
			}
		});
		return redirect(302, url.searchParams.get('redirect') || '/');
	}
};
