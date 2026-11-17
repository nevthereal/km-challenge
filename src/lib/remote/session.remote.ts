import { getRequestEvent, query } from '$app/server';
import { getCurrentUser } from '#lib/server/request-user.ts';

export const getSessionState = query(async () => {
	const { locals } = getRequestEvent();

	return {
		session: locals.session ? { expiresAt: locals.session.expiresAt } : null,
		user: getCurrentUser()
	};
});
