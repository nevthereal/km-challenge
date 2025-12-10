import { form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/db';
import { user } from '$lib/db/schema';
import { userSetup } from '$lib/zod';
import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

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

export const editProfile = form(userSetup, async (data) => {
	const { url } = getRequestEvent();
	const currentUser = await getUser();

	const { role, username: name, gender } = data;

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
});
