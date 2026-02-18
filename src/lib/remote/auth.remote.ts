import { getRequestEvent, query } from '$app/server';
import { auth } from '$lib/auth';
import { getUser } from '$lib/utils';

export function requireUser() {
	const { locals, url } = getRequestEvent();
	return getUser({ locals, redirectUrl: url.pathname });
}

export const getCurrentUser = query(async () => {
	return { user: requireUser() };
});

export const getLayoutSession = query(async () => {
	const { request } = getRequestEvent();
	const session = await auth.api.getSession({ headers: request.headers });
	return { session };
});
