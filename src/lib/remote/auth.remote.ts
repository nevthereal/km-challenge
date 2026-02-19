import { query, getRequestEvent } from '$app/server';
import { auth } from '$lib/auth';
import { requireUser } from '$lib/server/auth-helpers';

export const getCurrentUser = query(async () => {
	return { user: requireUser() };
});

export const getLayoutSession = query(async () => {
	const { request } = getRequestEvent();
	const session = await auth.api.getSession({ headers: request.headers });
	return { session };
});
