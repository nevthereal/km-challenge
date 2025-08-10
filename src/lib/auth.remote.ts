import { getRequestEvent, query } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const getUser = query(z.string(), async (redirectUrl) => {
	const { user } = getRequestEvent().locals;

	if (!user) return redirect(302, `/signin?redirect=${redirectUrl}`);

	const superUser = user.admin || user.role === 'Coach';
	const completedProfile = user.role != null && user.gender != null;

	return { ...user, superUser, completedProfile };
});
