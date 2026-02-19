import { form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/db';
import { user } from '$lib/db/schema';
import { requireUser } from '$lib/server/auth-helpers';
import { redirect } from '@sveltejs/kit';
import { userSetup } from '$lib/zod';
import { eq } from 'drizzle-orm';

export const getProfileData = query(async () => {
	return { user: requireUser() };
});

export const getProfileEditData = query(async () => {
	const currentUser = requireUser();

	return {
		defaults: {
			gender: currentUser.gender as string | undefined,
			role: currentUser.role as string | undefined,
			username: currentUser.name
		}
	};
});

export const updateProfile = form(userSetup, async ({ role, username: name, gender }) => {
	const currentUser = requireUser();
	const { url } = getRequestEvent();

	await db
		.update(user)
		.set({
			role,
			name,
			gender
		})
		.where(eq(user.id, currentUser.id));

	const redirectUrl = url.searchParams.get('redirect');
	redirect(302, redirectUrl || '/profile');
});
