import { getRequestEvent } from '$app/server';
import { getUser } from '$lib/utils';

export function requireUser() {
	const { locals, url } = getRequestEvent();
	return getUser({ locals, redirectUrl: url.pathname });
}
