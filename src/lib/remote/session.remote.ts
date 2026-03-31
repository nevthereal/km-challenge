import { getRequestEvent, query } from '$app/server';
import { getCurrentUser } from '$lib/server/request-user';

export const getSessionState = query(async () => {
	const { locals } = getRequestEvent();

	return {
		session: locals.session,
		user: getCurrentUser()
	};
});
