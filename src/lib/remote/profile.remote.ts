import { form, query } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { auth } from '#lib/auth/index.ts';
import { userSetup } from '#lib/zod.ts';
import { requireUser } from '#lib/server/request-user.ts';
import { getRequestEvent } from '$app/server';

export const getProfile = query(async () => {
	return {
		user: requireUser()
	};
});

export const updateProfile = form(userSetup, async ({ role, username: name, gender }) => {
	requireUser();
	const event = getRequestEvent();
	await auth.api.updateUser({
		headers: event.request.headers,
		body: { role, name, gender }
	});

	const redirectUrl = getRequestEvent().url.searchParams.get('redirect');

	let destination = '/profile';
	try {
		const target = new URL(redirectUrl || destination, event.url);
		if (target.origin === event.url.origin)
			destination = target.pathname + target.search + target.hash;
	} catch {
		// Invalid return URLs fall back to the profile page.
	}
	redirect(303, destination);
});
