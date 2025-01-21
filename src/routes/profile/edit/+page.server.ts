import { getUser } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { userSetup } from '$lib/zod';
import type { Actions } from './$types';
import { db } from '$lib/db';
import { user } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = getUser(locals, url.pathname);

	const form = await superValidate(zod(userSetup), {
		defaults: {
			gender: user.gender as string | undefined,
			role: user.role as string | undefined,
			username: user.name
		}
	});

	return { form };
};

export const actions: Actions = {
	default: async ({ locals, request, url }) => {
		const currentUser = getUser(locals, url.pathname);

		const form = await superValidate(request, zod(userSetup));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { role, username: name, gender } = form.data;

		await db
			.update(user)
			.set({
				role,
				name,
				gender
			})
			.where(eq(user.id, currentUser.id));

		const redirectUrl = url.searchParams.get('redirect');

		return redirect(302, redirectUrl || '/profile');
	}
};
