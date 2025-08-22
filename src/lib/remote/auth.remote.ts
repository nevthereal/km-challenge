import { getRequestEvent, query } from '$app/server';
import { redirect } from '@sveltejs/kit';
import { z } from 'zod';

export const getUser = query(async () => {
	const {
		locals: { user },
		url
	} = getRequestEvent();

	if (!user) return redirect(302, `/signin?redirect=${url.pathname}`);

	const superUser = user.admin || user.role === 'Coach';
	const completedProfile = user.role != null && user.gender != null;

	return { ...user, superUser, completedProfile };
});
